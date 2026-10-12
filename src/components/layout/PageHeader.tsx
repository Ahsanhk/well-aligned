import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({ title, description, leading, actions, meta }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-fg sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
          {meta && <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
