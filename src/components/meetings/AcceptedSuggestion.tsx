'use client';

import Link from 'next/link';
import { ArrowUpRight, CircleCheck } from 'lucide-react';
import { ownerTodoRoute } from '@/lib/owner';
import { useMeetingsStore } from '@/store/meetings';
import type { ItemOwner, SuggestedTodo } from '@/types';
import { TimestampChip } from './TimestampChip';

interface Props {
  fallbackOwner: ItemOwner;
  suggestion: SuggestedTodo;
}

export function AcceptedSuggestion({ fallbackOwner, suggestion }: Props) {
  const knownOwner = useMeetingsStore((state) =>
    suggestion.acceptedTodoId ? state.todoOwners[suggestion.acceptedTodoId] : undefined,
  );
  const owner = knownOwner ?? fallbackOwner;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-3 py-2.5">
      <CircleCheck size={16} className="shrink-0 text-success" />
      <span className="min-w-0 flex-1 truncate text-sm text-fg">{suggestion.title}</span>
      <span className="hidden sm:inline-flex">
        <TimestampChip timestamp={suggestion.timestamp} />
      </span>
      {suggestion.acceptedTodoId && (
        <Link
          href={ownerTodoRoute(owner, suggestion.acceptedTodoId)}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-success transition-colors hover:bg-success/10"
        >
          Added ✓
          <ArrowUpRight size={12} />
        </Link>
      )}
    </li>
  );
}
