import { cn } from '@/lib/cn';

interface Props {
  keys: readonly string[];
  className?: string;
}

export function Kbd({ keys, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-current/20 bg-current/5 px-1 font-sans text-[10px] font-medium opacity-80"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
