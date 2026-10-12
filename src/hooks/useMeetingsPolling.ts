'use client';

import { useEffect } from 'react';
import { MEETING_POLL_INTERVAL_MS } from '@/constants/meetings';
import { isMeetingActive } from '@/lib/meeting-stats';
import { useMeetingsStore } from '@/store/meetings';

export function useMeetingsPolling() {
  const hasActive = useMeetingsStore((state) => state.meetings.some(isMeetingActive));
  const refreshActive = useMeetingsStore((state) => state.refreshActive);

  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => void refreshActive(), MEETING_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasActive, refreshActive]);
}
