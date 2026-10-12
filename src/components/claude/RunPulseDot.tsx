import { cn } from '@/lib/cn';

export function RunPulseDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-2 w-2 shrink-0', className)} title="Claude is working">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet" />
    </span>
  );
}
