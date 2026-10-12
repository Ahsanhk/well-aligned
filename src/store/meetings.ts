import { create } from 'zustand';
import { MEETING_COPY } from '@/constants/meetings';
import { api, errorMessage } from '@/lib/api-client';
import { isMeetingActive, sortMeetings, toMeetingListItem } from '@/lib/meeting-stats';
import { useProjectsStore } from '@/store/projects';
import { useTodosStore } from '@/store/todos';
import { toastError, toastSuccess } from '@/store/toast';
import { meetingOwner, ownerKey, todoOwner } from '@/lib/owner';
import type { ItemOwner, LoadStatus, Meeting, MeetingListItem, SuggestionEdit } from '@/types';

type DetailStatus = LoadStatus | 'missing';

interface MeetingsState {
  ownerKey: string | null;
  todoOwners: Record<string, ItemOwner>;
  meetings: MeetingListItem[];
  status: LoadStatus;
  error: string | null;
  details: Record<string, Meeting>;
  detailStatus: Record<string, DetailStatus>;
  load: (owner: ItemOwner) => Promise<void>;
  fetchMeeting: (meetingId: string) => Promise<void>;
  refreshActive: () => Promise<void>;
  addUploaded: (meeting: Meeting) => void;
  rename: (meetingId: string, title: string) => Promise<boolean>;
  remove: (meetingId: string) => Promise<boolean>;
  retry: (meetingId: string) => Promise<void>;
  accept: (meetingId: string, edits: SuggestionEdit[]) => Promise<boolean>;
  dismiss: (meetingId: string, suggestionIds: string[]) => Promise<boolean>;
  reset: () => void;
}

function announceTransition(previous: Pick<Meeting, 'status'> | undefined, next: Meeting) {
  if (!previous || !isMeetingActive(previous) || isMeetingActive(next)) return;
  if (next.status === 'ready') toastSuccess(MEETING_COPY.meetingReady);
  if (next.status === 'failed') toastError(next.error ?? MEETING_COPY.meetingFailed);
}

async function refreshScopedTodos() {
  const todos = useTodosStore.getState();
  await todos.reload();
  const { scope, status, todos: items } = useTodosStore.getState();
  if (scope?.owner.kind === 'project' && status === 'ready') useProjectsStore.getState().syncCounts(scope.owner.id, items);
}

