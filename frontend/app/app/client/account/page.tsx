import { ClientLayout } from '@/components/ClientLayout';

export default function ClientAccountPage(): React.ReactNode {
  return (
    <ClientLayout>
      <div>
        <h1 className="text-2xl font-semibold mb-4">Account Settings</h1>
        <div className="border border-lcborder rounded-md p-6">
          <p className="text-lctextsecondary mb-4">Manage your profile, password, and preferences here.</p>
          <button className="px-4 py-2 border border-lcborder rounded-md text-lctextprimary hover:bg-gray-50">
            Edit Profile
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}
