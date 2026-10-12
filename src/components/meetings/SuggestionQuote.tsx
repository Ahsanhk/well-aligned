import { Quote } from 'lucide-react';
import { TimestampChip } from './TimestampChip';

interface Props {
  quote: string;
  timestamp: string;
}

export function SuggestionQuote({ quote, timestamp }: Props) {
  if (!quote) return null;
  return (
    <blockquote className="relative flex gap-2.5 rounded-r-lg border-l-2 border-violet/60 bg-violet/5 py-2 pr-3 pl-3">
      <Quote size={12} className="mt-1 shrink-0 text-violet/70" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-[13px] leading-relaxed text-muted italic">“{quote}”</p>
        <TimestampChip timestamp={timestamp} />
      </div>
    </blockquote>
  );
}
