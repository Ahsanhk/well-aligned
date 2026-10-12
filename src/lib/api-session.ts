import 'server-only';
import { API_ERRORS } from '@/constants/api-errors';
import type { SessionUser } from '@/types';
import { jsonError, withApiErrors } from './api-response';
import { getSessionUser, type SupabaseUserClient } from './supabase-server';

export interface ApiSession {
  supabase: SupabaseUserClient;
  user: SessionUser;
}

export function withSession<Args extends unknown[]>(handler: (session: ApiSession, ...args: Args) => Promise<Response>) {
  return withApiErrors(async (...args: Args): Promise<Response> => {
    const { supabase, user } = await getSessionUser();
    if (!user) return jsonError(401, API_ERRORS.unauthorized);
    return handler({ supabase, user }, ...args);
  });
}
