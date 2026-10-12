import 'server-only';
import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  FFMPEG_CANDIDATES,
  FFMPEG_VERSION_TIMEOUT_MS,
  FFPROBE_CANDIDATES,
  FFPROBE_TIMEOUT_MS,
  FRAME_END_MARGIN_SECONDS,
  FRAME_EXTENSION,
  FRAME_EXTRACT_CONCURRENCY,
  FRAME_EXTRACT_TIMEOUT_MS,
  FRAME_JPEG_QUALITY,
  FRAME_MAX_PER_SUGGESTION,
  FRAME_MAX_WIDTH,
  FRAME_MIN_GAP_SECONDS,
} from '@/constants/meeting';
import { newId } from './ids';
import { formatTimecode, timecodeToSeconds } from './timecode';

const run = promisify(execFile);

export interface MediaBinaries {
  ffmpeg: string;
  ffprobe: string;
}

export interface MediaProbe {
  durationSeconds: number;
  hasVideo: boolean;
}

export interface FrameRequest {
  suggestionId: string;
  timestamps: string[];
}

export interface ExtractedFrame {
  id: string;
  suggestionId: string;
  timestamp: string;
  filePath: string;
  width: number;
  height: number;
}

interface ProbeOutput {
  format?: { duration?: string };
  streams?: { codec_type?: string; width?: number; height?: number; disposition?: { attached_pic?: number } }[];
}

const resolved: Partial<MediaBinaries> = {};

async function firstWorking(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      await run(candidate, ['-version'], { timeout: FFMPEG_VERSION_TIMEOUT_MS });
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

export async function resolveMediaBinaries(): Promise<MediaBinaries | null> {
  resolved.ffmpeg ??= (await firstWorking(FFMPEG_CANDIDATES)) ?? undefined;
  resolved.ffprobe ??= (await firstWorking(FFPROBE_CANDIDATES)) ?? undefined;
  return resolved.ffmpeg && resolved.ffprobe ? { ffmpeg: resolved.ffmpeg, ffprobe: resolved.ffprobe } : null;
}

async function probeJson(ffprobe: string, filePath: string, entries: string): Promise<ProbeOutput> {
  const { stdout } = await run(ffprobe, ['-v', 'error', '-show_entries', entries, '-of', 'json', filePath], {
    timeout: FFPROBE_TIMEOUT_MS,
    maxBuffer: 4 * 1024 * 1024,
  });
  return JSON.parse(stdout) as ProbeOutput;
}

export async function probeMedia(binaries: MediaBinaries, filePath: string): Promise<MediaProbe> {
  const output = await probeJson(binaries.ffprobe, filePath, 'format=duration:stream=codec_type:stream_disposition=attached_pic');
  const durationSeconds = Number(output.format?.duration ?? 0);
  const hasVideo = (output.streams ?? []).some((stream) => stream.codec_type === 'video' && stream.disposition?.attached_pic !== 1);
  return { durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0, hasVideo };
}

export function planFrameSeconds(timestamps: string[], durationSeconds: number): number[] {
  const limit = durationSeconds - FRAME_END_MARGIN_SECONDS;
  const candidates = timestamps
    .map(timecodeToSeconds)
    .filter((seconds): seconds is number => seconds !== null && seconds >= 0 && seconds <= limit);
  const kept: number[] = [];
  for (const seconds of candidates) {
    if (kept.length >= FRAME_MAX_PER_SUGGESTION) break;
    if (kept.every((other) => Math.abs(other - seconds) >= FRAME_MIN_GAP_SECONDS)) kept.push(seconds);
  }
  return kept.sort((a, b) => a - b);
}

async function extractOne(binaries: MediaBinaries, filePath: string, seconds: number, outputPath: string) {
  await run(
    binaries.ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      seconds.toFixed(3),
      '-i',
      filePath,
      '-frames:v',
      '1',
      '-vf',
      `scale='min(${FRAME_MAX_WIDTH},iw)':-2`,
      '-q:v',
      String(FRAME_JPEG_QUALITY),
      '-y',
      outputPath,
    ],
    { timeout: FRAME_EXTRACT_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
  );
  if (!(await stat(outputPath)).size) throw new Error('ffmpeg produced an empty frame');
  const output = await probeJson(binaries.ffprobe, outputPath, 'stream=width,height');
  const stream = output.streams?.[0];
  return { width: stream?.width ?? 0, height: stream?.height ?? 0 };
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++;
      try {
        results[index] = { status: 'fulfilled', value: await tasks[index]!() };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

export async function extractFrames(
  binaries: MediaBinaries,
  filePath: string,
  durationSeconds: number,
  requests: FrameRequest[],
  outputDir: string,
): Promise<ExtractedFrame[]> {
  const jobs = requests.flatMap((request) =>
    planFrameSeconds(request.timestamps, durationSeconds).map((seconds) => ({ suggestionId: request.suggestionId, seconds, id: newId() })),
  );
  const results = await runWithConcurrency(
    jobs.map((job) => async (): Promise<ExtractedFrame> => {
      const outputPath = path.join(outputDir, `${job.id}.${FRAME_EXTENSION}`);
      const size = await extractOne(binaries, filePath, job.seconds, outputPath);
      return { id: job.id, suggestionId: job.suggestionId, timestamp: formatTimecode(job.seconds), filePath: outputPath, ...size };
    }),
    FRAME_EXTRACT_CONCURRENCY,
  );
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const job = jobs[index]!;
      console.warn(`Frame at ${formatTimecode(job.seconds)} failed:`, result.reason instanceof Error ? result.reason.message : result.reason);
    }
  });
  return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
}
