'use client';

import { useContext } from 'react';
import { SessionUserContext } from '@/components/layout/SessionUserProvider';
import { firstName } from '@/lib/greeting';

export function useFirstName() {
  const user = useContext(SessionUserContext);
  return user ? firstName(user.fullName) : '';
}
