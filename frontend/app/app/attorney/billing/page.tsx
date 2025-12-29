import { AttorneyLayout } from '@/components/AttorneyLayout';

export default function AttorneyBillingPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <div>
        <h1 className="text-2xl font-semibold mb-4">Billing</h1>
        <div className="bg-lcbgattorney-secondary rounded-md p-6 border border-lcborder-attorney">
          <p className="text-lctextattorney-secondary text-sm mb-4">Referral Fees (This Month)</p>
          <p className="text-3xl font-semibold text-lctextattorney mb-6">$0</p>
          <button className="px-4 py-2 bg-lcaccent-attorney text-white rounded-md text-sm">
            View Payout History
          </button>
        </div>
      </div>
    </AttorneyLayout>
  );
}
