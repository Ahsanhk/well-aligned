'use client';

import { useCallback, useMemo, useState } from 'react';
import { isPendingSuggestion } from '@/lib/meeting-stats';
import { useMeetingsStore } from '@/store/meetings';
import type { Meeting, SuggestedTodo, SuggestionDraft } from '@/types';

function defaultTarget(meeting: Meeting, suggestion: SuggestedTodo, groupProjectIds: string[]) {
  if (!meeting.groupId) return meeting.projectId;
  const suggested = suggestion.suggestedProjectId ?? null;
  return suggested && groupProjectIds.includes(suggested) ? suggested : null;
}

function toDraft(suggestion: SuggestedTodo, targetProjectId: string | null): SuggestionDraft {
  return {
    targetProjectId,
    id: suggestion.id,
    title: suggestion.title,
    details: suggestion.details,
    priority: suggestion.priority,
    frameIds: (suggestion.frames ?? []).map((frame) => frame.id),
    selected: true,
  };
}

export function useMeetingSuggestions(meeting: Meeting, groupProjectIds: string[]) {
  const accept = useMeetingsStore((state) => state.accept);
  const dismiss = useMeetingsStore((state) => state.dismiss);
  const [edits, setEdits] = useState<Record<string, SuggestionDraft>>({});
  const [isAccepting, setIsAccepting] = useState(false);

  const pending = useMemo(() => meeting.suggestions.filter(isPendingSuggestion), [meeting.suggestions]);
  const accepted = useMemo(() => meeting.suggestions.filter((item) => item.acceptedTodoId), [meeting.suggestions]);
  const dismissed = useMemo(
    () => meeting.suggestions.filter((item) => item.dismissed && !item.acceptedTodoId),
    [meeting.suggestions],
  );

  const freshDraft = useCallback(
    (suggestion: SuggestedTodo) => toDraft(suggestion, defaultTarget(meeting, suggestion, groupProjectIds)),
    [meeting, groupProjectIds],
  );

  const draftFor = useCallback((suggestion: SuggestedTodo) => edits[suggestion.id] ?? freshDraft(suggestion), [edits, freshDraft]);

  const updateDraft = useCallback(
    (suggestion: SuggestedTodo, patch: Partial<SuggestionDraft>) =>
      setEdits((current) => ({ ...current, [suggestion.id]: { ...(current[suggestion.id] ?? freshDraft(suggestion)), ...patch } })),
    [freshDraft],
  );

  const selectedDrafts = pending.map(draftFor).filter((draft) => draft.selected);
  const validSelected = selectedDrafts.filter((draft) => draft.title.trim().length > 0);

  const setAllSelected = (selected: boolean) =>
    setEdits((current) => {
      const next = { ...current };
      pending.forEach((suggestion) => {
        next[suggestion.id] = { ...(current[suggestion.id] ?? freshDraft(suggestion)), selected };
      });
      return next;
    });

  const acceptSelected = async () => {
    if (validSelected.length === 0) return;
    setIsAccepting(true);
    await accept(
      meeting.id,
      validSelected.map(({ id, title, details, priority, frameIds, targetProjectId }) => ({
        targetProjectId,
        id,
        title: title.trim(),
        details: details.trim(),
        priority,
        frameIds,
      })),
    );
    setIsAccepting(false);
  };

  const dismissIds = (ids: string[]) => void dismiss(meeting.id, ids);

  return {
    pending,
    accepted,
    dismissed,
    draftFor,
    updateDraft,
    selectedCount: selectedDrafts.length,
    acceptCount: validSelected.length,
    allSelected: pending.length > 0 && selectedDrafts.length === pending.length,
    setAllSelected,
    acceptSelected,
    isAccepting,
    dismissSelected: () => dismissIds(selectedDrafts.map((draft) => draft.id)),
    dismissOne: (id: string) => dismissIds([id]),
  };
}
