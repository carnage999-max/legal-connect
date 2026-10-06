import { Inbox } from 'lucide-react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { EmptyState, PageHeader } from '@/components/ui/Page';

export default function AttorneyRequestsPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <PageHeader title="New referral requests" description="Screened matters waiting for your decision." />
      <EmptyState icon={Inbox} title="No new referral requests" text="When a conflict-free match is made, the matter will appear here for you to accept or decline." />
    </AttorneyLayout>
  );
}
