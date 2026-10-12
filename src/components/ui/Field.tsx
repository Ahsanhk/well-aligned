import type { ReactNode } from 'react';

interface Props {
  label: string;
  htmlFor: string;
  hint?: string;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, description, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
        {label}
        {hint && <span className="font-normal text-subtle">{hint}</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="animate-fade-in text-xs text-danger">
          {error}
        </p>
      ) : (
        description && <div className="text-xs text-subtle">{description}</div>
      )}
    </div>
  );
}
