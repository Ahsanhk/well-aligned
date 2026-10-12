'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { SELECTION_COPY } from '@/constants/status';
import { openDoneCounts } from '@/lib/todo-filter';
import { useMeetingsStore } from '@/store/meetings';
import { selectSelectionMode, useSelectionStore } from '@/store/selection';
import type { Todo } from '@/types';
import { SelectionToggle } from './SelectionToggle';
import { TodoRow } from './TodoRow';

interface Props {
  todos: Todo[];
  title: ReactNode;
  collapsible?: boolean;
  tone?: 'default' | 'shared';
}

export function TodoGroup({ todos, title, collapsible = false, tone = 'default' }: Props) {
  const collapsed = useDisclosure(false);
  const isOpen = !collapsible || !collapsed.isOpen;
  const ids = todos.map((todo) => todo.id);
  const allSelected = useSelectionStore((state) => ids.every((id) => state.selectedIds.includes(id)));
  const isSelectionMode = useSelectionStore(selectSelectionMode);
  const setMany = useSelectionStore((state) => state.setMany);
  const meetings = useMeetingsStore((state) => state.meetings);
  const meetingTitleOf = (meetingId: string | null) =>
    meetingId ? meetings.find((meeting) => meeting.id === meetingId)?.title || null : null;
  const { open, done } = openDoneCounts(todos);

  return (
    <section className="flex flex-col gap-1.5">
      <header className="group/header flex h-7 items-center gap-2.5 pr-2 pl-2.5 sm:pl-3">
        <SelectionToggle
          checked={allSelected}
          onChange={() => setMany(ids, !allSelected)}
          label={SELECTION_COPY.selectGroup}
          isSelectionMode={isSelectionMode}
          revealGroup="header"
        />
        {collapsible && (
          <button
            type="button"
            onClick={collapsed.toggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            className="-ml-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded text-subtle hover:text-fg"
          >
            <ChevronDown size={13} className={cn('transition-transform duration-200', !isOpen && '-rotate-90')} />
          </button>
        )}
        <h3 className="flex min-w-0 items-center gap-1.5 text-xs">{title}</h3>
        <span className="ml-auto shrink-0 text-[11px] text-subtle tabular-nums">
          {open} open{done > 0 && ` · ${done} done`}
        </span>
      </header>
      {isOpen && (
        <ul
          className={cn(
            'animate-fade-in divide-y divide-line/60 overflow-hidden rounded-xl border bg-surface/60',
            tone === 'shared' ? 'border-indigo/25 bg-indigo/[0.03]' : 'border-line/80',
          )}
        >
          {todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} meetingTitle={meetingTitleOf(todo.meetingId)} />
          ))}
        </ul>
      )}
    </section>
  );
}
