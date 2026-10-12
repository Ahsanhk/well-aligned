import { cn } from '@/lib/cn';

type Size = 'sm' | 'md';

const SIZES: Record<Size, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-8 w-8 text-xs',
};

interface Props {
  initials: string;
  size?: Size;
  className?: string;
}

export function Avatar({ initials, size = 'md', className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/80 via-indigo/80 to-violet/80 font-semibold text-canvas ring-1 ring-white/10',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
