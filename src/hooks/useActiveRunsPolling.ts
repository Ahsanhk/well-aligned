'use client';

import { useEffect } from 'react';
import { RUN_POLL_INTERVAL_MS } from '@/constants/claude';
import { useRunsStore } from '@/store/runs';
import { useActiveRuns } from './useActiveRuns';

export function useActiveRunsPolling() {
  const activeIds = useActiveRuns()
    .map((run) => run.id)
    .join(',');
  const refresh = useRunsStore((state) => state.refresh);
  const loadActive = useRunsStore((state) => state.loadActive);

  useEffect(() => {
    void loadActive();
  }, [loadActive]);

  useEffect(() => {
    if (!activeIds) return;
    const ids = activeIds.split(',');
    const timer = setInterval(() => ids.forEach((id) => void refresh(id)), RUN_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIds, refresh]);
}
