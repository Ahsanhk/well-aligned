import { API_ERRORS } from '@/constants/api-errors';
import { MEETING_API_ERRORS } from '@/constants/meeting';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { listGroupProjects } from '@/lib/groups-db';
import { getMeeting, insertSuggestionTodos, type OwnedSuggestionEdit } from '@/lib/meetings-db';
import { groupOwner, projectOwner } from '@/lib/owner';
import { acceptSuggestionsSchema } from '@/lib/schemas';
import type { AcceptSuggestionsResponse, ItemOwner, Meeting, SuggestedTodo } from '@/types';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string }>;
}

function resolveFrameIds(edit: { frameIds?: string[] }, suggestion: SuggestedTodo): string[] | null {
  const available = new Set(suggestion.frames.map((frame) => frame.id));
  const selected = edit.frameIds ?? [...available];
  return selected.every((id) => available.has(id)) ? [...new Set(selected)] : null;
}

function resolveOwner(
  meeting: Meeting,
  requested: string | null | undefined,
  suggestion: SuggestedTodo,
  groupProjectIds: Set<string>,
): { owner: ItemOwner; targetProjectId: string | null } | null {
  if (meeting.projectId) {
    if (requested && requested !== meeting.projectId) return null;
    return { owner: projectOwner(meeting.projectId), targetProjectId: meeting.projectId };
  }
  if (!meeting.groupId) return null;
  const target = requested === undefined ? suggestion.suggestedProjectId : requested;
  if (target === null) return { owner: groupOwner(meeting.groupId), targetProjectId: null };
  return groupProjectIds.has(target) ? { owner: projectOwner(target), targetProjectId: target } : null;
}

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request, { params }: Context) => {
  const { meetingId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = acceptSuggestionsSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const meeting = await getMeeting(supabase, meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  if (meeting.status !== 'ready') return jsonError(409, MEETING_API_ERRORS.notReady);
  const targets = input.data.suggestions.map((edit) => meeting.suggestions.find((suggestion) => suggestion.id === edit.id));
  if (targets.some((suggestion) => !suggestion)) return jsonError(404, MEETING_API_ERRORS.suggestionNotFound);
  if (targets.some((suggestion) => suggestion?.acceptedTodoId)) return jsonError(409, MEETING_API_ERRORS.suggestionAlreadyAccepted);
  const groupProjectIds = new Set(meeting.groupId ? (await listGroupProjects(supabase, meeting.groupId)).map((project) => project.id) : []);
  const edits: OwnedSuggestionEdit[] = [];
  for (const [index, edit] of input.data.suggestions.entries()) {
    const suggestion = targets[index]!;
    const frameIds = resolveFrameIds(edit, suggestion);
    if (!frameIds) return jsonError(400, MEETING_API_ERRORS.unknownFrame);
    const resolved = resolveOwner(meeting, edit.targetProjectId, suggestion, groupProjectIds);
    if (!resolved) return jsonError(400, MEETING_API_ERRORS.invalidTarget);
    edits.push({ ...edit, frameIds, targetProjectId: resolved.targetProjectId, owner: resolved.owner });
  }
  const result = await insertSuggestionTodos(supabase, user.id, meeting, edits);
  return Response.json(result satisfies AcceptSuggestionsResponse);
});
