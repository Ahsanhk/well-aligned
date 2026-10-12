import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_MISSING_ENV_ERROR, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@/constants/supabase';
import type { SupabaseSchema } from '@/types';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string | null,
  ) {
    super(message);
  }
}

export type SupabaseAdmin = SupabaseClient<SupabaseSchema>;

let client: SupabaseAdmin | null = null;

export function getSupabaseAdmin(): SupabaseAdmin {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error(SUPABASE_MISSING_ENV_ERROR);
  client ??= createClient<SupabaseSchema>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
