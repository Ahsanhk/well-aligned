import { API_ROUTES } from '@/constants/api-routes';
import { ROUTES } from '@/constants/app';
import type { ItemOwner, Meeting, Todo } from '@/types';

export function projectOwner(projectId: string): ItemOwner {
  return { kind: 'project', id: projectId };
}

export function groupOwner(groupId: string): ItemOwner {
  return { kind: 'group', id: groupId };
}

export function ownerKey(owner: ItemOwner) {
  return `${owner.kind}:${owner.id}`;
}

function ownerFrom(item: { projectId: string | null; groupId?: string | null }): ItemOwner {
  if (item.projectId) return projectOwner(item.projectId);
  return groupOwner(item.groupId ?? '');
}

export function todoOwner(todo: Pick<Todo, 'projectId' | 'groupId'>) {
  return ownerFrom(todo);
}

export function meetingOwner(meeting: Pick<Meeting, 'projectId' | 'groupId'>) {
  return ownerFrom(meeting);
}

export function isOwnedBy(item: { projectId: string | null; groupId?: string | null }, owner: ItemOwner) {
  return owner.kind === 'project' ? item.projectId === owner.id : !item.projectId && item.groupId === owner.id;
}

export function ownerTodosApi(owner: ItemOwner) {
  return owner.kind === 'project' ? API_ROUTES.projectTodos(owner.id) : API_ROUTES.groupTodos(owner.id);
}

export function ownerMeetingsApi(owner: ItemOwner) {
  return owner.kind === 'project' ? API_ROUTES.projectMeetings(owner.id) : API_ROUTES.groupMeetings(owner.id);
}

export function ownerPageRoute(owner: ItemOwner) {
  return owner.kind === 'project' ? ROUTES.project(owner.id) : ROUTES.group(owner.id);
}

export function ownerTabRoute(owner: ItemOwner, tab: string) {
  return owner.kind === 'project' ? ROUTES.projectTab(owner.id, tab) : ROUTES.groupTab(owner.id, tab);
}

export function ownerTodoRoute(owner: ItemOwner, todoId: string) {
  return owner.kind === 'project' ? ROUTES.projectTodo(owner.id, todoId) : ROUTES.groupTodo(owner.id, todoId);
}

export function ownerMeetingRoute(owner: ItemOwner, meetingId: string) {
  return owner.kind === 'project' ? ROUTES.meeting(owner.id, meetingId) : ROUTES.groupMeeting(owner.id, meetingId);
}
