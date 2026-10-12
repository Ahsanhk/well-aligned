'use client';

import { useCallback, useEffect, useState } from 'react';
import { RESEND_COOLDOWN_SECONDS } from '@/constants/auth';
import { authErrorMessage, callbackUrl, safeNextPath } from '@/lib/auth';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function useResendConfirmation(email: string, next: string | null) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasResent, setWasResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = useCallback(async () => {
    setIsPending(true);
    setError(null);
    setWasResent(false);
    const { error: resendError } = await getSupabaseBrowser().auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: callbackUrl(window.location.origin, safeNextPath(next)) },
    });
    setIsPending(false);
    if (resendError) {
      setError(authErrorMessage(resendError));
      return;
    }
    setWasResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, next]);

  return { resend, cooldown, isPending, error, wasResent, canResend: cooldown <= 0 && !isPending };
}
