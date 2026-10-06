import logging
from decimal import Decimal

import stripe
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .stripe_service import StripeNotConfigured, get_stripe, to_cents

from .models import PaymentMethod, Payment, Refund, Subscription, Invoice
from .serializers import (
    PaymentMethodSerializer, AddPaymentMethodSerializer,
    PaymentSerializer, CreatePaymentSerializer,
    RefundSerializer, RequestRefundSerializer,
    SubscriptionSerializer, SubscribeSerializer,
    InvoiceSerializer, CreateInvoiceSerializer
)
from apps.attorneys.views import IsAttorney, IsClient

logger = logging.getLogger(__name__)

PLATFORM_FEE_RATE = Decimal('0.05')


class PaymentMethodListView(generics.ListAPIView):
    """List user's payment methods."""

    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(
            user=self.request.user,
            is_active=True
        )


class AddPaymentMethodView(APIView):
    """Add a new payment method via Stripe."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddPaymentMethodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # In production, this would integrate with Stripe
        # stripe.PaymentMethod.attach(...)

        # For now, create a placeholder
        payment_method = PaymentMethod.objects.create(
            user=request.user,
            stripe_payment_method_id=serializer.validated_data['payment_method_id'],
            method_type=PaymentMethod.MethodType.CARD,
            brand='visa',  # Would come from Stripe
            last_four='4242',  # Would come from Stripe
            exp_month=12,
            exp_year=2025,
            is_default=serializer.validated_data.get('set_default', False)
        )

        if payment_method.is_default:
            PaymentMethod.objects.filter(
                user=request.user
            ).exclude(pk=payment_method.pk).update(is_default=False)

        return Response(
            PaymentMethodSerializer(payment_method).data,
            status=status.HTTP_201_CREATED
        )


class DeletePaymentMethodView(generics.DestroyAPIView):
    """Delete a payment method."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # In production, detach from Stripe
        instance.is_active = False
        instance.save()


class SetDefaultPaymentMethodView(APIView):
    """Set a payment method as default."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(
                pk=pk,
                user=request.user,
                is_active=True
            )
        except PaymentMethod.DoesNotExist:
            return Response(
                {'detail': 'Payment method not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        PaymentMethod.objects.filter(user=request.user).update(is_default=False)
        payment_method.is_default = True
        payment_method.save()

        return Response(PaymentMethodSerializer(payment_method).data)


class PaymentListView(generics.ListAPIView):
    """List user's payments."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Payment.objects.filter(
                recipient__user=user
            ).select_related('payer', 'recipient', 'matter', 'payment_method')
        return Payment.objects.filter(
            payer=user
        ).select_related('recipient', 'matter', 'payment_method')


