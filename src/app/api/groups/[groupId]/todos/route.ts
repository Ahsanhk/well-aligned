import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { createOwnerTodo, listOwnerTodos } from '@/lib/db';
import { groupOwner } from '@/lib/owner';
import { todoInputSchema, todoOriginSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ groupId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const originParam = new URL(request.url).searchParams.get('origin');
  const origin = originParam === null ? undefined : todoOriginSchema.safeParse(originParam);
  if (origin && !origin.success) return jsonError(400, API_ERRORS.invalidOrigin);
  const todos = await listOwnerTodos(supabase, groupOwner((await params).groupId), origin?.data);
  if (!todos) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json(todos);
});

export const POST = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { groupId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = todoInputSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const todo = await createOwnerTodo(supabase, groupOwner(groupId), input.data);
  if (!todo) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json(todo, { status: 201 });
});
