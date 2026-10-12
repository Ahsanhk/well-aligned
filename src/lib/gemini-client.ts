import 'server-only';
import { ApiError, GoogleGenAI } from '@google/genai';
import { MODEL_UNAVAILABLE_STATUSES, RETRYABLE_STATUSES } from '@/constants/gemini';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export function isGeminiTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError' || /aborted/i.test(error.message));
}

export function isGeminiRateLimited(error: unknown): boolean {
  return error instanceof ApiError && RETRYABLE_STATUSES.includes(error.status);
}

export function shouldTryNextModel(error: unknown): boolean {
  if (isGeminiTimeout(error) || isGeminiRateLimited(error)) return true;
  return error instanceof ApiError && MODEL_UNAVAILABLE_STATUSES.includes(error.status);
}

export function describeGeminiError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
