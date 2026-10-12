'use client';

import { useMemo } from 'react';
import { isRunActive } from '@/lib/run-progress';
import { useRunsStore } from '@/store/runs';

export function useActiveRuns() {
  const runs = useRunsStore((state) => state.runs);
  return useMemo(() => Object.values(runs).filter(isRunActive), [runs]);
}

export function useAllRuns() {
  const runs = useRunsStore((state) => state.runs);
  return useMemo(() => Object.values(runs), [runs]);
}
