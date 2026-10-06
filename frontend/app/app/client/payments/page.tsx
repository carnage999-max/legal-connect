'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Lock, Receipt } from 'lucide-react';
import { ClientLayout } from '@/components/ClientLayout';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/Page';
import { Spinner } from '@/components/ui/Spinner';
import { apiGet, apiPost } from '@/lib/api';

/*
 * Card details are typed into Stripe's own fields (an iframe served by Stripe),
 * so they never touch this site or our API. We only ever hold a PaymentIntent
 * client secret. The amount is set by the server, and a payment counts as paid
 * only once Stripe confirms it to the server.
 */

type Payment = {
  id: string;
  matter: string | null;
  payment_type: string;
  status: string;
  amount: string;
  currency: string;
  description: string;
  receipt_url: string;
  created_at: string;
};

type CreatedPayment = Payment & { client_secret: string };

const stripePromises = new Map<string, Promise<Stripe | null>>();
function getStripePromise(key: string) {
  if (!stripePromises.has(key)) stripePromises.set(key, loadStripe(key));
  return stripePromises.get(key)!;
}

const money = (value: string | number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));

const errorText = (e: any, fallback: string) => e?.data?.detail || e?.message || fallback;

function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="notice notice-error">
      <AlertCircle size={18} className="mt-0.5 flex-none" />
      {children}
    </div>
  );
}

/** Waits for the server to hear from Stripe, then shows the outcome. */
function PaymentOutcome({ paymentId, redirectStatus }: { paymentId: string; redirectStatus?: string | null }) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let stop = false;
    let tries = 0;
    async function poll() {
      try {
        const p: Payment = await apiGet(`/api/v1/payments/${paymentId}/`);
        if (stop) return;
        setPayment(p);
        if (p.status !== 'pending' && p.status !== 'processing') return;
      } catch {
        /* keep trying */
      }
      if (++tries >= 20) {
        if (!stop) setTimedOut(true);
        return;
      }
      setTimeout(poll, 2000);
    }
    poll();
    return () => {
      stop = true;
    };
  }, [paymentId]);

  if (payment?.status === 'completed') {
    return (
      <div className="card max-w-xl p-6 sm:p-8">
        <div role="status" className="notice notice-success">
          <CheckCircle2 size={18} className="mt-0.5 flex-none" />
          Payment received. Thank you.
        </div>
        <dl className="mt-6 space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-mute">{payment.description || 'Payment'}</dt>
            <dd className="tnum font-semibold text-ink">{money(payment.amount, payment.currency)}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {payment.matter && (
            <Link href={`/app/client/matters/${payment.matter}`} className="btn btn-primary">
              Back to your matter
            </Link>
          )}
          {payment.receipt_url && (
            <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <Receipt size={18} /> View receipt
            </a>
          )}
          <Link href="/app/client/payments" className="btn btn-ghost">
            All payments
          </Link>
        </div>
      </div>
    );
  }

  if (payment?.status === 'failed' || payment?.status === 'cancelled' || redirectStatus === 'failed') {
    return (
      <div className="card max-w-xl space-y-6 p-6 sm:p-8">
        <ErrorNotice>The payment did not go through, and you have not been charged. Please try again.</ErrorNotice>
        <Link href={payment?.matter ? `/app/client/payments?matter_id=${payment.matter}` : '/app/client/payments'} className="btn btn-primary">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="card max-w-xl p-6 sm:p-8">
      <div role="status" className="notice notice-info">
        <Spinner />
        {timedOut
          ? 'We are still waiting for your bank to confirm. You can leave this page. The payment will show on your Payments page once it clears.'
          : 'Confirming your payment…'}
      </div>
      {timedOut && (
        <Link href="/app/client/payments" className="btn btn-outline mt-6">
          Go to payments
        </Link>
      )}
    </div>
  );
}

