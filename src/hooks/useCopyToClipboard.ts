'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { COPY_FEEDBACK_MS } from '@/constants/app';
import { TOAST_COPY } from '@/constants/toast';
import { copyText } from '@/lib/clipboard';
import { useToastStore } from '@/store/toast';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async (text: string) => {
    const succeeded = await copyText(text);
    if (!succeeded) {
      useToastStore.getState().show(TOAST_COPY.copyFailed, { tone: 'danger' });
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  }, []);

  return { copied, copy };
}
