'use client';

import { useEffect, useState } from 'react';
import { ELAPSED_TICK_MS } from '@/constants/meetings';
import { secondsSince } from '@/lib/timestamp';

export function useElapsedSeconds(startIso: string | null, enabled = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || !startIso) return;
    const timer = setInterval(() => setNow(Date.now()), ELAPSED_TICK_MS);
    return () => clearInterval(timer);
  }, [enabled, startIso]);

  return startIso ? secondsSince(startIso, now) : 0;
}
