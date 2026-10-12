import { SCREENSHOTS_LABEL } from '@/constants/prompt';
import type { PromptBuildInput, PromptTodoContext } from '@/types';
import { collectScreenshotPaths, headingLabels } from './prompt-context';

function screenshotsBlock(paths: { absolutePath: string; description: string }[]): string {
  return [SCREENSHOTS_LABEL, ...paths.map((shot) => `- ${shot.absolutePath} — ${shot.description}`)].join('\n');
}

function taskSection(input: PromptBuildInput, { todo, screenshots }: PromptTodoContext, index: number): string {
  const labels = headingLabels(input, todo);
  const parts = [`## ${index + 1}. ${labels.map((label) => `${label} `).join('')}${todo.title}`];
  if (todo.details.trim()) parts.push(todo.details.trim());
  if (screenshots.length) {
    parts.push(screenshotsBlock(screenshots.map((shot) => ({ absolutePath: shot.absolutePath, description: shot.originalName }))));
  }
  return parts.join('\n');
}

function withExtraInstructions(text: string, input: PromptBuildInput): string {
  return input.extraInstructions ? `${text}\n\n${input.extraInstructions}` : text;
}

export function buildTemplatePrompt(input: PromptBuildInput): string {
  return withExtraInstructions(input.todos.map((entry, index) => taskSection(input, entry, index)).join('\n\n'), input);
}

const HEADING_PATTERN = /^##\s+(\d+)\.\s+((?:\[[^\]]*\]\s*)*)(.*)$/;

function normalizeHeadings(text: string, input: PromptBuildInput): string {
  return text
    .split('\n')
    .map((line) => {
      const match = HEADING_PATTERN.exec(line);
      const entry = match ? input.todos[Number(match[1]) - 1] : undefined;
      if (!match || !entry) return line;
      const labels = headingLabels(input, entry.todo);
      return `## ${match[1]}. ${labels.map((label) => `${label} `).join('')}${match[3]?.trim() ?? ''}`;
    })
    .join('\n');
}

export function ensurePromptCompleteness(text: string, input: PromptBuildInput): string {
  const normalized = normalizeHeadings(text.trim(), input);
  const missing = collectScreenshotPaths(input).filter((absolutePath) => !normalized.includes(absolutePath));
  const body = missing.length
    ? `${normalized}\n\n${screenshotsBlock(missing.map((absolutePath) => ({ absolutePath, description: 'screenshot' })))}`
    : normalized;
  return withExtraInstructions(body, input);
}
