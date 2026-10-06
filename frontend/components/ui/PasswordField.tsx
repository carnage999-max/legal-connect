'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  label: string;
  hint?: string;
};

export function PasswordField({ label, hint, id, ...rest }: Props) {
  const auto = useId();
  const inputId = id ?? auto;
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="relative">
        <input id={inputId} type={show ? 'text' : 'password'} className="field pr-12" {...rest} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-mute transition-colors hover:text-ink"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
