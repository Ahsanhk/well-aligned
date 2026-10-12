'use client';

import { useCallback, useState } from 'react';
import { api, errorMessage } from '@/lib/api-client';
import { toastError } from '@/store/toast';

export function useRepoFolder(repoPath: string, onPicked: (path: string) => void) {
  const [isPicking, setIsPicking] = useState(false);

  const browse = useCallback(async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const { path } = await api.pickFolder(repoPath.trim());
      if (path) onPicked(path);
    } catch (error) {
      toastError(errorMessage(error));
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, repoPath, onPicked]);

  return { browse, isPicking };
}
