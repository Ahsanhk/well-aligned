import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { createTodo, listTodos } from '@/lib/db';
import { todoInputSchema, todoOriginSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ projectId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const originParam = new URL(request.url).searchParams.get('origin');
  const origin = originParam === null ? undefined : todoOriginSchema.safeParse(originParam);
  if (origin && !origin.success) return jsonError(400, API_ERRORS.invalidOrigin);
  const todos = await listTodos(supabase, (await params).projectId, origin?.data);
  if (!todos) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(todos);
});

export const POST = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { projectId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = todoInputSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const todo = await createTodo(supabase, projectId, input.data);
  if (!todo) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(todo, { status: 201 });
});
