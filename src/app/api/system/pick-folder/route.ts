import { SYSTEM_ERRORS } from '@/constants/system';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { isPickerAllowed, pickFolder } from '@/lib/folder-picker';
import { pickFolderSchema } from '@/lib/system-schemas';
import type { PickFolderResponse } from '@/types';

export const runtime = 'nodejs';

async function readOptionalJson(request: Request) {
  try {
    const text = await request.text();
    return text.trim() ? (JSON.parse(text) as unknown) : undefined;
  } catch {
    return undefined;
  }
}

export const POST = withSession(async (_session: ApiSession, request: Request) => {
  if (!isPickerAllowed(request)) return jsonError(403, SYSTEM_ERRORS.pickerUnavailable);
  const parsed = pickFolderSchema.safeParse(await readOptionalJson(request));
  const startPath = parsed.success ? parsed.data.startPath : undefined;
  try {
    const path = await pickFolder(startPath);
    return Response.json({ path } satisfies PickFolderResponse);
  } catch (error) {
    console.error('Folder picker failed:', error);
    return jsonError(500, SYSTEM_ERRORS.pickerFailed);
  }
});
