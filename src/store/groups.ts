import { create } from 'zustand';
import { BULK_TOAST_COPY } from '@/constants/toast';
import { api, errorMessage } from '@/lib/api-client';
import { groupOwner, isOwnedBy } from '@/lib/owner';
import { openCount, todosByOrigin } from '@/lib/todo-origin';
import { useProjectsStore } from '@/store/projects';
import { toastError, toastSuccess } from '@/store/toast';
import type { LoadStatus, ProjectGroup, ProjectGroupInput, ProjectGroupSummary, Todo } from '@/types';

interface GroupsState {
  groups: ProjectGroupSummary[];
  status: LoadStatus;
  error: string | null;
  load: () => Promise<void>;
  ensureLoaded: () => void;
  create: (input: ProjectGroupInput) => Promise<ProjectGroup | null>;
  update: (groupId: string, patch: Partial<ProjectGroupInput>) => Promise<boolean>;
  remove: (groupId: string) => Promise<boolean>;
  syncShared: (groupId: string, todos: Todo[]) => void;
  reset: () => void;
}

function toSummary(group: ProjectGroup): ProjectGroupSummary {
  return { ...group, projectIds: [], sharedOpenCount: 0, sharedBacklogOpenCount: 0 };
}

function sortByName(groups: ProjectGroupSummary[]) {
  return [...groups].sort((a, b) => a.name.localeCompare(b.name));
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  status: 'idle',
  error: null,
  reset: () => set({ groups: [], status: 'idle', error: null }),
  load: async () => {
    set({ status: 'loading', error: null });
    try {
      set({ groups: sortByName(await api.listGroups()), status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: errorMessage(error) });
    }
  },
  ensureLoaded: () => {
    if (get().status === 'idle') void get().load();
  },
  create: async (input) => {
    try {
      const group = await api.createGroup(input);
      set((state) => ({ groups: sortByName([...state.groups, toSummary(group)]) }));
      toastSuccess(BULK_TOAST_COPY.groupCreated);
      return group;
    } catch (error) {
      toastError(errorMessage(error));
      return null;
    }
  },
  update: async (groupId, patch) => {
    const previous = get().groups;
    set({ groups: sortByName(previous.map((group) => (group.id === groupId ? { ...group, ...patch } : group))) });
    try {
      const group = await api.updateGroup(groupId, patch);
      set((state) => ({ groups: sortByName(state.groups.map((item) => (item.id === groupId ? { ...item, ...group } : item))) }));
      toastSuccess(BULK_TOAST_COPY.groupUpdated);
      return true;
    } catch (error) {
      set({ groups: previous });
      toastError(errorMessage(error));
      return false;
    }
  },
  remove: async (groupId) => {
    const previous = get().groups;
    set({ groups: previous.filter((group) => group.id !== groupId) });
    try {
      await api.deleteGroup(groupId);
      useProjectsStore.getState().ungroupLocally(groupId);
      toastSuccess(BULK_TOAST_COPY.groupDeleted);
      return true;
    } catch (error) {
      set({ groups: previous });
      toastError(errorMessage(error));
      return false;
    }
  },
  syncShared: (groupId, todos) => {
    const shared = todos.filter((todo) => isOwnedBy(todo, groupOwner(groupId)));
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              sharedOpenCount: openCount(todosByOrigin(shared, 'client')),
              sharedBacklogOpenCount: openCount(todosByOrigin(shared, 'self')),
            }
          : group,
      ),
    }));
  },
}));
