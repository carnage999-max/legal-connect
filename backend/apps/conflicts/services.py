import hashlib
from datetime import datetime
from django.utils import timezone
from django.db import transaction

from .models import AttorneyClientRecord, ConflictCheck, ConflictDetail
from apps.matters.models import Matter, MatterParty
from apps.attorneys.models import AttorneyProfile


class ConflictCheckService:
    """Service for performing conflict checks."""

    @staticmethod
    def hash_name(name):
        """Generate a hash for a name."""
        normalized = name.lower().strip()
        return hashlib.sha256(normalized.encode()).hexdigest()

    @classmethod
    @transaction.atomic
    def perform_conflict_check(cls, matter, requested_by=None):
        """
        Perform a conflict check for a matter.
        Returns the ConflictCheck object with results.
        """
        start_time = timezone.now()

        # Create conflict check record
        conflict_check = ConflictCheck.objects.create(
            matter=matter,
            requested_by=requested_by,
            status=ConflictCheck.CheckStatus.IN_PROGRESS,
            started_at=start_time
        )

        try:
            # Get all party names from the matter
            party_hashes = list(
                MatterParty.objects.filter(matter=matter)
                .values_list('name_hash', flat=True)
            )

            conflict_check.names_checked_count = len(party_hashes)

            if not party_hashes:
                # No parties to check
                conflict_check.status = ConflictCheck.CheckStatus.COMPLETED
                conflict_check.result = ConflictCheck.CheckResult.CLEAR
                conflict_check.completed_at = timezone.now()
                conflict_check.save()
                return conflict_check

            # Get all verified attorneys who can accept cases
            attorneys = AttorneyProfile.objects.filter(
                verification_status='verified',
                is_accepting_clients=True,
                user__is_active=True
            )

            # Filter by practice area and jurisdiction if specified
            if matter.practice_area:
                attorneys = attorneys.filter(practice_areas=matter.practice_area)
            if matter.jurisdiction:
                attorneys = attorneys.filter(jurisdictions=matter.jurisdiction)

            excluded_attorneys = []

            # Check each attorney for conflicts
            for attorney in attorneys:
                conflict_check.attorneys_checked.add(attorney)

                # Check for matching hashes in attorney's client records
                conflicting_records = AttorneyClientRecord.objects.filter(
                    attorney=attorney,
                    name_hash__in=party_hashes
                )

                if conflicting_records.exists():
                    excluded_attorneys.append(attorney)

                    # Create detail records for each conflict
                    for record in conflicting_records:
                        ConflictDetail.objects.create(
                            conflict_check=conflict_check,
                            attorney=attorney,
                            conflicting_name_hash=record.name_hash,
                            conflict_type=record.relationship_type,
                            client_record=record,
                            description=f"Conflict with {record.get_relationship_type_display()}"
                        )

            # Add excluded attorneys to the check
            conflict_check.excluded_attorneys.set(excluded_attorneys)

            # Set result
            if excluded_attorneys:
                # Check if ALL attorneys were excluded
                if len(excluded_attorneys) == attorneys.count():
                    conflict_check.result = ConflictCheck.CheckResult.CONFLICT_FOUND
                else:
                    conflict_check.result = ConflictCheck.CheckResult.POTENTIAL_CONFLICT
            else:
                conflict_check.result = ConflictCheck.CheckResult.CLEAR

            # Complete the check
            end_time = timezone.now()
            conflict_check.status = ConflictCheck.CheckStatus.COMPLETED
            conflict_check.completed_at = end_time
            conflict_check.processing_time_ms = int(
                (end_time - start_time).total_seconds() * 1000
            )
            conflict_check.save()

            # Update matter
            matter.conflict_check_completed = True
            matter.conflict_check_passed = conflict_check.result != ConflictCheck.CheckResult.CONFLICT_FOUND
            matter.conflict_check_date = end_time
            matter.status = Matter.MatterStatus.MATCHING
            matter.save()

            return conflict_check

        except Exception as e:
            # Mark as failed
            conflict_check.status = ConflictCheck.CheckStatus.FAILED
            conflict_check.completed_at = timezone.now()
            conflict_check.save()
            raise e

    @classmethod
    def get_available_attorneys(cls, matter):
        """
        Get list of attorneys who passed conflict check for a matter.
        """
        # Get the latest completed conflict check
        latest_check = ConflictCheck.objects.filter(
            matter=matter,
            status=ConflictCheck.CheckStatus.COMPLETED
        ).order_by('-completed_at').first()

        if not latest_check:
            return AttorneyProfile.objects.none()

        # Get excluded attorney IDs
        excluded_ids = latest_check.excluded_attorneys.values_list('user_id', flat=True)

        # Get available attorneys
        attorneys = AttorneyProfile.objects.filter(
            verification_status='verified',
            is_accepting_clients=True,
            user__is_active=True
        ).exclude(user_id__in=excluded_ids)

        # Filter by practice area and jurisdiction
        if matter.practice_area:
            attorneys = attorneys.filter(practice_areas=matter.practice_area)
        if matter.jurisdiction:
            attorneys = attorneys.filter(jurisdictions=matter.jurisdiction)

        return attorneys.select_related('user').prefetch_related(
            'practice_areas', 'jurisdictions'
        )

    @classmethod
    def add_client_record(cls, attorney, name, relationship_type, matter=None):
        """Add a client record for an attorney."""
        name_hash = cls.hash_name(name)

        record, created = AttorneyClientRecord.objects.get_or_create(
            attorney=attorney,
            name_hash=name_hash,
            defaults={
                'relationship_type': relationship_type,
                'matter': matter,
                'start_date': timezone.now().date()
            }
        )

        return record, created

    @classmethod
    def import_client_list(cls, attorney, names, relationship_type):
        """
        Bulk import client names for an attorney.
        Names are hashed before storage.
        """
        records = []
        for name in names:
            name_hash = cls.hash_name(name)
            records.append(
                AttorneyClientRecord(
                    attorney=attorney,
                    name_hash=name_hash,
                    relationship_type=relationship_type
                )
            )

        return AttorneyClientRecord.objects.bulk_create(
            records,
            ignore_conflicts=True
        )
