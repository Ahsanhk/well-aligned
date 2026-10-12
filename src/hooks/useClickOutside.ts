'use client';

import { useEffect, type RefObject } from 'react';

type Refs = RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[];

export function useClickOutside(refs: Refs, onOutside: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const list = Array.isArray(refs) ? refs : [refs];
    const handler = (event: PointerEvent) => {
      const target = event.target as Node;
      if (list.some((ref) => ref.current?.contains(target))) return;
      onOutside();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [refs, onOutside, enabled]);
}
