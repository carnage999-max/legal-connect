import { Wallet } from 'lucide-react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { PageHeader } from '@/components/ui/Page';

export default function AttorneyBillingPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <PageHeader title="Billing" description="Referral fees and payouts." />
      <section className="card max-w-xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-mute">Referral fees (this month)</p>
          <Wallet size={22} strokeWidth={1.75} className="text-mute" />
        </div>
        <p className="tnum mt-3 text-5xl font-bold tracking-tight text-ink">$0</p>
        <button className="btn btn-blue mt-8">View payout history</button>
      </section>
    </AttorneyLayout>
  );
}
