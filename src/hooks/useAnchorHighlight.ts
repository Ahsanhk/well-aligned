'use client';

import { useEffect } from 'react';
import { ANCHOR_FLASH_MS } from '@/constants/meetings';

export function useAnchorHighlight(ready: boolean, highlightClass: string) {
  useEffect(() => {
    if (!ready) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add(highlightClass);
    const timer = setTimeout(() => element.classList.remove(highlightClass), ANCHOR_FLASH_MS);
    return () => clearTimeout(timer);
  }, [ready, highlightClass]);
}
