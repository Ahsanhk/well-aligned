import type { AuthError } from '@supabase/supabase-js';
import { AUTH_ERRORS, AUTH_ROUTES, NEXT_PARAM, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import type { PasswordStrength } from '@/types';

export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return AUTH_ROUTES.home;
  return next;
}

export function withNext(route: string, next: string | null | undefined): string {
  const safe = safeNextPath(next);
  return safe === AUTH_ROUTES.home ? route : `${route}?${NEXT_PARAM}=${encodeURIComponent(safe)}`;
}

export function callbackUrl(origin: string, next: string): string {
  const url = new URL(AUTH_ROUTES.callback, origin);
  url.searchParams.set(NEXT_PARAM, safeNextPath(next));
  return url.toString();
}

export function authErrorMessage(error: AuthError): string {
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') {
    return AUTH_ERRORS.rateLimited;
  }
  if (error.code === 'invalid_credentials') return AUTH_ERRORS.invalidCredentials;
  if (error.code === 'user_already_exists' || error.code === 'email_exists') return AUTH_ERRORS.emailTaken;
  if (error.code === 'email_not_confirmed') return AUTH_ERRORS.emailNotConfirmed;
  if (error.code === 'weak_password') return AUTH_ERRORS.weakPassword;
  if (error.name === 'AuthRetryableFetchError') return AUTH_ERRORS.network;
  return error.message || AUTH_ERRORS.generic;
}

export function passwordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN_LENGTH) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
  const score = 1 + (password.length >= 12 ? 1 : 0) + (variety >= 2 ? 1 : 0) + (variety >= 3 ? 1 : 0);
  return Math.min(score, 4) as PasswordStrength;
}
