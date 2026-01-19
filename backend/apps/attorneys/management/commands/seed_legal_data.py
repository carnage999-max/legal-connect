from django.core.management.base import BaseCommand

from apps.attorneys.models import PracticeArea, Jurisdiction


DEFAULT_PRACTICE_AREAS = [
    ("Family Law", "family-law"),
    ("Criminal Defense", "criminal-defense"),
    ("Personal Injury", "personal-injury"),
    ("Immigration", "immigration"),
    ("Real Estate", "real-estate"),
    ("Employment", "employment"),
    ("Business / Corporate", "business-corporate"),
    ("Intellectual Property", "intellectual-property"),
    ("Bankruptcy", "bankruptcy"),
    ("Estate Planning", "estate-planning"),
]

DEFAULT_JURISDICTIONS = [
    ("Alabama", "AL", "United States"),
    ("Alaska", "AK", "United States"),
    ("Arizona", "AZ", "United States"),
    ("California", "CA", "United States"),
    ("Florida", "FL", "United States"),
    ("New York", "NY", "United States"),
    ("Texas", "TX", "United States"),
    ("Washington", "WA", "United States"),
]


class Command(BaseCommand):
    help = "Seed default practice areas and jurisdictions if none exist"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding legal reference data..."))

        # Practice Areas
        created_pa = 0
        for name, slug in DEFAULT_PRACTICE_AREAS:
            obj, created = PracticeArea.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": "", "is_active": True},
            )
            if created:
                created_pa += 1

        # Jurisdictions
        created_j = 0
        for name, state_code, country in DEFAULT_JURISDICTIONS:
            obj, created = Jurisdiction.objects.get_or_create(
                state_code=state_code,
                country=country,
                defaults={"name": name, "is_active": True},
            )
            if created:
                created_j += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. PracticeAreas created: {created_pa}, Jurisdictions created: {created_j}"
            )
        )

