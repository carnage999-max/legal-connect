import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class PaymentMethod(models.Model):
    """Saved payment methods for users."""

    class MethodType(models.TextChoices):
        CARD = 'card', _('Credit/Debit Card')
        BANK = 'bank', _('Bank Account')
        APPLE_PAY = 'apple_pay', _('Apple Pay')
        GOOGLE_PAY = 'google_pay', _('Google Pay')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods'
    )

    method_type = models.CharField(
        max_length=20,
        choices=MethodType.choices,
        default=MethodType.CARD
    )

    # Stripe references
    stripe_payment_method_id = models.CharField(max_length=100)
    stripe_customer_id = models.CharField(max_length=100, blank=True)

    # Display info
    brand = models.CharField(max_length=50, blank=True)  # visa, mastercard, etc.
    last_four = models.CharField(max_length=4, blank=True)
    exp_month = models.PositiveSmallIntegerField(null=True, blank=True)
    exp_year = models.PositiveSmallIntegerField(null=True, blank=True)

    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('payment method')
        verbose_name_plural = _('payment methods')
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.brand} •••• {self.last_four}"


class Payment(models.Model):
    """Payment transactions."""

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        REFUNDED = 'refunded', _('Refunded')
        PARTIALLY_REFUNDED = 'partial_refund', _('Partially Refunded')
        CANCELLED = 'cancelled', _('Cancelled')

    class PaymentType(models.TextChoices):
        CONSULTATION = 'consultation', _('Consultation Fee')
        RETAINER = 'retainer', _('Retainer')
        SUBSCRIPTION = 'subscription', _('Subscription')
        SERVICE_FEE = 'service_fee', _('Service Fee')
        REFERRAL_FEE = 'referral_fee', _('Referral Fee')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Payer
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments_made'
    )

    # Recipient (attorney for consultation fees)
    recipient = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='payments_received'
    )

    # Related matter
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='payments'
    )

    # Payment details
    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices,
        default=PaymentType.CONSULTATION
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    # Amounts
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='USD')
    platform_fee = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    net_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Stripe references
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)
    stripe_charge_id = models.CharField(max_length=100, blank=True)
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )

    # Escrow
    in_escrow = models.BooleanField(default=False)
    escrow_released_at = models.DateTimeField(null=True, blank=True)

    # Description
    description = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('payment')
        verbose_name_plural = _('payments')
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} - ${self.amount}"


class Refund(models.Model):
    """Refund records for payments."""

    class RefundStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')

    class RefundReason(models.TextChoices):
        REQUESTED_BY_CUSTOMER = 'customer_request', _('Requested by Customer')
        DUPLICATE = 'duplicate', _('Duplicate')
        FRAUDULENT = 'fraudulent', _('Fraudulent')
        SERVICE_NOT_PROVIDED = 'service_not_provided', _('Service Not Provided')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds'
    )

    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=RefundStatus.choices,
        default=RefundStatus.PENDING
    )
    reason = models.CharField(
        max_length=30,
        choices=RefundReason.choices,
        default=RefundReason.REQUESTED_BY_CUSTOMER
    )
    notes = models.TextField(blank=True)

    stripe_refund_id = models.CharField(max_length=100, blank=True)

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='refund_requests'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('refund')
        verbose_name_plural = _('refunds')

    def __str__(self):
        return f"Refund ${self.amount} for Payment #{self.payment.id}"


class Subscription(models.Model):
    """Subscription management for users."""

    class SubscriptionPlan(models.TextChoices):
        FREE = 'free', _('Free')
        BASIC = 'basic', _('Basic')
        PROFESSIONAL = 'professional', _('Professional')
        ENTERPRISE = 'enterprise', _('Enterprise')

    class SubscriptionStatus(models.TextChoices):
        ACTIVE = 'active', _('Active')
        PAST_DUE = 'past_due', _('Past Due')
        CANCELLED = 'cancelled', _('Cancelled')
        PAUSED = 'paused', _('Paused')
        TRIAL = 'trial', _('Trial')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscription'
    )

    plan = models.CharField(
        max_length=20,
        choices=SubscriptionPlan.choices,
        default=SubscriptionPlan.FREE
    )
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE
    )

    # Stripe references
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)

    # Billing cycle
    billing_cycle = models.CharField(
        max_length=10,
        choices=[('monthly', 'Monthly'), ('annual', 'Annual')],
        default='monthly'
    )
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    # Trial
    trial_end = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')

    def __str__(self):
        return f"{self.user.email} - {self.plan}"


class Invoice(models.Model):
    """Invoices generated for services."""

    class InvoiceStatus(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        SENT = 'sent', _('Sent')
        PAID = 'paid', _('Paid')
        OVERDUE = 'overdue', _('Overdue')
        CANCELLED = 'cancelled', _('Cancelled')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)

    # Parties
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices'
    )
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='invoices'
    )

    # Invoice details
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    due_date = models.DateField()
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('invoice')
        verbose_name_plural = _('invoices')
        ordering = ['-created_at']

    def __str__(self):
        return f"Invoice {self.invoice_number}"


class InvoiceItem(models.Model):
    """Line items for invoices."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='items'
    )

    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _('invoice item')
        verbose_name_plural = _('invoice items')

    def __str__(self):
        return f"{self.description} - ${self.total}"
