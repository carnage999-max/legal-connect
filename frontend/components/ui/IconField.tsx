import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  icon: LucideIcon;
  hint?: string;
};

/** A labeled input with a library icon at its left edge. */
export function IconField({ label, icon: Icon, hint, id, ...rest }: Props) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div>
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="relative">
        <Icon size={19} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
        <input id={inputId} className="field pl-11" {...rest} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
