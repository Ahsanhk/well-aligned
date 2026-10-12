import 'server-only';
import { FileState, FinishReason, MediaResolution, createPartFromUri, type File as GeminiFile, type GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS } from '@/constants/gemini';
import {
  GEMINI_FILE_ACTIVE_TIMEOUT_MS,
  GEMINI_FILE_POLL_INTERVAL_MS,
  MEETING_ANALYSIS_TIMEOUT_MS,
  MEETING_CONDENSED_INSTRUCTION,
  MEETING_MAX_OUTPUT_TOKENS,
  MEETING_SYSTEM_INSTRUCTION,
  MEETING_USER_PROMPT_INTRO,
  SHARED_PROJECT_KEYWORD,
} from '@/constants/meeting';
import type { SuggestedTodo, TranscriptSegment } from '@/types';
import { describeGeminiError, getGeminiClient, isGeminiRateLimited, isGeminiTimeout, shouldTryNextModel } from './gemini-client';
import { newId } from './ids';
import { meetingAnalysisResponseJsonSchema, meetingAnalysisSchema, type MeetingAnalysisOutput } from './schemas';
import { normalizeTimecode, timecodeToSeconds } from './timecode';

export type MeetingAnalysisErrorCode = 'missingKey' | 'rateLimited' | 'timeout' | 'fileFailed' | 'truncated' | 'failed';

export class MeetingAnalysisError extends Error {
  constructor(
    public readonly code: MeetingAnalysisErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

class TruncatedOutputError extends Error {}

export interface MeetingAnalysisInput {
  filePath: string;
  mimeType: string;
  displayName: string;
  context: string;
  groupProjects: { id: string; name: string }[];
}

export interface MeetingAnalysis {
  title: string;
  summary: string;
  transcript: TranscriptSegment[];
  suggestions: SuggestedTodo[];
  frameTimestamps: Map<string, string[]>;
  model: string;
}

interface SuggestionsWithFrames {
  suggestions: SuggestedTodo[];
  frameTimestamps: Map<string, string[]>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForActiveFile(ai: GoogleGenAI, name: string): Promise<GeminiFile> {
  const deadline = Date.now() + GEMINI_FILE_ACTIVE_TIMEOUT_MS;
  for (;;) {
    const file = await ai.files.get({ name });
    if (file.state === FileState.ACTIVE) return file;
    if (file.state === FileState.FAILED) {
      throw new MeetingAnalysisError('fileFailed', file.error?.message ?? 'Gemini file processing failed');
    }
    if (Date.now() > deadline) throw new MeetingAnalysisError('timeout', 'Gemini file did not become active in time');
    await sleep(GEMINI_FILE_POLL_INTERVAL_MS);
  }
}

function parseAnalysis(text: string | undefined, finishReason: FinishReason | undefined): MeetingAnalysisOutput {
  if (finishReason === FinishReason.MAX_TOKENS) throw new TruncatedOutputError('Output hit the token limit');
  if (!text) throw new MeetingAnalysisError('failed', `Empty response (${finishReason ?? 'no finish reason'})`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TruncatedOutputError('Response was not complete JSON');
  }
  const result = meetingAnalysisSchema.safeParse(parsed);
  if (!result.success) throw new MeetingAnalysisError('failed', result.error.message);
  return result.data;
}

async function generateOnce(ai: GoogleGenAI, model: string, file: GeminiFile, input: MeetingAnalysisInput, condensed: boolean) {
  const text = [MEETING_USER_PROMPT_INTRO, input.context, ...(condensed ? [MEETING_CONDENSED_INSTRUCTION] : [])].join('\n\n');
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [createPartFromUri(file.uri ?? '', file.mimeType ?? input.mimeType), { text }] }],
    config: {
      systemInstruction: MEETING_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseJsonSchema: meetingAnalysisResponseJsonSchema(),
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_LOW,
      maxOutputTokens: MEETING_MAX_OUTPUT_TOKENS,
      abortSignal: AbortSignal.timeout(MEETING_ANALYSIS_TIMEOUT_MS),
    },
  });
  return parseAnalysis(response.text, response.candidates?.[0]?.finishReason);
}