function CheckoutForm({ payment, onSubmitted }: { payment: CreatedPayment; onSubmitted: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/app/client/payments?payment_id=${payment.id}` },
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message || 'Your payment could not be completed.');
      setBusy(false);
      return;
    }
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <button type="submit" disabled={!stripe || !elements || busy} className="btn btn-primary btn-lg w-full">
        {busy ? <Spinner /> : <CreditCard size={18} />}
        {busy ? 'Processing…' : `Pay ${money(payment.amount, payment.currency)}`}
      </button>
      <p className="flex items-center justify-center gap-2 text-sm text-mute">
        <Lock size={14} /> Card details go straight to Stripe and never reach Legal Connect.
      </p>
    </form>
  );
}

function Checkout({ matterId, invoiceId }: { matterId: string | null; invoiceId: string | null }) {
  const [payment, setPayment] = useState<CreatedPayment | null>(null);
  const [publishableKey, setPublishableKey] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const [config, created] = await Promise.all([
          apiGet('/api/v1/payments/config/'),
          apiPost('/api/v1/payments/create/', matterId ? { matter_id: matterId } : { invoice_id: invoiceId }),
        ]);
        setPublishableKey(config.publishable_key);
        setPayment(created);
      } catch (e: any) {
        setError(errorText(e, 'We could not start the payment. Please try again.'));
      }
    })();
  }, [matterId, invoiceId]);

  const stripePromise = useMemo(() => (publishableKey ? getStripePromise(publishableKey) : null), [publishableKey]);

  if (submitted && payment) return <PaymentOutcome paymentId={payment.id} />;

  if (error) {
    return (
      <div className="max-w-xl space-y-6">
        <ErrorNotice>{error}</ErrorNotice>
        <Link href="/app/client/payments" className="btn btn-outline">
          Back to payments
        </Link>
      </div>
    );
  }

  if (!payment || !stripePromise) {
    return (
      <div role="status" className="flex items-center gap-3 py-12 text-mute">
        <Spinner size={22} /> Preparing a secure payment…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
      <section className="card h-fit p-6">
        <h2 className="title-3">Summary</h2>
        <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-hairline pb-6">
          <span className="text-mute">{payment.description || 'Payment'}</span>
          <span className="tnum font-semibold text-ink">{money(payment.amount, payment.currency)}</span>
        </div>
        <div className="mt-6 flex items-baseline justify-between gap-4">
          <span className="text-lg font-semibold text-ink">Total</span>
          <span className="tnum text-3xl font-bold tracking-tight text-green-700">{money(payment.amount, payment.currency)}</span>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="title-3">Payment method</h2>
        <div className="mt-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: payment.client_secret,
              appearance: {
                theme: 'stripe',
                variables: { colorPrimary: '#1e8e3e', colorText: '#101828', colorDanger: '#b42318', borderRadius: '12px' },
              },
            }}
          >
            <CheckoutForm payment={payment} onSubmitted={() => setSubmitted(true)} />
          </Elements>
        </div>
      </section>
    </div>
  );
}

function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/v1/payments/')
      .then((res) => setPayments(res?.results ?? res ?? []))
      .catch((e) => setError(errorText(e, 'Failed to load payments.')));
  }, []);

  if (error) return <ErrorNotice>{error}</ErrorNotice>;
  if (!payments) {
    return (
      <div role="status" className="flex items-center gap-3 py-12 text-mute">
        <Spinner size={22} /> Loading payments…
      </div>
    );
  }
  if (payments.length === 0) {
    return <EmptyState icon={CreditCard} title="No payments yet" text="Consultation fees and invoices you pay will be listed here." />;
  }

  return (
    <ul className="space-y-3">
      {payments.map((p) => (
        <li key={p.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{p.description || p.payment_type.replace(/_/g, ' ')}</p>
            <p className="mt-1 text-sm text-mute">{new Date(p.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-none items-center gap-4">
            <span className="tnum font-semibold text-ink">{money(p.amount, p.currency)}</span>
            <StatusBadge status={p.status} />
            {p.receipt_url && (
              <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-xl text-mute hover:bg-paper hover:text-ink" aria-label="View receipt">
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PaymentsContent() {
  const params = useSearchParams();
  const paymentId = params.get('payment_id');
  const redirectStatus = params.get('redirect_status');
  const matterId = params.get('matter_id');
  const invoiceId = params.get('invoice_id');

  if (paymentId) return <PaymentOutcome paymentId={paymentId} redirectStatus={redirectStatus} />;
  if (matterId || invoiceId) return <Checkout matterId={matterId} invoiceId={invoiceId} />;
  return <PaymentHistory />;
}

export default function ClientPaymentsPage(): React.ReactNode {
  return (
    <ClientLayout>
      <PageHeader title="Payments" description="Pay securely and keep track of what you have paid." />
      <Suspense fallback={<div className="flex justify-center p-12 text-blue-600"><Spinner size={30} /></div>}>
        <PaymentsContent />
      </Suspense>
    </ClientLayout>
  );
}
