'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authErrorMessage, safeNextPath } from '@/lib/auth';
import { loginSchema } from '@/lib/auth-schemas';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { LoginValues } from '@/types';
import { useAuthForm } from './useAuthForm';

const INITIAL: LoginValues = { email: '', password: '' };

export function useLoginForm(next: string | null) {
  const router = useRouter();

  const signIn = useCallback(
    async (values: LoginValues) => {
      const { error } = await getSupabaseBrowser().auth.signInWithPassword(values);
      if (error) return authErrorMessage(error);
      router.replace(safeNextPath(next));
      router.refresh();
      return null;
    },
    [next, router],
  );

  return useAuthForm(loginSchema, INITIAL, signIn);
}
