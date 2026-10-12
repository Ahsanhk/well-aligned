import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AUTH_ROUTES } from '@/constants/auth';
import { getSessionUser } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await getSessionUser();
  if (!user) redirect(AUTH_ROUTES.login);
  return <AppShell user={user}>{children}</AppShell>;
}
