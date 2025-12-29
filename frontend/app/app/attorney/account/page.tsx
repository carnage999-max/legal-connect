import { AttorneyLayout } from '@/components/AttorneyLayout';

export default function AttorneyAccountPage(): React.ReactNode {
  return (
    <AttorneyLayout>
      <div>
        <h1 className="text-2xl font-semibold mb-4">Account Settings</h1>
        <div className="bg-lcbgattorney-secondary rounded-md p-6 border border-lcborder-attorney">
          <p className="text-lctextattorney-secondary mb-4">Manage your profile, availability, and preferences.</p>
          <button className="px-4 py-2 border border-lcborder-attorney rounded-md text-sm text-lctextattorney hover:bg-lcbgattorney transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </AttorneyLayout>
  );
}
