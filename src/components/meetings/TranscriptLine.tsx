import { HighlightedText } from '@/components/ui/HighlightedText';
import { READABLE_WIDTH_CLASS } from '@/constants/layout';
import { cn } from '@/lib/cn';
import { splitHighlight } from '@/lib/highlight';
import type { TranscriptSegment } from '@/types';

interface Props {
  segment: TranscriptSegment;
  toneClass: string;
  query: string;
  dimmed: boolean;
}

export function TranscriptLine({ segment, toneClass, query, dimmed }: Props) {
  return (
    <li
      className={cn(
        'grid grid-cols-[3.5rem_1fr] gap-x-3 rounded-lg px-2 py-2 transition-opacity duration-150 hover:bg-elevated/40 sm:grid-cols-[4rem_9rem_1fr]',
        dimmed && 'opacity-35',
      )}
    >
      <span className="pt-px font-mono text-xs text-subtle tabular-nums">{segment.start}</span>
      <span className={cn('truncate text-xs font-semibold sm:pt-px', toneClass)}>
        <HighlightedText parts={splitHighlight(segment.speaker, query)} />
      </span>
      <p className={cn('col-start-2 text-sm leading-relaxed text-fg/90 sm:col-start-3 sm:row-start-1', READABLE_WIDTH_CLASS)}>
        <HighlightedText parts={splitHighlight(segment.text, query)} />
      </p>
    </li>
  );
}
