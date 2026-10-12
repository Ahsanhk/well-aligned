import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ icon, trailing, invalid = false, className, ref, ...props }: Props) {
  return (
    <div className="relative flex items-center">
      {icon && <span className="pointer-events-none absolute left-3 text-subtle">{icon}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full rounded-lg border border-line bg-sunken/70 px-3 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle',
          'focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--color-accent-soft)]',
          Boolean(icon) && 'pl-9',
          Boolean(trailing) && 'pr-11',
          invalid && 'border-danger/60 focus:border-danger/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-danger)_18%,transparent)]',
          className,
        )}
        {...props}
      />
      {trailing && <span className="absolute right-1.5 flex items-center">{trailing}</span>}
    </div>
  );
}
