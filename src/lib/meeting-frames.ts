import 'server-only';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import {
  FRAME_EXTENSION,
  FRAME_LIST_LIMIT,
  FRAME_MIME_TYPE,
  FRAME_ORIGINAL_NAME_PREFIX,
  FRAME_STORAGE_FOLDER,
  FRAME_TEMP_DIR_NAME,
} from '@/constants/meeting';
import { DATA_DIR_NAME } from '@/constants/storage';
import type { ItemOwner, ScreenshotInsert, SuggestedTodo, SuggestionFrame } from '@/types';
import { extractFrames, probeMedia, resolveMediaBinaries, type FrameRequest, type MediaBinaries } from './frame-extractor';
import { newId } from './ids';
import { copyScreenshotObject, listStorageFolder, removeScreenshotObjects, screenshotStoragePath, uploadScreenshotObject } from './uploads';

export interface FrameCaptureInput {
  filePath: string;
  userId: string;
  meetingId: string;
  frameTimestamps: Map<string, string[]>;
}

export interface FrameCopyTarget {
  userId: string;
  owner: ItemOwner;
  todoId: string;
  meetingId: string;
  frames: SuggestionFrame[];
}

let warnedMissingBinaries = false;

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function meetingFrameFolder(userId: string, meetingId: string): string {
  return `${userId}/${FRAME_STORAGE_FOLDER}/${meetingId}`;
}

export function frameStoragePath(userId: string, meetingId: string, frameId: string): string {
  return `${meetingFrameFolder(userId, meetingId)}/${frameId}.${FRAME_EXTENSION}`;
}

function frameOriginalName(frame: SuggestionFrame): string {
  return `${FRAME_ORIGINAL_NAME_PREFIX}${frame.timestamp.replace(/:/g, '-')}.${FRAME_EXTENSION}`;
}

async function uploadFrames(
  binaries: MediaBinaries,
  input: FrameCaptureInput,
  requests: FrameRequest[],
  durationSeconds: number,
  tempDir: string,
) {
  const extracted = await extractFrames(binaries, input.filePath, durationSeconds, requests, tempDir);
  const uploaded = await Promise.all(
    extracted.map(async (frame) => {
      const storagePath = frameStoragePath(input.userId, input.meetingId, frame.id);
      try {
        await uploadScreenshotObject(storagePath, new Uint8Array(await readFile(frame.filePath)), FRAME_MIME_TYPE);
        const saved: SuggestionFrame = { id: frame.id, timestamp: frame.timestamp, storagePath, width: frame.width, height: frame.height };
        return { suggestionId: frame.suggestionId, frame: saved };
      } catch (error) {
        console.warn(`Frame upload failed for meeting ${input.meetingId}:`, describe(error));
        return null;
      }
    }),
  );
  const bySuggestion = new Map<string, SuggestionFrame[]>();
  for (const entry of uploaded) {
    if (!entry) continue;
    bySuggestion.set(entry.suggestionId, [...(bySuggestion.get(entry.suggestionId) ?? []), entry.frame]);
  }
  bySuggestion.forEach((frames) => frames.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  return bySuggestion;
}

export async function captureSuggestionFrames(input: FrameCaptureInput): Promise<Map<string, SuggestionFrame[]>> {
  const requests: FrameRequest[] = [...input.frameTimestamps]
    .filter(([, timestamps]) => timestamps.length > 0)
    .map(([suggestionId, timestamps]) => ({ suggestionId, timestamps }));
  if (!requests.length) return new Map();
  const binaries = await resolveMediaBinaries();
  if (!binaries) {
    if (!warnedMissingBinaries) console.warn('ffmpeg/ffprobe not found; skipping meeting frame capture');
    warnedMissingBinaries = true;
    return new Map();
  }
  const tempDir = path.join(process.cwd(), DATA_DIR_NAME, FRAME_TEMP_DIR_NAME, `${input.meetingId}-${newId()}`);
  try {
    const probe = await probeMedia(binaries, input.filePath);
    if (!probe.hasVideo || probe.durationSeconds <= 0) return new Map();
    await mkdir(tempDir, { recursive: true });
    return await uploadFrames(binaries, input, requests, probe.durationSeconds, tempDir);
  } catch (error) {
    console.warn(`Frame capture failed for meeting ${input.meetingId}:`, describe(error));
    return new Map();
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export function withFrames(suggestions: SuggestedTodo[], frames: Map<string, SuggestionFrame[]>): SuggestedTodo[] {
  return suggestions.map((suggestion) => ({ ...suggestion, frames: frames.get(suggestion.id) ?? [] }));
}

export function framePaths(frames: Map<string, SuggestionFrame[]>): string[] {
  return [...frames.values()].flat().map((frame) => frame.storagePath);
}

export async function removeMeetingFrames(userId: string | null, meetingId: string, knownPaths: string[]): Promise<void> {
  const paths = new Set(knownPaths);
  if (userId) {
    try {
      const folder = meetingFrameFolder(userId, meetingId);
      (await listStorageFolder(folder, FRAME_LIST_LIMIT)).forEach((entry) => paths.add(`${folder}/${entry.name}`));
    } catch (error) {
      console.warn(`Listing frames for meeting ${meetingId} failed:`, describe(error));
    }
  }
  await removeScreenshotObjects([...paths]);
}

async function frameSizes(userId: string, meetingId: string): Promise<Map<string, number>> {
  try {
    const folder = meetingFrameFolder(userId, meetingId);
    const entries = await listStorageFolder(folder, FRAME_LIST_LIMIT);
    return new Map(entries.map((entry) => [`${folder}/${entry.name}`, entry.size]));
  } catch (error) {
    console.warn(`Listing frames for meeting ${meetingId} failed:`, describe(error));
    return new Map();
  }
}

export async function copyFramesToTodos(targets: FrameCopyTarget[]): Promise<ScreenshotInsert[]> {
  const withFramesOnly = targets.filter((target) => target.frames.length > 0);
  if (!withFramesOnly.length) return [];
  const first = withFramesOnly[0]!;
  const sizes = await frameSizes(first.userId, first.meetingId);
  const copies = await Promise.all(
    withFramesOnly.flatMap((target) =>
      target.frames.map(async (frame): Promise<ScreenshotInsert | null> => {
        const id = newId();
        const storagePath = screenshotStoragePath(target.userId, target.owner, target.todoId, id, FRAME_MIME_TYPE);
        if (!(await copyScreenshotObject(frame.storagePath, storagePath))) {
          console.warn(`Copying frame ${frame.id} to todo ${target.todoId} failed`);
          return null;
        }
        return {
          id,
          todo_id: target.todoId,
          storage_path: storagePath,
          original_name: frameOriginalName(frame),
          mime_type: FRAME_MIME_TYPE,
          size: sizes.get(frame.storagePath) ?? 0,
        };
      }),
    ),
  );
  return copies.filter((copy): copy is ScreenshotInsert => copy !== null);
}
