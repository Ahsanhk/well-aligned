import { API_ERRORS } from '@/constants/api-errors';
import { PROMPT_WARNINGS } from '@/constants/prompt';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getProject, getPromptTodos, setTodoPrompt, type DbClient } from '@/lib/db';
import { getGroup } from '@/lib/groups-db';
import { generatePromptWithGemini, PromptGenerationError } from '@/lib/gemini';
import { nowIso } from '@/lib/ids';
import { buildTemplatePrompt, ensurePromptCompleteness } from '@/lib/prompt-template';
import { promptRequestSchema } from '@/lib/schemas';
import { materializeScreenshot } from '@/lib/uploads';
import type { GeneratedPrompt, Project, PromptBuildInput, PromptGroupContext, PromptResponse, PromptScreenshotRef, PromptTodoContext, Todo } from '@/types';

export const runtime = 'nodejs';

async function buildGroupContext(client: DbClient, project: Project): Promise<PromptGroupContext | null> {
  if (!project.groupId) return null;
  const group = await getGroup(client, project.groupId);
  return group ? { name: group.name } : null;
}

async function toPromptTodoContext(todo: Todo): Promise<PromptTodoContext> {
  const refs = await Promise.all(
    todo.screenshots.map(async (shot): Promise<PromptScreenshotRef | null> => {
      const absolutePath = await materializeScreenshot(shot).catch((error: unknown) => {
        console.error('Screenshot cache failed:', error instanceof Error ? error.message : error);
        return null;
      });
      return absolutePath ? { absolutePath, mimeType: shot.mimeType, originalName: shot.originalName } : null;
    }),
  );
  return { todo, screenshots: refs.filter((ref): ref is PromptScreenshotRef => ref !== null) };
}

async function generate(input: PromptBuildInput): Promise<{ prompt: GeneratedPrompt; warning: string | null }> {
  try {
    const result = await generatePromptWithGemini(input);
    return {
      prompt: { text: ensurePromptCompleteness(result.text, input), source: 'ai', model: result.model, generatedAt: nowIso() },
      warning: null,
    };
  } catch (error) {
    const code = error instanceof PromptGenerationError ? error.code : 'failed';
    if (code !== 'missingKey') console.error('Prompt generation fell back to template:', error instanceof Error ? error.message : error);
    return {
      prompt: { text: buildTemplatePrompt(input), source: 'template', model: null, generatedAt: nowIso() },
      warning: PROMPT_WARNINGS[code],
    };
  }
}

export const POST = withSession(async ({ supabase }: ApiSession, request: Request) => {
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const parsed = promptRequestSchema.safeParse(body.body);
  if (!parsed.success) return invalidInput(parsed.error);
  const { projectId, todoIds, extraInstructions } = parsed.data;

  const project = await getProject(supabase, projectId);
  if (!project) return jsonError(404, API_ERRORS.projectNotFound);
  const found = await getPromptTodos(supabase, project, todoIds);
  const todos = todoIds.map((id) => found.find((todo) => todo.id === id));
  if (todos.some((todo) => !todo)) return jsonError(404, API_ERRORS.todosNotInProject);

  const input: PromptBuildInput = {
    project,
    extraInstructions,
    group: await buildGroupContext(supabase, project),
    todos: await Promise.all((todos as Todo[]).map(toPromptTodoContext)),
  };

  const { prompt, warning } = await generate(input);
  const [onlyId] = todoIds;
  if (todoIds.length === 1 && onlyId) await setTodoPrompt(supabase, onlyId, prompt);

  return Response.json({ prompt, todoIds, warning } satisfies PromptResponse);
});
