from django.contrib import admin
from .models import PaymentMethod, Payment, Refund, Subscription, Invoice, InvoiceItem


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user', 'method_type', 'brand', 'last_four', 'is_default', 'is_active', 'created_at')
    list_filter = ('method_type', 'brand', 'is_default', 'is_active')
    search_fields = ('user__email', 'last_four')
    readonly_fields = ('id', 'stripe_payment_method_id', 'created_at', 'updated_at')


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ('amount', 'status', 'reason', 'created_at', 'completed_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'payer', 'recipient', 'amount', 'payment_type', 'status', 'created_at')
    list_filter = ('payment_type', 'status', 'in_escrow', 'created_at')
    search_fields = ('payer__email', 'stripe_payment_intent_id')
    readonly_fields = ('id', 'stripe_payment_intent_id', 'stripe_charge_id', 'created_at', 'updated_at')
    inlines = [RefundInline]


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('payment', 'amount', 'status', 'reason', 'created_at')
    list_filter = ('status', 'reason', 'created_at')
    search_fields = ('payment__payer__email', 'stripe_refund_id')
    readonly_fields = ('id', 'stripe_refund_id', 'created_at', 'completed_at')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'billing_cycle', 'current_period_end', 'created_at')
    list_filter = ('plan', 'status', 'billing_cycle')
    search_fields = ('user__email', 'stripe_subscription_id')
    readonly_fields = ('id', 'stripe_subscription_id', 'stripe_customer_id', 'created_at', 'updated_at')


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'client', 'attorney', 'total', 'status', 'due_date', 'created_at')
    list_filter = ('status', 'created_at', 'due_date')
    search_fields = ('invoice_number', 'client__email', 'attorney__user__email')
    readonly_fields = ('id', 'invoice_number', 'created_at', 'sent_at', 'paid_at')
    inlines = [InvoiceItemInline]
