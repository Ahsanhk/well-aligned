import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
  size?: Size;
}

const SIZES: Record<Size, string> = {
  sm: 'h-7 w-7 rounded-md',
  md: 'h-9 w-9 rounded-lg',
};

export function IconButton({ label, children, tone = 'default', size = 'md', className, ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center text-muted transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
        tone === 'danger' ? 'hover:bg-danger/10 hover:text-danger' : 'hover:bg-elevated hover:text-fg',
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
