import { Target, X } from 'lucide-react';
import { PrioritySelect } from '@/components/todos/PrioritySelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { IconButton } from '@/components/ui/IconButton';
import { Select } from '@/components/ui/Select';
import { GROUP_COPY, NO_GROUP_VALUE } from '@/constants/groups';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import type { SuggestedTodo, SuggestionDraft } from '@/types';
import { SuggestionFrames } from './SuggestionFrames';
import { SuggestionQuote } from './SuggestionQuote';
import { TimestampChip } from './TimestampChip';

interface Props {
  meetingId: string;
  targetOptions: { value: string; label: string }[] | null;
  suggestion: SuggestedTodo;
  draft: SuggestionDraft;
  onChange: (patch: Partial<SuggestionDraft>) => void;
  onDismiss: () => void;
}

export function SuggestionCard({ meetingId, targetOptions, suggestion, draft, onChange, onDismiss }: Props) {
  const hasTitle = draft.title.trim().length > 0;
  return (
    <li
      className={cn(
        'animate-fade-in rounded-xl border bg-surface transition-[border-color,opacity,box-shadow] duration-150',
        draft.selected ? 'border-accent/35 shadow-[0_0_0_1px_var(--color-accent-soft)]' : 'border-line opacity-60 hover:opacity-90',
      )}
    >
      <div className="flex items-start gap-3 px-3 pt-3 sm:px-4">
        <Checkbox
          checked={draft.selected}
          onChange={() => onChange({ selected: !draft.selected })}
          label="Include this suggestion"
          className="mt-2.5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            aria-label="Suggestion title"
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className={cn(
              'h-9 w-full rounded-md border border-transparent bg-transparent px-1.5 text-[15px] font-medium text-fg outline-none transition-colors duration-150 hover:border-line focus:border-accent/60 focus:bg-sunken',
              !hasTitle && 'border-danger/50',
            )}
          />
          <Textarea
            aria-label="Suggestion details"
            rows={3}
            value={draft.details}
            onChange={(event) => onChange({ details: event.target.value })}
            className="border-transparent bg-transparent px-1.5 py-1 text-[13px] text-muted hover:border-line focus:bg-sunken focus:text-fg"
          />
        </div>
        <div className="flex items-center gap-1 pt-1.5">
          <span className="hidden sm:inline-flex">
            <TimestampChip timestamp={suggestion.timestamp} />
          </span>
          <IconButton label="Dismiss suggestion" size="sm" onClick={onDismiss}>
            <X size={14} />
          </IconButton>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-3 pt-2 pb-3 sm:pr-4 sm:pl-11">
        <SuggestionQuote quote={suggestion.quote} timestamp={suggestion.timestamp} />
        <SuggestionFrames
          meetingId={meetingId}
          frames={suggestion.frames ?? []}
          includedIds={draft.frameIds}
          onChange={(frameIds) => onChange({ frameIds })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <PrioritySelect value={draft.priority} onChange={(priority) => onChange({ priority })} />
          {targetOptions && (
            <label className="flex items-center gap-1.5 text-xs text-subtle">
              <Target size={12} />
              {GROUP_COPY.target}
              <Select
                size="sm"
                aria-label={GROUP_COPY.target}
                options={targetOptions}
                value={draft.targetProjectId ?? NO_GROUP_VALUE}
                onChange={(value) => onChange({ targetProjectId: value === NO_GROUP_VALUE ? null : value })}
              />
            </label>
          )}
        </div>
      </div>
    </li>
  );
}
