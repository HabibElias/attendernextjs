'use client';

import { useState, type ComponentProps } from 'react';
import { Input } from './input';

type Props = Omit<ComponentProps<typeof Input>, 'type'> & { label: string };

export function PasswordInput({ label, disabled, id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const action = visible ? `Hide ${label}` : `Show ${label}`;

  return (
    <div className="relative flex items-center">
      <Input
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className="pr-12"
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={action}
        aria-controls={id}
        title={action}
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-2 px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
