import { ClipboardList, Lock, ShieldCheck, Zap } from 'lucide-react';

const ITEMS = [
  { icon: ClipboardList, title: 'Guided intake', text: 'One conversation, not a form wall.' },
  { icon: ShieldCheck, title: 'Conflict screening', text: 'Run before any attorney is contacted.' },
  { icon: Zap, title: 'Real-time availability', text: 'Only attorneys who can take it on.' },
  { icon: Lock, title: 'Secure communication', text: 'Messages and files stay in the platform.' },
];

export function ProofStrip() {
  return (
    <section aria-label="What Legal Connect does" className="border-b border-hairline bg-white">
      <div className="site-container">
        <ul className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4 py-6 sm:px-6 sm:first:pl-0 lg:py-8">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[0.93rem] leading-snug text-mute">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
