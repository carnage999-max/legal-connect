'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientLayout } from '@/components/ClientLayout';
import { AlertCircle, CheckCircle2, CreditCard, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/Page';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

function PaymentFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matterId = searchParams.get('matter_id');
  const amount = parseFloat(searchParams.get('amount') || '0');

  const [formData, setFormData] = useState({
    card_number: '',
    card_holder: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '');
    if (!/^\d*$/.test(value)) return;
    
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, card_number: formatted });
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData({ ...formData, cvv: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterId || !amount) {
      setError('Invalid payment details');
      return;
    }

    if (!formData.card_number || !formData.card_holder || !formData.expiry_month || !formData.expiry_year || !formData.cvv) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await apiPost('/api/v1/payments/', {
        matter_id: matterId,
        amount: amount,
        card_number: formData.card_number.replace(/\s/g, ''),
        card_holder: formData.card_holder,
        expiry_month: formData.expiry_month,
        expiry_year: formData.expiry_year,
        cvv: formData.cvv,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/app/client/matters/${matterId}`);
      }, 2000);
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
      <section className="card h-fit p-6">
        <h2 className="title-3">Fee summary</h2>
        <dl className="mt-6 space-y-4 border-b border-hairline pb-6">
          <div className="flex justify-between gap-4">
            <dt className="text-mute">Consultation fee</dt>
            <dd className="tnum font-semibold text-ink">${amount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-mute">GST/HST</dt>
            <dd className="tnum text-mute">${(amount * 0.13).toFixed(2)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex items-baseline justify-between gap-4">
          <span className="text-lg font-semibold text-ink">Total</span>
          <span className="tnum text-3xl font-bold tracking-tight text-green-700">${(amount * 1.13).toFixed(2)}</span>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="title-3">Payment method</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {error && (
            <div role="alert" className="notice notice-error">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="notice notice-success">
              <CheckCircle2 size={18} className="mt-0.5 flex-none" />
              Payment successful!
            </div>
          )}

          <div>
            <label htmlFor="card_holder" className="label">Card holder name</label>
            <input id="card_holder" type="text" autoComplete="cc-name" value={formData.card_holder} onChange={(e) => setFormData({ ...formData, card_holder: e.target.value })} className="field" placeholder="John Doe" />
          </div>

          <div>
            <label htmlFor="card_number" className="label">Card number</label>
            <input id="card_number" type="text" inputMode="numeric" autoComplete="cc-number" value={formData.card_number} onChange={handleCardNumberChange} maxLength={19} className="field tnum" placeholder="1234 5678 9012 3456" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="expiry_month" className="label">Month</label>
              <select id="expiry_month" autoComplete="cc-exp-month" value={formData.expiry_month} onChange={(e) => setFormData({ ...formData, expiry_month: e.target.value })} className="field">
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="expiry_year" className="label">Year</label>
              <select id="expiry_year" autoComplete="cc-exp-year" value={formData.expiry_year} onChange={(e) => setFormData({ ...formData, expiry_year: e.target.value })} className="field">
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={String(year).slice(-2)}>
                      {String(year).slice(-2)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="cvv" className="label">CVV</label>
              <input id="cvv" type="text" inputMode="numeric" autoComplete="cc-csc" value={formData.cvv} onChange={handleCVVChange} maxLength={4} className="field tnum" placeholder="123" />
            </div>
          </div>

          <button type="submit" disabled={loading || success} className="btn btn-primary btn-lg w-full">
            {loading ? <Spinner /> : <CreditCard size={18} />}
            {loading ? 'Processing…' : 'Pay now'}
          </button>
          <p className="flex items-center justify-center gap-2 text-sm text-mute">
            <Lock size={14} /> Payments are processed securely.
          </p>
        </form>
      </section>
    </div>
  );
}

export default function ClientPaymentsPage(): React.ReactNode {
  return (
    <ClientLayout>
      <PageHeader title="Secure payment" description="Complete your payment securely." />
      <Suspense fallback={<div className="flex justify-center p-12 text-blue-600"><Spinner size={30} /></div>}>
        <PaymentFormContent />
      </Suspense>
    </ClientLayout>
  );
}
