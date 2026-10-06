import { Users } from 'lucide-react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { EmptyState, PageHeader } from '@/components/ui/Page';

export default function AttorneyClientsPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <PageHeader title="Active clients" description="People you are currently working with." />
      <EmptyState icon={Users} title="No active clients at this time" text="Clients appear here once you accept a referral." />
    </AttorneyLayout>
  );
}
