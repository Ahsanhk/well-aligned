import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/constants/supabase';
import type { SupabaseSchema } from '@/types';

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowser(): SupabaseClient<SupabaseSchema> {
  client ??= createBrowserClient<SupabaseSchema>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}
