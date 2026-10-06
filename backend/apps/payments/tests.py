from datetime import date
from decimal import Decimal
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.attorneys.models import AttorneyProfile
from apps.matters.models import Matter
from apps.users.models import User

from .models import Payment

STRIPE_KEYS = dict(
    STRIPE_SECRET_KEY='sk_test_x',
    STRIPE_PUBLIC_KEY='pk_test_x',
    STRIPE_WEBHOOK_SECRET='whsec_x',
)


def make_intent(pi_id='pi_1', status='requires_payment_method', amount=15000, secret='pi_1_secret_x'):
    intent = mock.MagicMock()
    intent.id = pi_id
    intent.status = status
    intent.amount = amount
    intent.client_secret = secret
    return intent


@override_settings(**STRIPE_KEYS)
class CreatePaymentTests(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            email='client@example.com', password='x' * 12, user_type='client'
        )
        attorney_user = User.objects.create_user(
            email='lawyer@example.com', password='x' * 12, user_type='attorney'
        )
        self.attorney = AttorneyProfile.objects.create(
            user=attorney_user,
            bar_number='B1',
            bar_state='TX',
            bar_admission_date=date(2015, 1, 1),
            consultation_fee=Decimal('150.00'),
        )
        self.matter = Matter.objects.create(
            client=self.client_user, attorney=self.attorney, title='Deposit', description='d', matter_type='civil'
        )
        self.api = APIClient()
        self.api.force_authenticate(self.client_user)

    def _post(self, stripe_mock, body=None):
        with mock.patch('apps.payments.views.get_stripe', return_value=stripe_mock):
            return self.api.post('/api/v1/payments/create/', {'matter_id': str(self.matter.id)} if body is None else body, format='json')

    def test_amount_comes_from_the_attorney_not_the_client(self):
        stripe_mock = mock.MagicMock()
        stripe_mock.PaymentIntent.create.return_value = make_intent()

        # a tampered request tries to pay a cent and sends card details
        res = self._post(
            stripe_mock,
            {'matter_id': str(self.matter.id), 'amount': '0.01', 'card_number': '4242424242424242', 'cvv': '123'},
        )

        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data['client_secret'], 'pi_1_secret_x')
        self.assertEqual(Decimal(res.data['amount']), Decimal('150.00'))
        self.assertEqual(stripe_mock.PaymentIntent.create.call_args.kwargs['amount'], 15000)
        payment = Payment.objects.get()
        self.assertEqual(payment.status, Payment.PaymentStatus.PENDING)
        self.assertEqual(payment.stripe_payment_intent_id, 'pi_1')
        self.assertEqual(payment.platform_fee, Decimal('7.50'))
        self.assertEqual(payment.net_amount, Decimal('142.50'))
        self.assertNotIn('card_number', res.data)

    def test_never_marks_paid_without_the_webhook(self):
        stripe_mock = mock.MagicMock()
        stripe_mock.PaymentIntent.create.return_value = make_intent()
        self._post(stripe_mock)
        self.assertNotEqual(Payment.objects.get().status, Payment.PaymentStatus.COMPLETED)

    def test_reload_reuses_the_open_intent(self):
        stripe_mock = mock.MagicMock()
        stripe_mock.PaymentIntent.create.return_value = make_intent()
        self._post(stripe_mock)
        stripe_mock.PaymentIntent.retrieve.return_value = make_intent()
        res = self._post(stripe_mock)

        self.assertEqual(res.status_code, 201)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(stripe_mock.PaymentIntent.create.call_count, 1)

    def test_no_fee_means_no_payment(self):
        self.attorney.free_consultation = True
        self.attorney.save()
        res = self._post(mock.MagicMock())
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Payment.objects.count(), 0)

    def test_matter_without_attorney_is_rejected(self):
        self.matter.attorney = None
        self.matter.save()
        self.assertEqual(self._post(mock.MagicMock()).status_code, 400)

    def test_someone_elses_matter_is_404(self):
        other = User.objects.create_user(email='o@example.com', password='x' * 12, user_type='client')
        self.api.force_authenticate(other)
        self.assertEqual(self._post(mock.MagicMock()).status_code, 404)

    def test_requires_exactly_one_target(self):
        self.assertEqual(self._post(mock.MagicMock(), {}).status_code, 400)

    @override_settings(STRIPE_SECRET_KEY='')
    def test_unconfigured_stripe_is_503(self):
        res = self.api.post('/api/v1/payments/create/', {'matter_id': str(self.matter.id)}, format='json')
        self.assertEqual(res.status_code, 503)

    def test_config_returns_only_the_publishable_key(self):
        res = self.api.get('/api/v1/payments/config/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data, {'publishable_key': 'pk_test_x'})


@override_settings(**STRIPE_KEYS)
class WebhookTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='c@example.com', password='x' * 12, user_type='client')
        self.payment = Payment.objects.create(
            payer=user, amount=Decimal('150.00'), payment_type='consultation',
            stripe_payment_intent_id='pi_1', status=Payment.PaymentStatus.PENDING,
        )
        self.api = APIClient()

    def _send(self, kind, obj):
        event = {'type': kind, 'data': {'object': obj}}
        with mock.patch('apps.payments.views.stripe.Webhook.construct_event', return_value=event), \
                mock.patch('apps.payments.views.get_stripe') as get_stripe:
            get_stripe.return_value.Charge.retrieve.return_value = {'receipt_url': 'https://r/1'}
            return self.api.post('/api/v1/payments/webhook/', b'{}', content_type='application/json',
                                 HTTP_STRIPE_SIGNATURE='t=1,v1=x')

    def test_bad_signature_is_rejected(self):
        import stripe
        with mock.patch(
            'apps.payments.views.stripe.Webhook.construct_event',
            side_effect=stripe.error.SignatureVerificationError('bad', 'sig'),
        ):
            res = self.api.post('/api/v1/payments/webhook/', b'{}', content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.PENDING)

    def test_succeeded_completes_the_payment_once(self):
        obj = {'id': 'pi_1', 'latest_charge': 'ch_1'}
        self.assertEqual(self._send('payment_intent.succeeded', obj).status_code, 200)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.COMPLETED)
        self.assertEqual(self.payment.stripe_charge_id, 'ch_1')
        self.assertEqual(self.payment.receipt_url, 'https://r/1')
        first = self.payment.completed_at

        self._send('payment_intent.succeeded', obj)  # Stripe retries deliveries
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.completed_at, first)

    def test_failed_and_cancelled_update_status(self):
        self._send('payment_intent.payment_failed', {'id': 'pi_1'})
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.FAILED)

    def test_a_late_failure_does_not_undo_a_completed_payment(self):
        self._send('payment_intent.succeeded', {'id': 'pi_1', 'latest_charge': 'ch_1'})
        self._send('payment_intent.payment_failed', {'id': 'pi_1'})
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.COMPLETED)

    def test_full_refund_event(self):
        self._send('payment_intent.succeeded', {'id': 'pi_1', 'latest_charge': 'ch_1'})
        self._send('charge.refunded', {'id': 'ch_1', 'refunded': True, 'amount': 15000, 'amount_refunded': 15000})
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.REFUNDED)

    @override_settings(STRIPE_WEBHOOK_SECRET='')
    def test_unconfigured_webhook_is_503(self):
        self.assertEqual(self.api.post('/api/v1/payments/webhook/', b'{}', content_type='application/json').status_code, 503)
