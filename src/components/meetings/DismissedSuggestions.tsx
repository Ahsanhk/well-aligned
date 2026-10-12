'use client';

import { ChevronDown } from 'lucide-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import type { SuggestedTodo } from '@/types';
import { TimestampChip } from './TimestampChip';

export function DismissedSuggestions({ suggestions }: { suggestions: SuggestedTodo[] }) {
  const disclosure = useDisclosure();
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={disclosure.toggle}
        aria-expanded={disclosure.isOpen}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-md px-1 py-0.5 text-xs text-subtle transition-colors hover:text-fg"
      >
        <ChevronDown size={13} className={cn('transition-transform duration-200', !disclosure.isOpen && '-rotate-90')} />
        Dismissed ({suggestions.length})
      </button>
      {disclosure.isOpen && (
        <ul className="animate-fade-in flex flex-col gap-1.5">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} className="flex items-center gap-3 rounded-lg border border-dashed border-line px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-subtle line-through decoration-subtle/50">
                {suggestion.title}
              </span>
              <TimestampChip timestamp={suggestion.timestamp} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
