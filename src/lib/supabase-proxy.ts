import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/constants/supabase';
import type { SupabaseSchema } from '@/types';

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<SupabaseSchema>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  return { response: () => response, isSignedIn: Boolean(data?.claims.sub) };
}

export function redirectWithCookies(request: NextRequest, source: NextResponse, target: string) {
  const redirect = NextResponse.redirect(new URL(target, request.nextUrl.origin));
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