export const useMeetingsStore = create<MeetingsState>((set, get) => {
  const findMeeting = (meetingId: string) =>
    get().details[meetingId] ?? get().meetings.find((meeting) => meeting.id === meetingId);

  const applyMeeting = (meeting: Meeting) => {
    announceTransition(findMeeting(meeting.id), meeting);
    set((state) => {
      const item = toMeetingListItem(meeting);
      const inList = state.meetings.some((existing) => existing.id === meeting.id);
      const meetings =
        state.ownerKey === ownerKey(meetingOwner(meeting))
          ? sortMeetings(inList ? state.meetings.map((existing) => (existing.id === meeting.id ? item : existing)) : [item, ...state.meetings])
          : state.meetings;
      return {
        meetings,
        details: { ...state.details, [meeting.id]: meeting },
        detailStatus: { ...state.detailStatus, [meeting.id]: 'ready' },
      };
    });
  };

  const patchMeeting = (meetingId: string, patch: Partial<Meeting>) =>
    set((state) => ({
      meetings: state.meetings.map((meeting) => (meeting.id === meetingId ? { ...meeting, ...patch } : meeting)),
      details: state.details[meetingId]
        ? { ...state.details, [meetingId]: { ...state.details[meetingId], ...patch } }
        : state.details,
    }));

  const snapshot = () => ({ meetings: get().meetings, details: get().details });

  return {
    ownerKey: null,
    todoOwners: {},
    meetings: [],
    status: 'idle',
    error: null,
    details: {},
    detailStatus: {},
    reset: () =>
      set({ ownerKey: null, todoOwners: {}, meetings: [], status: 'idle', error: null, details: {}, detailStatus: {} }),
    load: async (owner) => {
      const key = ownerKey(owner);
      if (get().ownerKey !== key) set({ meetings: [], ownerKey: key });
      set({ status: 'loading', error: null });
      try {
        const meetings = await api.listMeetings(owner);
        if (get().ownerKey === key) set({ meetings: sortMeetings(meetings), status: 'ready' });
      } catch (error) {
        if (get().ownerKey === key) set({ status: 'error', error: errorMessage(error) });
      }
    },
    fetchMeeting: async (meetingId) => {
      if (!get().details[meetingId]) set((state) => ({ detailStatus: { ...state.detailStatus, [meetingId]: 'loading' } }));
      try {
        applyMeeting(await api.getMeeting(meetingId));
      } catch (error) {
        if (get().details[meetingId]) return;
        const message = errorMessage(error);
        set((state) => ({
          detailStatus: { ...state.detailStatus, [meetingId]: /not found|404/i.test(message) ? 'missing' : 'error' },
        }));
      }
    },
    refreshActive: async () => {
      const active = get().meetings.filter(isMeetingActive);
      const results = await Promise.allSettled(active.map((meeting) => api.getMeeting(meeting.id)));
      results.forEach((result) => {
        if (result.status === 'fulfilled') applyMeeting(result.value);
      });
    },
    addUploaded: (meeting) => applyMeeting(meeting),
    rename: async (meetingId, title) => {
      const previous = snapshot();
      patchMeeting(meetingId, { title });
      try {
        applyMeeting(await api.updateMeeting(meetingId, { title }));
        toastSuccess(MEETING_COPY.meetingRenamed);
        return true;
      } catch (error) {
        set(previous);
        toastError(errorMessage(error));
        return false;
      }
    },
    remove: async (meetingId) => {
      const previous = snapshot();
      set((state) => ({ meetings: state.meetings.filter((meeting) => meeting.id !== meetingId) }));
      try {
        await api.deleteMeeting(meetingId);
        set((state) => {
          const details = { ...state.details };
          delete details[meetingId];
          return { details, detailStatus: { ...state.detailStatus, [meetingId]: 'missing' } };
        });
        toastSuccess(MEETING_COPY.meetingDeleted);
        return true;
      } catch (error) {
        set(previous);
        toastError(errorMessage(error));
        return false;
      }
    },
    retry: async (meetingId) => {
      const previous = snapshot();
      patchMeeting(meetingId, { status: 'processing', error: null });
      try {
        applyMeeting(await api.retryMeeting(meetingId));
      } catch (error) {
        set(previous);
        toastError(errorMessage(error));
      }
    },
    accept: async (meetingId, edits) => {
      if (edits.length === 0) return false;
      try {
        const { meeting, todos } = await api.acceptSuggestions(meetingId, { suggestions: edits });
        set((state) => ({
          todoOwners: { ...state.todoOwners, ...Object.fromEntries(todos.map((todo) => [todo.id, todoOwner(todo)])) },
        }));
        applyMeeting(meeting);
        toastSuccess(MEETING_COPY.accepted(edits.length));
        await refreshScopedTodos();
        return true;
      } catch (error) {
        toastError(errorMessage(error));
        return false;
      }
    },
    dismiss: async (meetingId, suggestionIds) => {
      const current = findMeeting(meetingId);
      if (!current || suggestionIds.length === 0) return false;
      const previous = snapshot();
      patchMeeting(meetingId, {
        suggestions: current.suggestions.map((suggestion) =>
          suggestionIds.includes(suggestion.id) ? { ...suggestion, dismissed: true } : suggestion,
        ),
      });
      try {
        applyMeeting(await api.dismissSuggestions(meetingId, { suggestionIds }));
        return true;
      } catch (error) {
        set(previous);
        toastError(errorMessage(error));
        return false;
      }
    },
  };
});
