'use client';

import { useCallback, useEffect, useState } from 'react';
import { SIDEBAR_COLLAPSE_STORAGE_KEY } from '@/constants/groups';
import { readStoredJson, writeStoredJson } from '@/lib/storage';

export function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    setCollapsed(readStoredJson<string[]>(SIDEBAR_COLLAPSE_STORAGE_KEY, []));
  }, []);

  const toggle = useCallback((key: string) => {
    setCollapsed((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      writeStoredJson(SIDEBAR_COLLAPSE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { isCollapsed: (key: string) => collapsed.includes(key), toggle };
}
