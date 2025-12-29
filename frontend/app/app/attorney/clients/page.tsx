import { AttorneyLayout } from '@/components/AttorneyLayout';

export default function AttorneyClientsPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <div>
        <h1 className="text-2xl font-semibold mb-4">Active Clients</h1>
        <div className="bg-lcbgattorney-secondary rounded-md p-6 border border-lcborder-attorney text-lctextattorney-secondary">
          <p>No active clients at this time.</p>
        </div>
      </div>
    </AttorneyLayout>
  );
}
