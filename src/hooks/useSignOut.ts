'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/constants/auth';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { resetClientStores } from '@/lib/reset-client-stores';

export function useSignOut() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    await getSupabaseBrowser().auth.signOut();
    resetClientStores();
    router.replace(AUTH_ROUTES.login);
    router.refresh();
  }, [router]);

  return { signOut, isSigningOut };
}
