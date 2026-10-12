import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label, className }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex gap-0.5 rounded-lg border border-line bg-sunken p-0.5', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150',
              isActive ? 'bg-elevated text-fg shadow-sm ring-1 ring-line-strong' : 'text-subtle hover:text-fg',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
