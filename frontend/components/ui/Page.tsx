import Link from 'next/link';

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
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="title-2">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[1.02rem] leading-relaxed text-mute">{description}</p>}
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
  tone = 'blue',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  tone?: 'blue' | 'green';
}) {
  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-mute">{label}</p>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone === 'green' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="tnum mt-3 text-4xl font-bold tracking-tight text-ink">{value}</p>
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
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  text?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--color-hairline)] bg-[color:var(--color-paper)] px-6 py-12 text-center md:py-14">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--surface,#fff)] text-blue-600 shadow-[var(--shadow-soft)]">
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <p className="mt-5 text-lg font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-1.5 max-w-md text-[0.97rem] leading-relaxed text-mute">{text}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Maps a free-text status from the API to a badge colour. */
export function StatusBadge({ status }: { status?: string | null }) {
  const raw = (status || 'unknown').toString();
  const s = raw.toLowerCase();
  const tone = /(active|open|accepted|connected|complete|paid|confirmed|verified|approved|signed|executed)/.test(s)
    ? 'badge-green'
    : /(pending|draft|new|review|scheduled|submitted|sent)/.test(s)
      ? 'badge-amber'
      : /(declin|reject|conflict|overdue|fail|cancel|expired)/.test(s)
        ? 'badge-red'
        : /(closed|archived|unknown)/.test(s)
          ? ''
          : 'badge-blue';
  return <span className={`badge ${tone} capitalize`}>{raw.replace(/_/g, ' ')}</span>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="title-3 text-[1.35rem]">{children}</h2>
      {action}
    </div>
  );
}

export function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="notice notice-error mb-6">
      {children}
    </div>
  );
}
