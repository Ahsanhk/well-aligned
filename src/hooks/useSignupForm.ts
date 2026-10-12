'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ERRORS } from '@/constants/auth';
import { authErrorMessage, callbackUrl, safeNextPath } from '@/lib/auth';
import { signupSchema } from '@/lib/auth-schemas';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { SignupValues } from '@/types';
import { useAuthForm } from './useAuthForm';

const INITIAL: SignupValues = { fullName: '', email: '', password: '' };

export function useSignupForm(next: string | null) {
  const router = useRouter();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const signUp = useCallback(
    async ({ fullName, email, password }: SignupValues) => {
      const { data, error } = await getSupabaseBrowser().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: callbackUrl(window.location.origin, safeNextPath(next)),
        },
      });
      if (error) return authErrorMessage(error);
      if (data.user && data.user.identities?.length === 0) return AUTH_ERRORS.emailTaken;
      if (!data.session) {
        setPendingEmail(email);
        return null;
      }
      router.replace(safeNextPath(next));
      router.refresh();
      return null;
    },
    [next, router],
  );

  const form = useAuthForm(signupSchema, INITIAL, signUp);
  const resetPending = useCallback(() => setPendingEmail(null), []);

  return { ...form, pendingEmail, resetPending };
}
