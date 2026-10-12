'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FOLDER_DETECT_DEBOUNCE_MS } from '@/constants/stack';
import { api, errorMessage } from '@/lib/api-client';
import { looksLikeAbsolutePath } from '@/lib/repo-path';
import type { FolderDetectionStatus, FolderInspection } from '@/types';

export function useFolderDetection(path: string, onDetected: (inspection: FolderInspection) => void) {
  const [status, setStatus] = useState<FolderDetectionStatus>('idle');
  const [inspection, setInspection] = useState<FolderInspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const lastPath = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const detect = useCallback(async (value: string) => {
    clearTimer();
    const target = value.trim();
    if (target === lastPath.current) return;
    lastPath.current = target;
    const id = ++requestId.current;
    if (!looksLikeAbsolutePath(target)) {
      setStatus('idle');
      setInspection(null);
      setError(null);
      return;
    }
    setStatus('detecting');
    setError(null);
    try {
      const result = await api.inspectFolder(target);
      if (id !== requestId.current) return;
      setInspection(result);
      setStatus('detected');
      onDetectedRef.current(result);
    } catch (caught) {
      if (id !== requestId.current) return;
      setInspection(null);
      setError(errorMessage(caught));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    clearTimer();
    timer.current = setTimeout(() => void detect(path), FOLDER_DETECT_DEBOUNCE_MS);
    return clearTimer;
  }, [path, detect]);

  const flush = useCallback(() => void detect(path), [detect, path]);

  return { status, inspection, error, detect, flush };
}
