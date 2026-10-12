'use client';

import { useEffect, useRef } from 'react';
import { hasModifier, isTypingTarget } from '@/lib/keyboard';

interface Shortcut {
  key: string;
  mod: boolean;
}

interface Options {
  enabled?: boolean;
  allowInModal?: boolean;
}

export function useKeyboardShortcut(shortcut: Shortcut, onTrigger: () => void, options: Options = {}) {
  const { enabled = true, allowInModal = false } = options;
  const handlerRef = useRef(onTrigger);

  useEffect(() => {
    handlerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return;
      if (shortcut.mod !== hasModifier(event) || event.altKey) return;
      if (!shortcut.mod && isTypingTarget(event.target)) return;
      if (!allowInModal && document.querySelector('[aria-modal="true"]')) return;
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut.key, shortcut.mod, enabled, allowInModal]);
}
