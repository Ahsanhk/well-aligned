'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { isImageFile, nameClipboardImage } from '@/lib/images';

export function usePasteImages(
  scopeRef: RefObject<HTMLElement | null>,
  onImages: (files: File[]) => void,
  enabled = true,
) {
  const handlerRef = useRef(onImages);

  useEffect(() => {
    handlerRef.current = onImages;
  }, [onImages]);

  useEffect(() => {
    if (!enabled) return;
    const handler = (event: ClipboardEvent) => {
      const target = event.target as Node | null;
      const inScope = scopeRef.current?.contains(target) || target === document.body;
      if (!inScope || document.querySelector('[aria-modal="true"]')) return;
      const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile);
      if (files.length === 0) return;
      event.preventDefault();
      handlerRef.current(files.map(nameClipboardImage));
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [scopeRef, enabled]);
}
