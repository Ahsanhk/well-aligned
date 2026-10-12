import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Tab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  trailing?: ReactNode;
}

export function Tabs<T extends string>({ tabs, value, onChange, label, trailing }: Props<T>) {
  return (
    <div className="flex items-center gap-2 border-b border-line">
      <div role="tablist" aria-label={label} className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                'relative -mb-px flex h-9 cursor-pointer items-center gap-2 border-b-2 px-3 text-sm whitespace-nowrap transition-colors duration-150',
                isActive ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded px-1.5 text-[11px] tabular-nums',
                    isActive ? 'bg-accent/15 text-accent' : 'bg-elevated text-subtle',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {trailing && <div className="shrink-0 pb-1">{trailing}</div>}
    </div>
  );
}
