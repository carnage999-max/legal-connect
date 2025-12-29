import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model using email as the unique identifier."""

    class UserType(models.TextChoices):
        CLIENT = 'client', _('Client')
        ATTORNEY = 'attorney', _('Attorney')
        ADMIN = 'admin', _('Admin')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    phone_number = PhoneNumberField(_('phone number'), blank=True, null=True)

    # Basic info
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    user_type = models.CharField(
        _('user type'),
        max_length=20,
        choices=UserType.choices,
        default=UserType.CLIENT
    )

    # Profile picture
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Status flags
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into admin site.')
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active.')
    )
    is_verified = models.BooleanField(
        _('verified'),
        default=False,
        help_text=_('Designates whether this user has verified their email.')
    )

    # Two-factor authentication
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)

    # Timestamps
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    last_login = models.DateTimeField(_('last login'), blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def get_short_name(self):
        return self.first_name

    @property
    def is_client(self):
        return self.user_type == self.UserType.CLIENT

    @property
    def is_attorney(self):
        return self.user_type == self.UserType.ATTORNEY


class ClientProfile(models.Model):
    """Extended profile for client users."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile',
        primary_key=True
    )

    # Personal info
    date_of_birth = models.DateField(blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='United States')

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = PhoneNumberField(blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)

    # ID verification
    id_document_type = models.CharField(max_length=50, blank=True)
    id_document_number = models.CharField(max_length=100, blank=True)
    id_document_file = models.FileField(upload_to='id_documents/', blank=True, null=True)
    id_verified = models.BooleanField(default=False)
    id_verified_at = models.DateTimeField(blank=True, null=True)

    # Preferences
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[('email', 'Email'), ('phone', 'Phone'), ('sms', 'SMS')],
        default='email'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('client profile')
        verbose_name_plural = _('client profiles')

    def __str__(self):
        return f"Client Profile: {self.user.email}"


class AuditLog(models.Model):
    """Audit log for tracking user actions."""

    class ActionType(models.TextChoices):
        LOGIN = 'login', _('Login')
        LOGOUT = 'logout', _('Logout')
        REGISTER = 'register', _('Register')
        PASSWORD_CHANGE = 'password_change', _('Password Change')
        PROFILE_UPDATE = 'profile_update', _('Profile Update')
        MATTER_CREATE = 'matter_create', _('Matter Create')
        MATTER_UPDATE = 'matter_update', _('Matter Update')
        DOCUMENT_UPLOAD = 'document_upload', _('Document Upload')
        DOCUMENT_VIEW = 'document_view', _('Document View')
        MESSAGE_SEND = 'message_send', _('Message Send')
        PAYMENT = 'payment', _('Payment')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ActionType.choices)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.created_at}"
