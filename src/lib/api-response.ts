import type { z } from 'zod';
import { API_ERRORS } from '@/constants/api-errors';
import { DATABASE_NOT_SET_UP_CODES } from '@/constants/supabase';
import type { ApiErrorBody } from '@/types';
import { DatabaseError } from './supabase-admin';

export function jsonError(status: number, error: string): Response {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}

export function invalidInput(error: z.ZodError): Response {
  const issue = error.issues[0];
  if (!issue) return jsonError(400, API_ERRORS.invalidInput);
  const field = issue.path.map(String).join('.');
  return jsonError(400, field ? `${API_ERRORS.invalidInput} ${field}: ${issue.message}` : `${API_ERRORS.invalidInput} ${issue.message}`);
}

export async function readJsonBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

function isDatabaseNotSetUp(error: unknown): boolean {
  return error instanceof DatabaseError && error.code !== null && DATABASE_NOT_SET_UP_CODES.includes(error.code);
}

export function withApiErrors<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (isDatabaseNotSetUp(error)) return jsonError(503, API_ERRORS.databaseNotSetUp);
      console.error('API route failed:', error);
      return jsonError(500, API_ERRORS.internal);
    }
  };
}
