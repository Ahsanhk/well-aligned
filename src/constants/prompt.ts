export const PROMPT_TIMEOUT_MS = 30000;

export const PROMPT_WITH_IMAGES_TIMEOUT_MS = 45000;

export const MAX_TODOS_PER_PROMPT = 25;

export const MAX_PROMPT_IMAGES = 12;

export const EXTRA_INSTRUCTIONS_MAX_LENGTH = 4000;

export const PROMPT_SYSTEM_INSTRUCTION = [
  'You turn a developer\'s terse todos into a compact task list to paste into Claude Code. Claude Code is already open in the project repository with full context, so output ONLY the todos: no title, no project context, no exploration advice, no scope lists, no acceptance criteria, no assumptions, no verification steps, no summary.',
  '',
  'Output plain GitHub-flavoured markdown in exactly this shape, with no preamble, closing remarks or code fences:',
  '## 1. <labels><imperative title>',
  '<1 to 3 sentences rewriting the todo as a clear, concrete instruction>',
  'Screenshots:',
  '- <exact absolute path> — <a few words on what it shows>',
  '',
  'Rules:',
  '- One "## N." heading per todo, numbered in the given order starting at 1, even when there is only one todo.',
  '- <labels> is the "Heading labels" value given for that todo, followed by a space. When it is "none", write no labels.',
  '- Keep every specific from the notes: names, numbers, copy text, colours, pages, screens. Never invent requirements, file names, steps or details.',
  '- Screenshots are attached as images, each preceded by its absolute path. Look at each image only to describe in a few words what it shows. Copy every path exactly as given. Leave out the "Screenshots:" block for a todo without screenshots.',
  '- Only for todos whose Type is Bug, add two short lines directly after the instruction sentences and before the "Screenshots:" block: "Steps to reproduce: ..." and "Expected: <what should happen> / Actual: <what happens now>", taken only from the notes and screenshots. The notes usually describe what happens now; use that as Actual. Write "not specified" only for a part the notes and screenshots truly do not give.',
  '- Be concise. No filler and no emojis.',
  '',
  'Return JSON of the form {"prompt": "<the markdown>"}.',
].join('\n');

export const PROMPT_USER_INTRO = 'Rewrite these todos in the required format.';

export const SHARED_TAG = (groupName: string) => `Shared · ${groupName}`;

export const NO_LABELS = 'none';

export const TODO_SOURCE_LABELS = {
  client: 'Client request',
  self: 'Found by the developer while testing or using the app',
} as const;

export const TODO_SOURCE_TAGS = {
  client: 'Client request',
  self: 'Found while testing',
} as const;

export const TODO_CATEGORY_LABELS = {
  bug: 'Bug',
  missing: 'Missing feature',
  improvement: 'Improvement',
} as const;

export const SCREENSHOTS_LABEL = 'Screenshots:';

export const PROMPT_WARNINGS = {
  missingKey: 'GEMINI_API_KEY is not set, so a template prompt was generated. Add the key to .env.local for AI-enhanced prompts.',
  rateLimited: 'Gemini is busy or the free quota is used up, so a template prompt was generated. Try again in a minute.',
  timeout: 'Gemini took too long, so a template prompt was generated. Try again.',
  failed: 'Gemini could not generate the prompt, so a template prompt was generated.',
} as const;