class PaymentConfigView(APIView):
    """The publishable key the browser needs to load Stripe's own card fields."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not settings.STRIPE_PUBLIC_KEY:
            return Response(
                {'detail': 'Payments are not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response({'publishable_key': settings.STRIPE_PUBLIC_KEY})


class CreatePaymentView(APIView):
    """Start a payment: create a Stripe PaymentIntent and return its client secret.

    The browser or app then confirms the intent with Stripe directly, so card
    details never reach this server. The amount is decided here, never by the
    client: a consultation fee comes from the attorney's profile, and a service
    fee comes from the invoice. The payment is only marked completed by the
    Stripe webhook.
    """

    permission_classes = [IsClient]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            stripe_sdk = get_stripe()
        except StripeNotConfigured:
            return Response(
                {'detail': 'Payments are not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        matter = None
        recipient = None
        description = data.get('description', '')

        if data.get('invoice_id'):
            invoice = get_object_or_404(Invoice, pk=data['invoice_id'], client=request.user)
            if invoice.status not in (Invoice.InvoiceStatus.SENT, Invoice.InvoiceStatus.OVERDUE):
                return Response(
                    {'detail': 'This invoice is not payable.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            amount = invoice.total
            matter = invoice.matter
            recipient = invoice.attorney
            payment_type = Payment.PaymentType.SERVICE_FEE
            description = f'Invoice {invoice.invoice_number}'
        else:
            from apps.matters.models import Matter

            matter = get_object_or_404(Matter, pk=data['matter_id'], client=request.user)
            recipient = matter.attorney
            if not recipient:
                return Response(
                    {'detail': 'This matter has no attorney assigned yet.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if recipient.free_consultation or not recipient.consultation_fee:
                return Response(
                    {'detail': 'No consultation fee is due for this matter.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            amount = recipient.consultation_fee
            payment_type = Payment.PaymentType.CONSULTATION
            description = description or 'Consultation fee'

        same = Payment.objects.filter(
            payer=request.user, matter=matter, payment_type=payment_type, description=description
        )
        if same.filter(status=Payment.PaymentStatus.COMPLETED).exists():
            return Response({'detail': 'This has already been paid.'}, status=status.HTTP_409_CONFLICT)

        # A reload should not create a second charge: reuse a still-open intent.
        open_payment = same.filter(status=Payment.PaymentStatus.PENDING).exclude(
            stripe_payment_intent_id=''
        ).first()
        if open_payment:
            try:
                intent = stripe_sdk.PaymentIntent.retrieve(open_payment.stripe_payment_intent_id)
                if (
                    intent.status in ('requires_payment_method', 'requires_confirmation', 'requires_action')
                    and intent.amount == to_cents(amount)
                ):
                    return self._response(open_payment, intent.client_secret)
            except stripe.error.StripeError:
                logger.exception('Could not reuse PaymentIntent %s', open_payment.stripe_payment_intent_id)

        platform_fee = (amount * PLATFORM_FEE_RATE).quantize(Decimal('0.01'))
        payment = Payment.objects.create(
            payer=request.user,
            recipient=recipient,
            matter=matter,
            payment_type=payment_type,
            amount=amount,
            platform_fee=platform_fee,
            net_amount=amount - platform_fee,
            description=description,
            status=Payment.PaymentStatus.PENDING,
            in_escrow=True,  # held by the platform until the service is delivered
        )

        try:
            intent = stripe_sdk.PaymentIntent.create(
                amount=to_cents(amount),
                currency=payment.currency.lower(),
                automatic_payment_methods={'enabled': True},
                description=description,
                receipt_email=request.user.email or None,
                metadata={
                    'payment_id': str(payment.id),
                    'payer_id': str(request.user.pk),
                    'matter_id': str(matter.pk) if matter else '',
                },
                idempotency_key=f'payment-{payment.id}',
            )
        except stripe.error.StripeError:
            logger.exception('Stripe PaymentIntent creation failed for payment %s', payment.id)
            payment.status = Payment.PaymentStatus.FAILED
            payment.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'We could not start the payment. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        payment.stripe_payment_intent_id = intent.id
        payment.save(update_fields=['stripe_payment_intent_id', 'updated_at'])
        return self._response(payment, intent.client_secret)

    @staticmethod
    def _response(payment, client_secret):
        body = PaymentSerializer(payment).data
        body['client_secret'] = client_secret
        return Response(body, status=status.HTTP_201_CREATED)


class StripeWebhookView(APIView):
    """Receives signed events from Stripe and is the only thing that marks a payment paid."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = []

    def post(self, request):
        secret = settings.STRIPE_WEBHOOK_SECRET
        if not secret:
            return Response({'detail': 'Webhook not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            event = stripe.Webhook.construct_event(
                request.body,
                request.META.get('HTTP_STRIPE_SIGNATURE', ''),
                secret,
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'detail': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        obj = event['data']['object']
        kind = event['type']

        if kind == 'payment_intent.succeeded':
            self._complete(obj)
        elif kind == 'payment_intent.payment_failed':
            self._set_status(obj['id'], Payment.PaymentStatus.FAILED)
        elif kind == 'payment_intent.canceled':
            self._set_status(obj['id'], Payment.PaymentStatus.CANCELLED)
        elif kind == 'charge.refunded':
            self._refunded(obj)

        return Response({'received': True})

    @staticmethod
    def _complete(intent):
        payment = Payment.objects.filter(stripe_payment_intent_id=intent['id']).first()
        if not payment or payment.status == Payment.PaymentStatus.COMPLETED:
            return
        payment.status = Payment.PaymentStatus.COMPLETED
        payment.completed_at = timezone.now()
        charge_id = intent.get('latest_charge') or ''
        payment.stripe_charge_id = charge_id if isinstance(charge_id, str) else charge_id.get('id', '')
        if payment.stripe_charge_id:
            try:
                charge = get_stripe().Charge.retrieve(payment.stripe_charge_id)
                payment.receipt_url = charge.get('receipt_url') or ''
            except (stripe.error.StripeError, StripeNotConfigured):
                logger.warning('Could not fetch receipt for charge %s', payment.stripe_charge_id)
        payment.save()

        if payment.description.startswith('Invoice '):
            Invoice.objects.filter(
                client=payment.payer,
                invoice_number=payment.description.removeprefix('Invoice '),
            ).update(status=Invoice.InvoiceStatus.PAID, paid_at=timezone.now())

    @staticmethod
    def _set_status(intent_id, new_status):
        Payment.objects.filter(
            stripe_payment_intent_id=intent_id
        ).exclude(status=Payment.PaymentStatus.COMPLETED).update(status=new_status)

    @staticmethod
    def _refunded(charge):
        payment = Payment.objects.filter(stripe_charge_id=charge['id']).first()
        if not payment:
            return
        full = charge.get('refunded') or charge.get('amount_refunded') == charge.get('amount')
        payment.status = (
            Payment.PaymentStatus.REFUNDED if full else Payment.PaymentStatus.PARTIALLY_REFUNDED
        )
        payment.save(update_fields=['status', 'updated_at'])


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Payment.objects.filter(recipient__user=user)
        return Payment.objects.filter(payer=user)


class RequestRefundView(APIView):
    """Request a refund for a payment."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RequestRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        payment = Payment.objects.get(pk=data['payment_id'], payer=request.user)

        if payment.status != Payment.PaymentStatus.COMPLETED:
            return Response(
                {'detail': 'Can only refund completed payments.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = data.get('amount', payment.amount)
        if amount > payment.amount:
            return Response(
                {'detail': 'Refund amount cannot exceed payment amount.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        refund = Refund.objects.create(
            payment=payment,
            amount=amount,
            reason=data['reason'],
            notes=data.get('notes', ''),
            requested_by=request.user
        )

        # In production, process refund via Stripe

        return Response(RefundSerializer(refund).data, status=status.HTTP_201_CREATED)


class SubscriptionView(generics.RetrieveAPIView):
    """Get current user's subscription."""

    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        subscription, _ = Subscription.objects.get_or_create(
            user=self.request.user,
            defaults={'plan': Subscription.SubscriptionPlan.FREE}
        )
        return subscription


class SubscribeView(APIView):
    """Subscribe to a plan."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription, _ = Subscription.objects.get_or_create(user=request.user)

        subscription.plan = serializer.validated_data['plan']
        subscription.billing_cycle = serializer.validated_data['billing_cycle']
        subscription.status = Subscription.SubscriptionStatus.ACTIVE
        subscription.current_period_start = timezone.now()
        subscription.save()

        # In production, create Stripe subscription

        return Response(SubscriptionSerializer(subscription).data)


class CancelSubscriptionView(APIView):
    """Cancel subscription."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No subscription found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        subscription.status = Subscription.SubscriptionStatus.CANCELLED
        subscription.cancelled_at = timezone.now()
        subscription.save()

        return Response(SubscriptionSerializer(subscription).data)


class InvoiceListView(generics.ListAPIView):
    """List invoices."""

    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Invoice.objects.filter(
                attorney__user=user
            ).prefetch_related('items')
        return Invoice.objects.filter(
            client=user
        ).prefetch_related('items')


class InvoiceCreateView(generics.CreateAPIView):
    """Create an invoice (attorneys only)."""

    serializer_class = CreateInvoiceSerializer
    permission_classes = [IsAttorney]


class InvoiceDetailView(generics.RetrieveAPIView):
    """Get invoice details."""

    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Invoice.objects.filter(attorney__user=user)
        return Invoice.objects.filter(client=user)


class PayoutListView(APIView):
    """List payouts (completed payments) for attorneys."""

    permission_classes = [IsAttorney]

    def get(self, request):
        from apps.attorneys.models import AttorneyProfile

        try:
            profile = AttorneyProfile.objects.get(user=request.user)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all completed payments where this attorney is the recipient
        payments = Payment.objects.filter(
            recipient=profile,
            status=Payment.PaymentStatus.COMPLETED
        ).select_related('payer', 'matter').order_by('-completed_at')

        results = []
        for payment in payments:
            results.append({
                'id': str(payment.id),
                'amount': str(payment.net_amount),
                'gross_amount': str(payment.amount),
                'platform_fee': str(payment.platform_fee),
                'payment_type': payment.payment_type,
                'status': payment.status,
                'description': payment.description,
                'payer_name': f"{payment.payer.first_name} {payment.payer.last_name}" if payment.payer else 'Unknown',
                'matter_title': payment.matter.title if payment.matter else None,
                'created_at': payment.created_at.isoformat(),
                'completed_at': payment.completed_at.isoformat() if payment.completed_at else None,
            })

        return Response({
            'count': len(results),
            'results': results
        })


class EarningsSummaryView(APIView):
    """Get earnings summary for attorneys."""

    permission_classes = [IsAttorney]

    def get(self, request):
        from apps.attorneys.models import AttorneyProfile
        from django.db.models import Sum
        from datetime import datetime
        from dateutil.relativedelta import relativedelta

        try:
            profile = AttorneyProfile.objects.get(user=request.user)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - relativedelta(months=1))
        last_month_end = this_month_start

        # Total earnings (completed payments)
        total_earned = Payment.objects.filter(
            recipient=profile,
            status=Payment.PaymentStatus.COMPLETED
        ).aggregate(total=Sum('net_amount'))['total'] or 0

        # Pending payouts (in escrow, not released)
        pending_payout = Payment.objects.filter(
            recipient=profile,
            status=Payment.PaymentStatus.COMPLETED,
            in_escrow=True
        ).aggregate(total=Sum('net_amount'))['total'] or 0

        # This month's earnings
        this_month = Payment.objects.filter(
            recipient=profile,
            status=Payment.PaymentStatus.COMPLETED,
            completed_at__gte=this_month_start
        ).aggregate(total=Sum('net_amount'))['total'] or 0

        # Last month's earnings
        last_month = Payment.objects.filter(
            recipient=profile,
            status=Payment.PaymentStatus.COMPLETED,
            completed_at__gte=last_month_start,
            completed_at__lt=last_month_end
        ).aggregate(total=Sum('net_amount'))['total'] or 0

        return Response({
            'total_earned': float(total_earned),
            'pending_payout': float(pending_payout),
            'this_month': float(this_month),
            'last_month': float(last_month),
        })
