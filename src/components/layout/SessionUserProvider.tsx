'use client';

import { createContext, type ReactNode } from 'react';
import type { SessionUser } from '@/types';

export const SessionUserContext = createContext<SessionUser | null>(null);

export function SessionUserProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <SessionUserContext.Provider value={user}>{children}</SessionUserContext.Provider>;
}
