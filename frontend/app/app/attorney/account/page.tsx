'use client';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { PageHeader } from '@/components/ui/Page';
import { useAuth } from '@/context/AuthContext';

export default function AttorneyAccountPage(): React.ReactNode {
  const { user } = useAuth();

  return (
    <AttorneyLayout>
      <PageHeader title="Account settings" description="Manage your profile, availability and preferences." />
      <section className="card max-w-2xl p-6 sm:p-8">
        <h2 className="title-3">Profile</h2>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-sm text-mute">Email</dt>
            <dd className="mt-0.5 font-medium text-ink">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-sm text-mute">Account type</dt>
            <dd className="mt-0.5 font-medium capitalize text-ink">{user?.user_type || 'attorney'}</dd>
          </div>
        </dl>
        <button className="btn btn-outline mt-6">Edit profile</button>
      </section>
    </AttorneyLayout>
  );
}
