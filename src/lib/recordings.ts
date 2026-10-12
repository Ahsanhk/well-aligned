import 'server-only';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { DATA_DIR_NAME } from '@/constants/storage';
import {
  GENERIC_BINARY_MIME,
  RECORDING_DEFAULT_NAME,
  RECORDING_EXTENSION_MIMES,
  RECORDING_EXTENSION_PATTERN,
  RECORDING_MIME_EXTENSIONS,
  RECORDING_PART_SUFFIX,
  RECORDINGS_DIR_NAME,
} from '@/constants/meeting';
import { isUuid } from './ids';

export class RecordingTooLargeError extends Error {}

export interface RecordingMedia {
  mimeType: string;
  extension: string;
}

export interface StoredRecording extends RecordingMedia {
  filePath: string;
}

export function getRecordingsDir(): string {
  return path.join(process.cwd(), DATA_DIR_NAME, RECORDINGS_DIR_NAME);
}

function extensionOf(fileName: string): string {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return RECORDING_EXTENSION_PATTERN.test(extension) ? extension : '';
}

export function resolveRecordingMedia(contentType: string | null, fileName: string): RecordingMedia | null {
  const mimeType = (contentType ?? '').split(';')[0]!.trim().toLowerCase();
  const fileExtension = extensionOf(fileName);
  const isMedia = mimeType.startsWith('video/') || mimeType.startsWith('audio/');
  if (isMedia) {
    const extension = RECORDING_MIME_EXTENSIONS[mimeType] ?? (RECORDING_EXTENSION_MIMES[fileExtension] ? fileExtension : '');
    return extension ? { mimeType, extension } : null;
  }
  if (mimeType && mimeType !== GENERIC_BINARY_MIME) return null;
  const derived = RECORDING_EXTENSION_MIMES[fileExtension];
  return derived ? { mimeType: derived, extension: fileExtension } : null;
}

export function sanitizeRecordingName(rawName: string): string {
  const base = path.basename(rawName.replace(/\\/g, '/')).replace(/[\u0000-\u001f]/g, '').trim();
  return base.slice(0, 300) || RECORDING_DEFAULT_NAME;
}

export function titleFromRecordingName(fileName: string): string {
  const extension = path.extname(fileName);
  return (extension ? fileName.slice(0, -extension.length) : fileName).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function defaultMeetingTitle(videoName: string, meetingDate: string): string {
  return titleFromRecordingName(videoName) || `Meeting ${meetingDate}`;
}

export function recordingPath(meetingId: string, extension: string): string {
  if (!isUuid(meetingId) || !RECORDING_EXTENSION_PATTERN.test(extension)) throw new Error('Unsafe recording path');
  return path.join(getRecordingsDir(), `${meetingId}.${extension}`);
}

export async function saveRecordingStream(
  body: ReadableStream<Uint8Array>,
  meetingId: string,
  extension: string,
  maxBytes: number,
): Promise<number> {
  await mkdir(getRecordingsDir(), { recursive: true });
  const target = recordingPath(meetingId, extension);
  const partial = `${target}${RECORDING_PART_SUFFIX}`;
  let total = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      total += chunk.length;
      if (total > maxBytes) callback(new RecordingTooLargeError(`Recording exceeds ${maxBytes} bytes`));
      else callback(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>), limiter, createWriteStream(partial, { flags: 'wx' }));
    await rename(partial, target);
    return total;
  } catch (error) {
    await rm(partial, { force: true });
    throw error;
  }
}

export async function findRecording(meetingId: string): Promise<StoredRecording | null> {
  if (!isUuid(meetingId)) return null;
  let entries: string[];
  try {
    entries = await readdir(getRecordingsDir());
  } catch {
    return null;
  }
  const fileName = entries.find((entry) => entry.startsWith(`${meetingId}.`) && !entry.endsWith(RECORDING_PART_SUFFIX));
  if (!fileName) return null;
  const extension = path.extname(fileName).slice(1);
  const mimeType = RECORDING_EXTENSION_MIMES[extension];
  if (!mimeType) return null;
  return { filePath: recordingPath(meetingId, extension), extension, mimeType };
}

export async function deleteRecording(meetingId: string): Promise<void> {
  if (!isUuid(meetingId)) return;
  let entries: string[];
  try {
    entries = await readdir(getRecordingsDir());
  } catch {
    return;
  }
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith(`${meetingId}.`))
      .map((entry) => rm(path.join(getRecordingsDir(), entry), { force: true }).catch(() => undefined)),
  );
}
