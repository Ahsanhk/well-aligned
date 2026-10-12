import type { NextRequest } from 'next/server';
import { AUTH_PAGES, AUTH_ROUTES, NEXT_PARAM, PUBLIC_PATHS } from '@/constants/auth';
import { safeNextPath, withNext } from '@/lib/auth';
import { redirectWithCookies, refreshSession } from '@/lib/supabase-proxy';

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await refreshSession(request);
  const { pathname, search, searchParams } = request.nextUrl;

  if (!isSignedIn && !PUBLIC_PATHS.some((path) => matchesPath(pathname, path))) {
    return redirectWithCookies(request, response(), withNext(AUTH_ROUTES.login, `${pathname}${search}`));
  }
  if (isSignedIn && AUTH_PAGES.includes(pathname)) {
    return redirectWithCookies(request, response(), safeNextPath(searchParams.get(NEXT_PARAM)));
  }
  return response();
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|_next/static|_next/image|_next/data|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|woff2?)$).*)',
  ],
};
