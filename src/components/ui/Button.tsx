import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg hover:bg-accent-strong shadow-[0_0_20px_-6px_var(--color-accent)] hover:shadow-[0_0_28px_-6px_var(--color-accent)]',
  secondary: 'bg-elevated text-fg border border-line hover:border-line-strong hover:bg-line/60',
  ghost: 'text-muted hover:text-fg hover:bg-elevated',
  danger: 'bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
