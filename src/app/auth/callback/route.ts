import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { AUTH_ROUTES, NEXT_PARAM } from '@/constants/auth';
import { safeNextPath } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

async function completeSignIn(searchParams: URLSearchParams): Promise<boolean> {
  const supabase = await createServerSupabase();
  const code = searchParams.get('code');
  if (code) return !(await supabase.auth.exchangeCodeForSession(code)).error;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  if (tokenHash && type) return !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  if (await completeSignIn(searchParams)) {
    return NextResponse.redirect(new URL(safeNextPath(searchParams.get(NEXT_PARAM)), origin));
  }
  return NextResponse.redirect(new URL(`${AUTH_ROUTES.login}?error=callback`, origin));
}
