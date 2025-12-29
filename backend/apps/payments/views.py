from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone

from .models import PaymentMethod, Payment, Refund, Subscription, Invoice
from .serializers import (
    PaymentMethodSerializer, AddPaymentMethodSerializer,
    PaymentSerializer, CreatePaymentSerializer,
    RefundSerializer, RequestRefundSerializer,
    SubscriptionSerializer, SubscribeSerializer,
    InvoiceSerializer, CreateInvoiceSerializer
)
from apps.attorneys.views import IsAttorney, IsClient


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


class CreatePaymentView(APIView):
    """Create a new payment."""

    permission_classes = [IsClient]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from apps.attorneys.models import AttorneyProfile
        from apps.matters.models import Matter

        data = serializer.validated_data
        matter = None
        recipient = None

        if data.get('matter_id'):
            matter = Matter.objects.get(pk=data['matter_id'], client=request.user)
            if matter.attorney:
                recipient = matter.attorney

        if data.get('attorney_id'):
            recipient = AttorneyProfile.objects.get(user_id=data['attorney_id'])

        # Calculate platform fee (e.g., 5%)
        amount = data['amount']
        platform_fee = amount * 0.05
        net_amount = amount - platform_fee

        payment = Payment.objects.create(
            payer=request.user,
            recipient=recipient,
            matter=matter,
            payment_type=data['payment_type'],
            amount=amount,
            platform_fee=platform_fee,
            net_amount=net_amount,
            description=data.get('description', ''),
            status=Payment.PaymentStatus.PENDING,
            in_escrow=True  # Hold in escrow until service delivered
        )

        if data.get('payment_method_id'):
            payment.payment_method = PaymentMethod.objects.get(
                pk=data['payment_method_id'],
                user=request.user
            )
            payment.save()

        # In production, process payment via Stripe
        # For now, simulate successful payment
        payment.status = Payment.PaymentStatus.COMPLETED
        payment.completed_at = timezone.now()
        payment.save()

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )


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
