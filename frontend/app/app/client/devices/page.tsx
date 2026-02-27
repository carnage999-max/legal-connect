import { ClientLayout } from '@/components/ClientLayout';
import { DeviceManager } from '@/components/DeviceManager';

export default function DevicesPage() {
  return (
    <ClientLayout>
      <div className="site-container py-8">
        <DeviceManager />
      </div>
    </ClientLayout>
  );
}
