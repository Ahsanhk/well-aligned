import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-fg">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
