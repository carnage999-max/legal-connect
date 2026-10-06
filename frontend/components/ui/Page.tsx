import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  CircleDot,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/** Title row at the top of every portal page. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="title-1 !text-[clamp(2rem,4vw,3rem)]">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[1.1rem] leading-relaxed text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-none flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/** A number and what it counts. */
export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: 'blue' | 'green';
}) {
  return (
    <div className="card p-6 md:p-7">
      <div className="flex items-center justify-between gap-3 text-mute">
        <p className="text-[0.95rem] font-medium">{label}</p>
        {Icon && <Icon size={22} strokeWidth={1.75} />}
      </div>
      <p className="tnum mt-5 text-5xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

/** What a list looks like before it has anything in it. */
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="card px-6 py-14 text-center md:py-16">
      <Icon size={34} strokeWidth={1.5} className="mx-auto text-mute" />
      <p className="mt-5 text-xl font-semibold tracking-tight text-ink">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-[1rem] leading-relaxed text-mute">{text}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-7">
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Maps a free-text status from the API to colored text and a library icon. */
export function StatusBadge({ status }: { status?: string | null }) {
  const raw = (status || 'unknown').toString();
  const s = raw.toLowerCase();
  let tone = 'badge-blue';
  let Icon: LucideIcon = CircleDot;
  if (/(active|open|accepted|connected|complete|paid|confirmed|verified|approved|signed|executed)/.test(s)) {
    tone = 'badge-green';
    Icon = CheckCircle2;
  } else if (/(pending|draft|new|review|scheduled|submitted|sent)/.test(s)) {
    tone = 'badge-amber';
    Icon = Clock;
  } else if (/(declin|reject|conflict|overdue|fail|cancel|expired)/.test(s)) {
    tone = 'badge-red';
    Icon = XCircle;
  } else if (/(closed|archived|unknown)/.test(s)) {
    tone = '';
    Icon = CircleDashed;
  }
  return (
    <span className={`badge ${tone} capitalize`}>
      <Icon size={15} strokeWidth={2} aria-hidden />
      {raw.replace(/_/g, ' ')}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-[1.6rem] font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="notice notice-error mb-6">
      <AlertCircle size={18} className="mt-0.5 flex-none" />
      {children}
    </div>
  );
}
