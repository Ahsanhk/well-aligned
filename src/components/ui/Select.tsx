import type { Ref, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Option {
  value: string;
  label: string;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  options: Option[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  ref?: Ref<HTMLSelectElement>;
}

const SIZES = {
  sm: 'h-8 pl-2.5 pr-7 text-xs',
  md: 'h-10 pl-3 pr-9 text-sm',
};

export function Select({ options, onChange, size = 'md', className, ref, ...props }: Props) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <select
        ref={ref}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'w-full cursor-pointer appearance-none rounded-lg border border-line bg-sunken/70 text-fg outline-none transition-[border-color,box-shadow] duration-150',
          'focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--color-accent-soft)]',
          SIZES[size],
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-subtle" />
    </div>
  );
}
