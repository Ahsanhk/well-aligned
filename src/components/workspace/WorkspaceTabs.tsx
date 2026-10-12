'use client';

import { Tabs } from '@/components/ui/Tabs';
import { PROJECT_TABS } from '@/constants/meetings';
import { meetingsNeedingReview } from '@/lib/meeting-stats';
import { isOwnedBy } from '@/lib/owner';
import { openCount, todosByOrigin } from '@/lib/todo-origin';
import { useMeetingsStore } from '@/store/meetings';
import { useTodosStore } from '@/store/todos';
import type { ItemOwner, ProjectTab, Todo } from '@/types';

interface Props {
  owner: ItemOwner;
  value: ProjectTab;
  onChange: (tab: ProjectTab) => void;
  labels?: Record<ProjectTab, string>;
}

function ownedOpen(todos: Todo[], owner: ItemOwner, origin: 'client' | 'self') {
  return openCount(todosByOrigin(todos.filter((todo) => isOwnedBy(todo, owner)), origin));
}

export function WorkspaceTabs({ owner, value, onChange, labels }: Props) {
  const clientOpen = useTodosStore((state) => ownedOpen(state.todos, owner, 'client'));
  const backlogOpen = useTodosStore((state) => ownedOpen(state.todos, owner, 'self'));
  const reviewCount = useMeetingsStore((state) => meetingsNeedingReview(state.meetings));
  const counts: Record<ProjectTab, number> = { todos: clientOpen, backlog: backlogOpen, meetings: reviewCount };
  const tabs = PROJECT_TABS.map((tab) => ({
    value: tab.value,
    label: labels?.[tab.value] ?? tab.label,
    count: counts[tab.value] > 0 ? counts[tab.value] : undefined,
  }));
  return <Tabs label="Sections" tabs={tabs} value={value} onChange={onChange} />;
}
