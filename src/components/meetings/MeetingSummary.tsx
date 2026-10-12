import { ScrollText } from 'lucide-react';
import { READABLE_WIDTH_CLASS } from '@/constants/layout';
import { cn } from '@/lib/cn';

export function MeetingSummary({ summary }: { summary: string }) {
  if (!summary) return null;
  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <h2 className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wider text-subtle uppercase">
        <ScrollText size={13} className="text-accent" />
        Summary
      </h2>
      <p className={cn('text-sm leading-relaxed whitespace-pre-wrap text-fg/90', READABLE_WIDTH_CLASS)}>{summary}</p>
    </section>
  );
}
