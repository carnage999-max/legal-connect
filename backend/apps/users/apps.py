from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'

    def ready(self):
        import apps.users.signals  # noqa
        # Ensure Django Sites uses our configured domain/name in all environments
        try:
            from django.conf import settings
            from django.contrib.sites.models import Site
            from django.db.utils import OperationalError, ProgrammingError

            site_id = getattr(settings, 'SITE_ID', 1)
            domain = getattr(settings, 'SITE_DOMAIN', None)
            name = getattr(settings, 'SITE_NAME', None)
            if domain and name:
                try:
                    Site.objects.update_or_create(
                        id=site_id,
                        defaults={
                            'domain': domain,
                            'name': name,
                        },
                    )
                except (OperationalError, ProgrammingError):
                    # Database might not be ready during migrations; skip silently
                    pass
        except Exception:
            # Never break app startup due to site sync issues
            pass
