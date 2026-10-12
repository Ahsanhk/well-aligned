import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteTodo, updateTodo, TodoRuleError } from '@/lib/db';
import { todoPatchSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ todoId: string }>;
}

export const PATCH = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { todoId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = todoPatchSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  try {
    const todo = await updateTodo(supabase, todoId, input.data);
    if (!todo) return jsonError(404, API_ERRORS.todoNotFound);
    return Response.json(todo);
  } catch (error) {
    if (error instanceof TodoRuleError) return jsonError(400, API_ERRORS[error.rule]);
    throw error;
  }
});

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  if (!(await deleteTodo(supabase, (await params).todoId))) return jsonError(404, API_ERRORS.todoNotFound);
  return Response.json({ ok: true });
});
