import { API_ERRORS } from '@/constants/api-errors';
import { jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { moveTodo, TodoMoveError } from '@/lib/db';
import { groupOwner, projectOwner } from '@/lib/owner';
import { todoMoveSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ todoId: string }>;
}

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request, { params }: Context) => {
  const { todoId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = todoMoveSchema.safeParse(body.body);
  if (!input.success) return jsonError(400, API_ERRORS.invalidMoveTarget);
  const target = 'projectId' in input.data ? projectOwner(input.data.projectId) : groupOwner(input.data.groupId);
  try {
    const todo = await moveTodo(supabase, user.id, todoId, target);
    if (!todo) return jsonError(404, API_ERRORS.todoNotFound);
    return Response.json(todo);
  } catch (error) {
    if (error instanceof TodoMoveError) {
      return jsonError(400, error.reason === 'sameOwner' ? API_ERRORS.moveSameOwner : API_ERRORS.moveInvalidTarget);
    }
    throw error;
  }
});
