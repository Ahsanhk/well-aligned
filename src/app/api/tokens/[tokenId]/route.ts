import { API_ERRORS } from '@/constants/api-errors';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteApiToken } from '@/lib/api-tokens';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ tokenId: string }>;
}

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  if (!(await deleteApiToken(supabase, (await params).tokenId))) return jsonError(404, API_ERRORS.tokenNotFound);
  return Response.json({ ok: true });
});
