'use client';

import { useCallback, useState } from 'react';
import { replaceTabInUrl } from '@/lib/project-tab';
import { useSelectionStore } from '@/store/selection';
import type { ProjectTab } from '@/types';

export function useWorkspaceTab(initialTab: ProjectTab) {
  const [tab, setTab] = useState<ProjectTab>(initialTab);
  const clearSelection = useSelectionStore((state) => state.clear);

  const changeTab = useCallback(
    (next: ProjectTab) => {
      setTab(next);
      clearSelection();
      replaceTabInUrl(next);
    },
    [clearSelection],
  );

  return { tab, changeTab };
}
