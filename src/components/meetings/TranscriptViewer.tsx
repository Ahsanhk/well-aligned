'use client';

import { useMemo, useState } from 'react';
import { MessageSquareText, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { MEETING_COPY } from '@/constants/meetings';
import { matchesQuery } from '@/lib/highlight';
import { speakerToneMap } from '@/lib/speakers';
import type { Meeting, TranscriptSegment } from '@/types';
import { TranscriptDownloads } from './TranscriptDownloads';
import { TranscriptLine } from './TranscriptLine';

function searchableValues(segment: TranscriptSegment) {
  return [segment.text, segment.speaker];
}

export function TranscriptViewer({ meeting }: { meeting: Meeting }) {
  const [query, setQuery] = useState('');
  const tones = useMemo(() => speakerToneMap(meeting.transcript), [meeting.transcript]);
  const hasQuery = query.trim().length > 0;
  const matchCount = useMemo(
    () => (hasQuery ? meeting.transcript.filter((segment) => matchesQuery(searchableValues(segment), query)).length : 0),
    [meeting.transcript, query, hasQuery],
  );

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <MessageSquareText size={16} className="text-indigo" />
          Transcript
        </h2>
        <span className="text-xs text-subtle tabular-nums">{meeting.transcript.length} lines</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <TranscriptDownloads meetingId={meeting.id} />
        </div>
      </header>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line p-2">
          <div className="flex-1">
            <Input
              icon={<Search size={14} />}
              type="search"
              aria-label="Search transcript"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={MEETING_COPY.searchPlaceholder}
              className="h-9"
            />
          </div>
          {hasQuery && (
            <span className="shrink-0 pr-2 text-xs text-muted tabular-nums">
              {matchCount} match{matchCount === 1 ? '' : 'es'}
            </span>
          )}
        </div>
        {meeting.transcript.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">{MEETING_COPY.noTranscript}</p>
        ) : (
          <ol className="flex max-h-[70dvh] flex-col overflow-y-auto p-2">
            {meeting.transcript.map((segment, index) => (
              <TranscriptLine
                key={`${segment.start}-${index}`}
                segment={segment}
                toneClass={tones.get(segment.speaker) ?? ''}
                query={query}
                dimmed={hasQuery && !matchesQuery(searchableValues(segment), query)}
              />
            ))}
          </ol>
        )}
        {hasQuery && matchCount === 0 && meeting.transcript.length > 0 && (
          <p className="border-t border-line px-4 py-3 text-center text-xs text-subtle">{MEETING_COPY.noMatches}</p>
        )}
      </div>
    </section>
  );
}
