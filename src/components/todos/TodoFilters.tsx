'use client';

import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SELECTION_COPY, TODO_FILTERS } from '@/constants/status';
import { selectSelectionMode, useSelectionStore } from '@/store/selection';
import type { StatusCounts, TodoFilter } from '@/types';

interface Props {
  value: TodoFilter;
  counts: StatusCounts;
  onChange: (filter: TodoFilter) => void;
}

export function TodoFilters({ value, counts, onChange }: Props) {
  const isSelectionMode = useSelectionStore(selectSelectionMode);
  const setSelecting = useSelectionStore((state) => state.setSelecting);
  const tabs = TODO_FILTERS.map((filter) => ({ ...filter, count: counts[filter.value] }));
  return (
    <Tabs
      label="Filter todos"
      tabs={tabs}
      value={value}
      onChange={onChange}
      trailing={
        counts.all > 0 && (
          <Button
            variant={isSelectionMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelecting(!isSelectionMode)}
            aria-pressed={isSelectionMode}
          >
            <CheckSquare size={13} />
            {isSelectionMode ? SELECTION_COPY.done : SELECTION_COPY.select}
          </Button>
        )
      }
    />
  );
}
