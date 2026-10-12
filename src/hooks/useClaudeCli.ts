'use client';

import { useEffect } from 'react';
import { useIntegrationStore } from '@/store/integration';

export function useClaudeCli(refreshOnMount = true) {
  const status = useIntegrationStore((state) => state.status);
  const isChecking = useIntegrationStore((state) => state.isChecking);
  const check = useIntegrationStore((state) => state.check);

  useEffect(() => {
    if (refreshOnMount) void check();
  }, [refreshOnMount, check]);

  return { cliMissing: status?.claudeCliFound === false, isChecking, check };
}
