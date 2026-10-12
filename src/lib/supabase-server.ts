import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_MISSING_ENV_ERROR, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/constants/supabase';
import type { SessionUser, SupabaseSchema } from '@/types';
import { toSessionUser } from './session-user';

export type SupabaseUserClient = SupabaseClient<SupabaseSchema>;

export async function createServerSupabase(): Promise<SupabaseUserClient> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error(SUPABASE_MISSING_ENV_ERROR);
  const cookieStore = await cookies();
  return createServerClient<SupabaseSchema>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

export async function getSessionUser(): Promise<{ supabase: SupabaseUserClient; user: SessionUser | null }> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  return { supabase, user: data?.claims ? toSessionUser(data.claims) : null };
}
