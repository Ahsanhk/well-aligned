import 'server-only';
import type { GoogleGenAI, Part } from '@google/genai';
import { GEMINI_MODELS } from '@/constants/gemini';
import { MAX_PROMPT_IMAGES, PROMPT_SYSTEM_INSTRUCTION, PROMPT_TIMEOUT_MS, PROMPT_WITH_IMAGES_TIMEOUT_MS } from '@/constants/prompt';
import type { PromptBuildInput } from '@/types';
import { describeGeminiError, getGeminiClient, isGeminiRateLimited, isGeminiTimeout, shouldTryNextModel } from './gemini-client';
import { buildPromptContext, screenshotImageLabel } from './prompt-context';
import { geminiPromptOutputSchema, geminiPromptResponseJsonSchema } from './schemas';
import { readCachedScreenshotBase64 } from './uploads';

export type PromptGenerationErrorCode = 'missingKey' | 'rateLimited' | 'timeout' | 'failed';

export class PromptGenerationError extends Error {
  constructor(
    public readonly code: PromptGenerationErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export interface GeminiPromptResult {
  text: string;
  model: string;
}

function getClient(): GoogleGenAI {
  const ai = getGeminiClient();
  if (!ai) throw new PromptGenerationError('missingKey');
  return ai;
}

async function buildImageParts(input: PromptBuildInput): Promise<Part[]> {
  const refs = input.todos
    .flatMap((entry, todoIndex) => entry.screenshots.map((shot) => ({ shot, todoIndex })))
    .slice(0, MAX_PROMPT_IMAGES);
  const loaded = await Promise.all(
    refs.map(async ({ shot, todoIndex }) => {
      const data = await readCachedScreenshotBase64(shot.absolutePath);
      if (!data) return [];
      return [{ text: screenshotImageLabel(todoIndex, shot.absolutePath) }, { inlineData: { mimeType: shot.mimeType, data } }];
    }),
  );
  return loaded.flat();
}

async function generate(ai: GoogleGenAI, model: string, parts: Part[], hasImages: boolean) {
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: PROMPT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseJsonSchema: geminiPromptResponseJsonSchema(),
      abortSignal: AbortSignal.timeout(hasImages ? PROMPT_WITH_IMAGES_TIMEOUT_MS : PROMPT_TIMEOUT_MS),
    },
  });
  return response.text;
}

function toPromptGenerationError(error: unknown) {
  if (error instanceof PromptGenerationError) return error;
  if (isGeminiTimeout(error)) return new PromptGenerationError('timeout');
  if (isGeminiRateLimited(error)) return new PromptGenerationError('rateLimited', describeGeminiError(error));
  return new PromptGenerationError('failed', describeGeminiError(error));
}

function parseOutput(text: string | undefined): string {
  if (!text) throw new PromptGenerationError('failed', 'Empty response');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new PromptGenerationError('failed', 'Response was not JSON');
  }
  const result = geminiPromptOutputSchema.safeParse(parsed);
  if (!result.success) throw new PromptGenerationError('failed', result.error.message);
  return result.data.prompt;
}

export async function generatePromptWithGemini(input: PromptBuildInput): Promise<GeminiPromptResult> {
  const ai = getClient();
  const imageParts = await buildImageParts(input);
  const parts: Part[] = [{ text: buildPromptContext(input) }, ...imageParts];
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      return { text: parseOutput(await generate(ai, model, parts, imageParts.length > 0)), model };
    } catch (error) {
      lastError = error;
      if (!shouldTryNextModel(error)) break;
      console.warn(`Gemini ${model} ${isGeminiTimeout(error) ? 'timed out' : 'unavailable'}, trying next model`);
    }
  }
  throw toPromptGenerationError(lastError);
}
