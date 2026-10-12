import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { createApiToken, listApiTokens } from '@/lib/api-tokens';
import { apiTokenInputSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export const GET = withSession(async ({ supabase }: ApiSession) => Response.json(await listApiTokens(supabase)));

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request) => {
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = apiTokenInputSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  return Response.json(await createApiToken(supabase, user.id, input.data.name), { status: 201, headers: { 'Cache-Control': 'no-store' } });
});
