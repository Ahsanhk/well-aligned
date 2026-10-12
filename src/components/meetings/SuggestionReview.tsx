'use client';

import { useMemo } from 'react';
import { CircleCheckBig, ListPlus, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { MEETING_COPY } from '@/constants/meetings';
import { GROUP_COPY, NO_GROUP_VALUE } from '@/constants/groups';
import { useGroupProjects } from '@/hooks/useGroupProjects';
import { useMeetingSuggestions } from '@/hooks/useMeetingSuggestions';
import { meetingOwner } from '@/lib/owner';
import type { Meeting } from '@/types';
import { AcceptedSuggestion } from './AcceptedSuggestion';
import { DismissedSuggestions } from './DismissedSuggestions';
import { SuggestionCard } from './SuggestionCard';

export function SuggestionReview({ meeting }: { meeting: Meeting }) {
  const groupProjects = useGroupProjects(meeting.groupId);
  const groupProjectIds = useMemo(() => groupProjects.map((project) => project.id), [groupProjects]);
  const targetOptions = useMemo(
    () =>
      meeting.groupId
        ? [{ value: NO_GROUP_VALUE, label: GROUP_COPY.targetShared }, ...groupProjects.map((project) => ({ value: project.id, label: project.name }))]
        : null,
    [meeting.groupId, groupProjects],
  );
  const review = useMeetingSuggestions(meeting, groupProjectIds);
  const total = meeting.suggestions.length;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <Lightbulb size={16} className="text-accent" />
          Suggested todos
        </h2>
        {review.pending.length > 0 && (
          <span className="rounded-md bg-accent/15 px-1.5 text-xs text-accent tabular-nums">{review.pending.length} to review</span>
        )}
      </header>

      {total === 0 && <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{MEETING_COPY.noSuggestions}</p>}

      {total > 0 && review.pending.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-success">
          <CircleCheckBig size={15} />
          {MEETING_COPY.allReviewed}
        </p>
      )}

      {review.pending.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {review.pending.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                targetOptions={targetOptions}
                meetingId={meeting.id}
                suggestion={suggestion}
                draft={review.draftFor(suggestion)}
                onChange={(patch) => review.updateDraft(suggestion, patch)}
                onDismiss={() => review.dismissOne(suggestion.id)}
              />
            ))}
          </ul>
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-line-strong bg-elevated/95 py-2 pr-2 pl-3 shadow-2xl shadow-black/50 backdrop-blur-md">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <Checkbox
                checked={review.allSelected}
                onChange={() => review.setAllSelected(!review.allSelected)}
                label={review.allSelected ? 'Select none' : 'Select all'}
              />
              <span className="hidden sm:inline">{review.allSelected ? 'Select none' : 'Select all'}</span>
              <span className="text-xs text-subtle tabular-nums">
                {review.selectedCount}/{review.pending.length}
              </span>
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={review.dismissSelected} disabled={review.selectedCount === 0 || review.isAccepting}>
                <X size={14} />
                Dismiss
              </Button>
              <Button size="sm" onClick={() => void review.acceptSelected()} disabled={review.acceptCount === 0 || review.isAccepting}>
                <ListPlus size={14} />
                {review.isAccepting ? 'Adding…' : `Add ${review.acceptCount} to project`}
              </Button>
            </div>
          </div>
        </>
      )}

      {review.accepted.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {review.accepted.map((suggestion) => (
            <AcceptedSuggestion key={suggestion.id} fallbackOwner={meetingOwner(meeting)} suggestion={suggestion} />
          ))}
        </ul>
      )}

      <DismissedSuggestions suggestions={review.dismissed} />
    </section>
  );
}
