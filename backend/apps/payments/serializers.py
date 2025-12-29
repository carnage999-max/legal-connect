from rest_framework import serializers
from .models import PaymentMethod, Payment, Refund, Subscription, Invoice, InvoiceItem


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods."""

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'method_type', 'brand', 'last_four',
            'exp_month', 'exp_year', 'is_default', 'is_active',
            'display_name', 'created_at'
        ]
        read_only_fields = ['id', 'brand', 'last_four', 'exp_month', 'exp_year', 'created_at']

    def get_display_name(self, obj):
        return f"{obj.brand} •••• {obj.last_four}"


class AddPaymentMethodSerializer(serializers.Serializer):
    """Serializer for adding a payment method via Stripe."""

    payment_method_id = serializers.CharField()
    set_default = serializers.BooleanField(default=False)


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments."""

    payer_name = serializers.CharField(source='payer.full_name', read_only=True)
    recipient_name = serializers.SerializerMethodField()
    payment_method_display = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'payer', 'payer_name', 'recipient', 'recipient_name',
            'matter', 'payment_type', 'status',
            'amount', 'currency', 'platform_fee', 'net_amount',
            'payment_method', 'payment_method_display',
            'in_escrow', 'escrow_released_at',
            'description', 'receipt_url',
            'created_at', 'completed_at'
        ]

    def get_recipient_name(self, obj):
        if obj.recipient:
            return obj.recipient.user.full_name
        return None

    def get_payment_method_display(self, obj):
        if obj.payment_method:
            return f"{obj.payment_method.brand} •••• {obj.payment_method.last_four}"
        return None


class CreatePaymentSerializer(serializers.Serializer):
    """Serializer for creating a payment."""

    matter_id = serializers.UUIDField(required=False)
    attorney_id = serializers.UUIDField(required=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_type = serializers.ChoiceField(choices=Payment.PaymentType.choices)
    payment_method_id = serializers.UUIDField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for refunds."""

    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'amount', 'status',
            'reason', 'notes', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'completed_at']


class RequestRefundSerializer(serializers.Serializer):
    """Serializer for requesting a refund."""

    payment_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reason = serializers.ChoiceField(choices=Refund.RefundReason.choices)
    notes = serializers.CharField(required=False, allow_blank=True)


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions."""

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'billing_cycle',
            'current_period_start', 'current_period_end',
            'trial_end', 'created_at', 'cancelled_at'
        ]


class SubscribeSerializer(serializers.Serializer):
    """Serializer for subscribing to a plan."""

    plan = serializers.ChoiceField(choices=Subscription.SubscriptionPlan.choices)
    billing_cycle = serializers.ChoiceField(
        choices=[('monthly', 'Monthly'), ('annual', 'Annual')]
    )
    payment_method_id = serializers.UUIDField(required=False)


class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for invoice items."""

    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""

    items = InvoiceItemSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    attorney_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client', 'client_name',
            'attorney', 'attorney_name', 'matter', 'status',
            'subtotal', 'tax', 'total', 'due_date',
            'notes', 'items', 'created_at', 'sent_at', 'paid_at'
        ]

    def get_attorney_name(self, obj):
        if obj.attorney:
            return obj.attorney.user.full_name
        return None


class CreateInvoiceSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices."""

    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = [
            'client', 'matter', 'due_date', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        attorney = self.context['request'].user.attorney_profile

        # Calculate totals
        subtotal = sum(item['quantity'] * item['unit_price'] for item in items_data)
        total = subtotal  # Add tax calculation if needed

        # Generate invoice number
        import uuid
        invoice_number = f"INV-{str(uuid.uuid4())[:8].upper()}"

        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            attorney=attorney,
            subtotal=subtotal,
            total=total,
            **validated_data
        )

        for item_data in items_data:
            item_data['total'] = item_data['quantity'] * item_data['unit_price']
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        return invoice
