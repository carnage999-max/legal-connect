'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientLayout } from '@/components/ClientLayout';
import { CreditCard, Loader } from 'lucide-react';
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
    <div className="grid grid-cols-2 gap-8">
      {/* Fee Summary */}
      <div className="bg-white border border-lcborder rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Fee Summary</h2>
        <div className="space-y-4 pb-6 border-b border-lcborder">
          <div className="flex justify-between">
            <span className="text-lctextsecondary">Consultation Fee</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-lctextsecondary">
            <span>GST/HST</span>
            <span>${(amount * 0.13).toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between text-lg font-bold mt-6">
          <span>Total</span>
          <span className="text-lcaccentclient">${(amount * 1.13).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white border border-lcborder rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Payment Method</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">Payment successful!</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-lctextprimary mb-2">Card Holder Name</label>
            <input
              type="text"
              value={formData.card_holder}
              onChange={(e) => setFormData({ ...formData, card_holder: e.target.value })}
              className="w-full px-4 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lctextprimary mb-2">Card Number</label>
            <input
              type="text"
              value={formData.card_number}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full px-4 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-lctextprimary mb-2">Month</label>
              <select
                value={formData.expiry_month}
                onChange={(e) => setFormData({ ...formData, expiry_month: e.target.value })}
                className="w-full px-3 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lctextprimary mb-2">Year</label>
              <select
                value={formData.expiry_year}
                onChange={(e) => setFormData({ ...formData, expiry_year: e.target.value })}
                className="w-full px-3 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
              >
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
              <label className="block text-sm font-medium text-lctextprimary mb-2">CVV</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={handleCVVChange}
                maxLength={4}
                className="w-full px-3 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
                placeholder="123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ClientPaymentsPage(): React.ReactNode {
  return (
    <ClientLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2">Secure Payment</h1>
        <p className="text-lg text-lctextsecondary mb-8">Complete your payment securely</p>

        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader size={32} className="animate-spin" /></div>}>
          <PaymentFormContent />
        </Suspense>
      </div>
    </ClientLayout>
  );
}
