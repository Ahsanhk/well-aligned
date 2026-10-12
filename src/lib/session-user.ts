import type { JwtPayload } from '@supabase/supabase-js';
import type { SessionUser } from '@/types';

function metadataString(claims: JwtPayload, key: string): string | null {
  const value: unknown = claims.user_metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function toSessionUser(claims: JwtPayload): SessionUser | null {
  if (!claims.sub) return null;
  const email = claims.email ?? '';
  return {
    id: claims.sub,
    email,
    fullName: metadataString(claims, 'full_name') ?? metadataString(claims, 'name') ?? email.split('@')[0] ?? '',
  };
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';
}