async function generateWithCondensedRetry(ai: GoogleGenAI, model: string, file: GeminiFile, input: MeetingAnalysisInput) {
  try {
    return await generateOnce(ai, model, file, input, false);
  } catch (error) {
    if (!(error instanceof TruncatedOutputError)) throw error;
    console.warn(`Gemini ${model} meeting output truncated, retrying condensed`);
  }
  try {
    return await generateOnce(ai, model, file, input, true);
  } catch (error) {
    if (error instanceof TruncatedOutputError) throw new MeetingAnalysisError('truncated', error.message);
    throw error;
  }
}

function toMeetingAnalysisError(error: unknown): MeetingAnalysisError {
  if (error instanceof MeetingAnalysisError) return error;
  if (isGeminiTimeout(error)) return new MeetingAnalysisError('timeout', describeGeminiError(error));
  if (isGeminiRateLimited(error)) return new MeetingAnalysisError('rateLimited', describeGeminiError(error));
  return new MeetingAnalysisError('failed', describeGeminiError(error));
}

function toTranscript(segments: MeetingAnalysisOutput['transcript']): TranscriptSegment[] {
  return segments
    .map((segment) => ({
      start: normalizeTimecode(segment.start),
      speaker: segment.speaker.trim() || 'Speaker',
      text: segment.text.trim(),
    }))
    .filter((segment) => segment.text.length > 0);
}

function matchProjectId(name: string, projects: { id: string; name: string }[]): string | null {
  const wanted = name.trim().toLowerCase();
  if (!wanted || wanted === SHARED_PROJECT_KEYWORD) return null;
  return projects.find((project) => project.name.trim().toLowerCase() === wanted)?.id ?? null;
}

function toSuggestions(output: MeetingAnalysisOutput['suggestions'], projects: { id: string; name: string }[]): SuggestionsWithFrames {
  const frameTimestamps = new Map<string, string[]>();
  const suggestions = output
    .filter((suggestion) => suggestion.title.length > 0)
    .map((suggestion): SuggestedTodo => {
      const id = newId();
      frameTimestamps.set(id, suggestion.frameTimestamps.filter((value) => timecodeToSeconds(value) !== null).map(normalizeTimecode));
      return {
        id,
        title: suggestion.title,
        details: suggestion.details,
        priority: suggestion.priority,
        timestamp: normalizeTimecode(suggestion.timestamp),
        quote: suggestion.quote,
        frames: [],
        suggestedProjectId: matchProjectId(suggestion.suggestedProject, projects),
        acceptedTodoId: null,
        dismissed: false,
      };
    });
  return { suggestions, frameTimestamps };
}

async function analyzeUploadedFile(ai: GoogleGenAI, file: GeminiFile, input: MeetingAnalysisInput): Promise<MeetingAnalysis> {
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const output = await generateWithCondensedRetry(ai, model, file, input);
      return {
        title: output.title,
        summary: output.summary,
        transcript: toTranscript(output.transcript),
        ...toSuggestions(output.suggestions, input.groupProjects),
        model,
      };
    } catch (error) {
      lastError = error;
      if (!shouldTryNextModel(error)) break;
      console.warn(`Gemini ${model} ${isGeminiTimeout(error) ? 'timed out' : 'unavailable'} for meeting analysis, trying next model`);
    }
  }
  throw toMeetingAnalysisError(lastError);
}

export async function analyzeMeeting(input: MeetingAnalysisInput): Promise<MeetingAnalysis> {
  const ai = getGeminiClient();
  if (!ai) throw new MeetingAnalysisError('missingKey');
  let uploadedName: string | undefined;
  try {
    const uploaded = await ai.files.upload({ file: input.filePath, config: { mimeType: input.mimeType, displayName: input.displayName } });
    uploadedName = uploaded.name;
    if (!uploadedName) throw new MeetingAnalysisError('fileFailed', 'Gemini did not return a file name');
    const active = await waitForActiveFile(ai, uploadedName);
    return await analyzeUploadedFile(ai, active, input);
  } catch (error) {
    throw toMeetingAnalysisError(error);
  } finally {
    if (uploadedName) {
      const name = uploadedName;
      await ai.files.delete({ name }).catch((error: unknown) => console.warn('Gemini file cleanup failed:', describeGeminiError(error)));
    }
  }
}
