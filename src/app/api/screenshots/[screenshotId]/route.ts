import { API_ERRORS } from '@/constants/api-errors';
import { SCREENSHOT_CACHE_CONTROL } from '@/constants/storage';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteScreenshot, findScreenshot } from '@/lib/db';
import { downloadScreenshotObject } from '@/lib/uploads';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ screenshotId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const screenshot = await findScreenshot(supabase, (await params).screenshotId);
  if (!screenshot) return jsonError(404, API_ERRORS.screenshotNotFound);
  const blob = await downloadScreenshotObject(screenshot.fileName);
  if (!blob) return jsonError(404, API_ERRORS.screenshotFileMissing);
  return new Response(blob.stream(), {
    headers: {
      'Content-Type': screenshot.mimeType,
      'Content-Length': String(blob.size),
      'Cache-Control': SCREENSHOT_CACHE_CONTROL,
      'Content-Disposition': `inline; filename="${screenshot.id}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
});

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const todo = await deleteScreenshot(supabase, (await params).screenshotId);
  if (!todo) return jsonError(404, API_ERRORS.screenshotNotFound);
  return Response.json(todo);
});
