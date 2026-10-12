import { API_ERRORS } from '@/constants/api-errors';
import { SYSTEM_ERRORS } from '@/constants/system';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { expandHome, isAbsolutePath, isDirectory } from '@/lib/fs-checks';
import { isLocalRequest } from '@/lib/local-request';
import { inspectFolder } from '@/lib/stack-detector';
import { inspectFolderSchema } from '@/lib/system-schemas';
import type { FolderInspection } from '@/types';

export const runtime = 'nodejs';

export const POST = withSession(async (_session: ApiSession, request: Request) => {
  if (!isLocalRequest(request)) return jsonError(403, SYSTEM_ERRORS.notLocal);
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = inspectFolderSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const folder = expandHome(input.data.path);
  if (!isAbsolutePath(folder)) return jsonError(400, SYSTEM_ERRORS.pathNotAbsolute);
  if (!(await isDirectory(folder))) return jsonError(404, SYSTEM_ERRORS.pathNotDirectory);
  return Response.json((await inspectFolder(folder)) satisfies FolderInspection);
});
