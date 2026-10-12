'use client';

import { useCallback, useState } from 'react';
import { useRunsStore } from '@/store/runs';
import type { Run, StartRunRequest } from '@/types';

export function useStartRun() {
  const start = useRunsStore((state) => state.start);
  const [isStarting, setIsStarting] = useState(false);

  const startRun = useCallback(
    async (body: StartRunRequest): Promise<Run | null> => {
      if (isStarting) return null;
      setIsStarting(true);
      const run = await start(body);
      setIsStarting(false);
      return run;
    },
    [isStarting, start],
  );

  return { startRun, isStarting };
}
