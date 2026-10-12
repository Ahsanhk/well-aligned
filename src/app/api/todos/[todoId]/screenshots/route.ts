import { API_ERRORS } from '@/constants/api-errors';
import { SCREENSHOT_FORM_FIELD, SCREENSHOT_MAX_BYTES, SCREENSHOT_MAX_FILES_PER_UPLOAD, type ScreenshotMimeType } from '@/constants/storage';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { addScreenshots, getTodo } from '@/lib/db';
import { newId } from '@/lib/ids';
import { todoOwner } from '@/lib/owner';
import { detectImageMimeType, removeScreenshotObjects, screenshotStoragePath, uploadScreenshotObject } from '@/lib/uploads';
import type { ScreenshotInsert } from '@/types';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ todoId: string }>;
}

interface PreparedUpload {
  bytes: Uint8Array;
  mimeType: ScreenshotMimeType;
  originalName: string;
}

async function prepareUpload(file: File): Promise<PreparedUpload | string> {
  if (file.size === 0) return `${API_ERRORS.emptyFile} (${file.name})`;
  if (file.size > SCREENSHOT_MAX_BYTES) return `${API_ERRORS.fileTooLarge} (${file.name})`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectImageMimeType(bytes);
  if (!mimeType) return `${API_ERRORS.notAnImage} (${file.name})`;
  return { bytes, mimeType, originalName: file.name || 'screenshot' };
}

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request, { params }: Context) => {
  const todo = await getTodo(supabase, (await params).todoId);
  if (!todo) return jsonError(404, API_ERRORS.todoNotFound);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, API_ERRORS.invalidForm);
  }
  const files = form.getAll(SCREENSHOT_FORM_FIELD).filter((entry): entry is File => entry instanceof File);
  if (!files.length) return jsonError(400, API_ERRORS.noFiles);
  if (files.length > SCREENSHOT_MAX_FILES_PER_UPLOAD) return jsonError(400, API_ERRORS.tooManyFiles);

  const prepared: PreparedUpload[] = [];
  for (const file of files) {
    const result = await prepareUpload(file);
    if (typeof result === 'string') return jsonError(400, result);
    prepared.push(result);
  }

  const rows: ScreenshotInsert[] = prepared.map((upload) => {
    const id = newId();
    return {
      id,
      todo_id: todo.id,
      storage_path: screenshotStoragePath(user.id, todoOwner(todo), todo.id, id, upload.mimeType),
      original_name: upload.originalName,
      mime_type: upload.mimeType,
      size: upload.bytes.byteLength,
    };
  });
  const storagePaths = rows.map((row) => row.storage_path);

  try {
    await Promise.all(rows.map((row, index) => uploadScreenshotObject(row.storage_path, prepared[index]!.bytes, prepared[index]!.mimeType)));
    const updated = await addScreenshots(supabase, todo, rows);
    if (!updated) {
      await removeScreenshotObjects(storagePaths);
      return jsonError(404, API_ERRORS.todoNotFound);
    }
    return Response.json(updated);
  } catch (error) {
    await removeScreenshotObjects(storagePaths);
    throw error;
  }
});
