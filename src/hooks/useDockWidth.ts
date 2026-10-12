'use client';

import { useCallback, useEffect, useState, type PointerEvent } from 'react';
import { DOCK_WIDTH, DOCK_WIDTH_STORAGE_KEY } from '@/constants/claude';
import { readStoredJson, writeStoredJson } from '@/lib/storage';

function clampWidth(width: number) {
  return Math.min(DOCK_WIDTH.max, Math.max(DOCK_WIDTH.min, Math.round(width)));
}

export function useDockWidth() {
  const [width, setWidth] = useState<number>(DOCK_WIDTH.initial);

  useEffect(() => {
    setWidth(clampWidth(readStoredJson<number>(DOCK_WIDTH_STORAGE_KEY, DOCK_WIDTH.initial)));
  }, []);

  const startResize = useCallback((event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    const onMove = (moveEvent: globalThis.PointerEvent) => setWidth(clampWidth(window.innerWidth - moveEvent.clientX));
    const onUp = (upEvent: globalThis.PointerEvent) => {
      const next = clampWidth(window.innerWidth - upEvent.clientX);
      setWidth(next);
      writeStoredJson(DOCK_WIDTH_STORAGE_KEY, next);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  return { width, startResize };
}
