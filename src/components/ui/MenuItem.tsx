import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  title?: string;
}

export function MenuItem({ icon, label, onSelect, tone = 'default', disabled = false, title }: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      disabled={disabled}
      title={title}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45',
        tone === 'danger' ? 'text-danger hover:bg-danger/10' : 'text-fg hover:bg-line/60',
      )}
    >
      <span className={cn('shrink-0', tone === 'danger' ? 'text-danger' : 'text-muted')}>{icon}</span>
      {label}
    </button>
  );
}
