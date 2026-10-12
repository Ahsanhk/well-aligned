import 'server-only';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DATA_DIR_NAME,
  FRAME_STORAGE_PATH_PATTERN,
  GROUP_SCREENSHOT_STORAGE_PATH_PATTERN,
  GROUP_STORAGE_FOLDER,
  SCREENSHOT_CACHE_DIR_NAME,
  SCREENSHOT_CACHE_FILE_PATTERN,
  SCREENSHOT_EXTENSIONS,
  SCREENSHOT_MAX_BYTES,
  SCREENSHOT_MIME_TYPES,
  SCREENSHOT_STORAGE_PATH_PATTERN,
  type ScreenshotMimeType,
} from '@/constants/storage';
import { BUCKET_MISSING_CODE, BUCKET_MISSING_MESSAGE, SCREENSHOTS_BUCKET, STORAGE_REMOVE_BATCH_SIZE } from '@/constants/supabase';
import type { ItemOwner, Screenshot } from '@/types';
import { newId } from './ids';
import { DatabaseError, getSupabaseAdmin } from './supabase-admin';

const IMAGE_SIGNATURES: { mimeType: ScreenshotMimeType; matches: (bytes: Uint8Array) => boolean }[] = [
  {
    mimeType: 'image/png',
    matches: (bytes) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte),
  },
  { mimeType: 'image/jpeg', matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mimeType: 'image/gif', matches: (bytes) => asciiAt(bytes, 0, 'GIF8') },
  { mimeType: 'image/webp', matches: (bytes) => asciiAt(bytes, 0, 'RIFF') && asciiAt(bytes, 8, 'WEBP') },
];

function asciiAt(bytes: Uint8Array, offset: number, text: string): boolean {
  return [...text].every((char, index) => bytes[offset + index] === char.charCodeAt(0));
}

function toStorageError(message: string): DatabaseError {
  return new DatabaseError(`Screenshot storage failed: ${message}`, message === BUCKET_MISSING_MESSAGE ? BUCKET_MISSING_CODE : null);
}

function bucket() {
  return getSupabaseAdmin().storage.from(SCREENSHOTS_BUCKET);
}

export function isScreenshotMimeType(value: string): value is ScreenshotMimeType {
  return (SCREENSHOT_MIME_TYPES as string[]).includes(value);
}

export function detectImageMimeType(bytes: Uint8Array): ScreenshotMimeType | null {
  return IMAGE_SIGNATURES.find((signature) => signature.matches(bytes))?.mimeType ?? null;
}

export function isWithinScreenshotSizeLimit(size: number): boolean {
  return size > 0 && size <= SCREENSHOT_MAX_BYTES;
}

export function isSafeStoragePath(storagePath: string): boolean {
  return (
    SCREENSHOT_STORAGE_PATH_PATTERN.test(storagePath) ||
    GROUP_SCREENSHOT_STORAGE_PATH_PATTERN.test(storagePath) ||
    FRAME_STORAGE_PATH_PATTERN.test(storagePath)
  );
}

export async function listStorageFolder(folder: string, limit: number): Promise<{ name: string; size: number }[]> {
  const { data, error } = await bucket().list(folder, { limit });
  if (error) throw toStorageError(error.message);
  return data
    .filter((entry) => entry.id !== null)
    .map((entry) => ({ name: entry.name, size: Number((entry.metadata as { size?: number } | null)?.size ?? 0) }));
}

export function todoStorageFolder(userId: string, owner: ItemOwner, todoId: string): string {
  return owner.kind === 'group' ? `${userId}/${GROUP_STORAGE_FOLDER}/${owner.id}/${todoId}` : `${userId}/${owner.id}/${todoId}`;
}

export function screenshotStoragePath(
  userId: string,
  owner: ItemOwner,
  todoId: string,
  screenshotId: string,
  mimeType: ScreenshotMimeType,
): string {
  return `${todoStorageFolder(userId, owner, todoId)}/${screenshotId}.${SCREENSHOT_EXTENSIONS[mimeType]}`;
}

export async function moveScreenshotObject(fromPath: string, toPath: string): Promise<boolean> {
  if (!isSafeStoragePath(fromPath) || !isSafeStoragePath(toPath)) return false;
  const { error } = await bucket().move(fromPath, toPath);
  return !error;
}

export async function uploadScreenshotObject(storagePath: string, bytes: Uint8Array, mimeType: ScreenshotMimeType): Promise<void> {
  const { error } = await bucket().upload(storagePath, bytes, { contentType: mimeType, upsert: false });
  if (error) throw toStorageError(error.message);
}

export async function copyScreenshotObject(fromPath: string, toPath: string): Promise<boolean> {
  if (!isSafeStoragePath(fromPath) || !isSafeStoragePath(toPath)) return false;
  const { error } = await bucket().copy(fromPath, toPath);
  return !error;
}

export async function downloadScreenshotObject(storagePath: string): Promise<Blob | null> {
  if (!isSafeStoragePath(storagePath)) return null;
  const { data, error } = await bucket().download(storagePath);
  return error ? null : data;
}

export async function removeScreenshotObjects(storagePaths: string[]): Promise<void> {
  const safePaths = storagePaths.filter(isSafeStoragePath);
  for (let start = 0; start < safePaths.length; start += STORAGE_REMOVE_BATCH_SIZE) {
    const { error } = await bucket().remove(safePaths.slice(start, start + STORAGE_REMOVE_BATCH_SIZE));
    if (error) console.error('Screenshot cleanup failed:', error.message);
  }
}

export function getScreenshotCacheDir(): string {
  return path.join(process.cwd(), DATA_DIR_NAME, SCREENSHOT_CACHE_DIR_NAME);
}

function cacheFileName(screenshot: Screenshot): string {
  const extension = isScreenshotMimeType(screenshot.mimeType)
    ? SCREENSHOT_EXTENSIONS[screenshot.mimeType]
    : path.extname(screenshot.fileName).slice(1);
  return `${screenshot.id}.${extension}`;
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    return (await stat(absolutePath)).isFile();
  } catch {
    return false;
  }
}

export async function materializeScreenshot(screenshot: Screenshot): Promise<string | null> {
  const fileName = cacheFileName(screenshot);
  if (!SCREENSHOT_CACHE_FILE_PATTERN.test(fileName)) return null;
  const absolutePath = path.join(getScreenshotCacheDir(), fileName);
  if (await fileExists(absolutePath)) return absolutePath;
  const blob = await downloadScreenshotObject(screenshot.fileName);
  if (!blob) return null;
  await mkdir(getScreenshotCacheDir(), { recursive: true });
  const temp = `${absolutePath}.${newId()}.tmp`;
  try {
    await writeFile(temp, new Uint8Array(await blob.arrayBuffer()));
    await rename(temp, absolutePath);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  return absolutePath;
}

export async function readCachedScreenshotBase64(absolutePath: string): Promise<string | null> {
  const resolved = path.resolve(absolutePath);
  if (path.dirname(resolved) !== getScreenshotCacheDir() || !SCREENSHOT_CACHE_FILE_PATTERN.test(path.basename(resolved))) return null;
  try {
    return (await readFile(resolved)).toString('base64');
  } catch {
    return null;
  }
}

export async function removeCachedScreenshots(screenshots: Screenshot[]): Promise<void> {
  await Promise.all(
    screenshots
      .map(cacheFileName)
      .filter((fileName) => SCREENSHOT_CACHE_FILE_PATTERN.test(fileName))
      .map((fileName) => rm(path.join(getScreenshotCacheDir(), fileName), { force: true }).catch(() => undefined)),
  );
}
