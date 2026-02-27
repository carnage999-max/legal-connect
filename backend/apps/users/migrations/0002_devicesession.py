# Generated migration for DeviceSession model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeviceSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('device_fingerprint', models.CharField(help_text='SHA256 hash of device characteristics', max_length=64)),
                ('device_name', models.CharField(default='Unknown Device', help_text='User-friendly device name', max_length=100)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True, help_text='Whether this device session is currently valid')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_active_at', models.DateTimeField(auto_now=True)),
                ('revoked_at', models.DateTimeField(blank=True, help_text='When this session was revoked', null=True)),
                ('refresh_token_version', models.IntegerField(default=1, help_text='Version counter for refresh tokens - prevents race conditions')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='device_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'device session',
                'verbose_name_plural': 'device sessions',
                'ordering': ['-last_active_at'],
                'unique_together': {('user', 'device_fingerprint')},
            },
        ),
        migrations.AddIndex(
            model_name='devicesession',
            index=models.Index(fields=['user', 'is_active'], name='users_devic_user_id_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='devicesession',
            index=models.Index(fields=['device_fingerprint'], name='users_devic_device_fingerprint_idx'),
        ),
    ]
