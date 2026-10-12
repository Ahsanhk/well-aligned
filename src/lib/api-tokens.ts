import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { API_TOKEN_BYTES, API_TOKEN_PREFIX } from '@/constants/claude-link';
import { TABLES } from '@/constants/supabase';
import type { ApiToken, CreatedApiToken } from '@/types';
import { orThrow, rowOrThrow, type DbClient } from './db';
import { isUuid, nowIso } from './ids';
import { getSupabaseAdmin } from './supabase-admin';

const PUBLIC_COLUMNS = 'id, name, last_used_at, created_at';

type PublicTokenRow = { id: string; name: string; last_used_at: string | null; created_at: string };

function toApiToken(row: PublicTokenRow): ApiToken {
  return { id: row.id, name: row.name, lastUsedAt: row.last_used_at, createdAt: row.created_at };
}

export function generateRawToken(): string {
  return `${API_TOKEN_PREFIX}${randomBytes(API_TOKEN_BYTES).toString('base64url')}`;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function listApiTokens(client: DbClient): Promise<ApiToken[]> {
  const rows = orThrow(await client.from(TABLES.apiTokens).select(PUBLIC_COLUMNS).order('created_at', { ascending: false }));
  return rows.map(toApiToken);
}

export async function createApiToken(client: DbClient, userId: string, name: string): Promise<CreatedApiToken> {
  const token = generateRawToken();
  const row = rowOrThrow(
    await client.from(TABLES.apiTokens).insert({ user_id: userId, name, token_hash: hashToken(token) }).select(PUBLIC_COLUMNS).single(),
  );
  return { ...toApiToken(row), token };
}

export async function deleteApiToken(client: DbClient, tokenId: string): Promise<boolean> {
  if (!isUuid(tokenId)) return false;
  return orThrow(await client.from(TABLES.apiTokens).delete().eq('id', tokenId).select('id')).length > 0;
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export async function resolveTokenUser(rawToken: string | null): Promise<string | null> {
  if (!rawToken?.startsWith(API_TOKEN_PREFIX)) return null;
  const admin = getSupabaseAdmin();
  const row = orThrow(await admin.from(TABLES.apiTokens).select('id, user_id').eq('token_hash', hashToken(rawToken)).maybeSingle());
  if (!row) return null;
  await admin.from(TABLES.apiTokens).update({ last_used_at: nowIso() }).eq('id', row.id);
  return row.user_id;
}
