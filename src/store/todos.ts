import { create } from 'zustand';
import { NEXT_STATUS } from '@/constants/status';
import { BULK_TOAST_COPY, TOAST_COPY } from '@/constants/toast';
import { api, errorMessage } from '@/lib/api-client';
import { ownerKey } from '@/lib/owner';
import { sortTodos, upsertTodo } from '@/lib/todo-filter';
import { toastError, toastSuccess } from '@/store/toast';
import type { GeneratedPrompt, ItemOwner, LoadStatus, Todo, TodoInput, TodoMoveTarget, TodoPatch } from '@/types';

interface TodoScope {
  owner: ItemOwner;
  sharedGroupId: string | null;
}

interface TodosState {
  scope: TodoScope | null;
  scopeKey: string | null;
  todos: Todo[];
  status: LoadStatus;
  error: string | null;
  load: (owner: ItemOwner, sharedGroupId?: string | null) => Promise<void>;
  reload: () => Promise<void>;
  create: (owner: ItemOwner, input: TodoInput, files: File[]) => Promise<Todo | null>;
  update: (todoId: string, patch: TodoPatch) => Promise<boolean>;
  cycleStatus: (todoId: string) => Promise<void>;
  remove: (todoId: string) => Promise<boolean>;
  removeMany: (todoIds: string[]) => Promise<boolean>;
  move: (todoId: string, target: TodoMoveTarget) => Promise<boolean>;
  addScreenshots: (todoId: string, files: File[]) => Promise<boolean>;
  removeScreenshot: (todoId: string, screenshotId: string) => Promise<void>;
  setPrompt: (todoId: string, prompt: GeneratedPrompt) => void;
  reset: () => void;
}

function scopeKeyOf(scope: TodoScope) {
  return `${ownerKey(scope.owner)}|${scope.sharedGroupId ?? ''}`;
}

async function fetchScope(scope: TodoScope) {
  const [own, shared] = await Promise.all([
    api.listTodos(scope.owner),
    scope.sharedGroupId ? api.listTodos({ kind: 'group', id: scope.sharedGroupId }) : Promise.resolve([]),
  ]);
  return sortTodos([...own, ...shared]);
}

function moveLocally(todo: Todo, target: TodoMoveTarget): Todo {
  return 'projectId' in target && target.projectId
    ? { ...todo, projectId: target.projectId, groupId: null }
    : { ...todo, projectId: null, groupId: target.groupId ?? null };
}

export const useTodosStore = create<TodosState>((set, get) => {
  const findTodo = (todoId: string) => get().todos.find((todo) => todo.id === todoId);

  const replaceTodo = (todo: Todo) => set((state) => ({ todos: sortTodos(upsertTodo(state.todos, todo)) }));

  const patchLocal = (todoId: string, patch: Partial<Todo>) =>
    set((state) => ({
      todos: sortTodos(state.todos.map((todo) => (todo.id === todoId ? { ...todo, ...patch } : todo))),
    }));

  const fetchInto = async (scope: TodoScope) => {
    const key = scopeKeyOf(scope);
    set({ status: 'loading', error: null });
    try {
      const todos = await fetchScope(scope);
      if (get().scopeKey === key) set({ todos, status: 'ready' });
    } catch (error) {
      if (get().scopeKey === key) set({ status: 'error', error: errorMessage(error) });
    }
  };

  return {
    scope: null,
    scopeKey: null,
    todos: [],
    status: 'idle',
    error: null,
    reset: () => set({ scope: null, scopeKey: null, todos: [], status: 'idle', error: null }),
    load: async (owner, sharedGroupId = null) => {
      const scope = { owner, sharedGroupId };
      const key = scopeKeyOf(scope);
      if (get().scopeKey !== key) set({ todos: [], scope, scopeKey: key });
      await fetchInto(scope);
    },
    reload: async () => {
      const scope = get().scope;
      if (scope) await fetchInto(scope);
    },
    create: async (owner, input, files) => {
      let todo: Todo;
      try {
        todo = await api.createTodo(owner, input);
      } catch (error) {
        toastError(errorMessage(error));
        return null;
      }
      replaceTodo(todo);
      if (files.length === 0) {
        toastSuccess(TOAST_COPY.todoCreated);
        return todo;
      }
      try {
        const withScreenshots = await api.uploadScreenshots(todo.id, files);
        replaceTodo(withScreenshots);
        toastSuccess(TOAST_COPY.todoCreated);
        return withScreenshots;
      } catch (error) {
        toastError(`${TOAST_COPY.uploadFailed}: ${errorMessage(error)}`);
        return todo;
      }
    },
    update: async (todoId, patch) => {
      const previous = findTodo(todoId);
      if (!previous) return false;
      patchLocal(todoId, patch);
      try {
        replaceTodo(await api.updateTodo(todoId, patch));
        return true;
      } catch (error) {
        replaceTodo(previous);
        toastError(errorMessage(error));
        return false;
      }
    },
    cycleStatus: async (todoId) => {
      const todo = findTodo(todoId);
      if (todo) await get().update(todoId, { status: NEXT_STATUS[todo.status] });
    },
    remove: async (todoId) => {
      const previous = get().todos;
      set({ todos: previous.filter((todo) => todo.id !== todoId) });
      try {
        await api.deleteTodo(todoId);
        toastSuccess(TOAST_COPY.todoDeleted);
        return true;
      } catch (error) {
        set({ todos: previous });
        toastError(errorMessage(error));
        return false;
      }
    },
    removeMany: async (todoIds) => {
      if (todoIds.length === 0) return false;
      const previous = get().todos;
      set({ todos: previous.filter((todo) => !todoIds.includes(todo.id)) });
      const results = await Promise.allSettled(todoIds.map((id) => api.deleteTodo(id)));
      const failedIds = todoIds.filter((_, index) => results[index].status === 'rejected');
      if (failedIds.length > 0) {
        const restored = previous.filter((todo) => failedIds.includes(todo.id));
        set((state) => ({ todos: sortTodos([...state.todos, ...restored]) }));
        const firstError = results.find((result) => result.status === 'rejected');
        toastError(firstError && firstError.status === 'rejected' ? errorMessage(firstError.reason) : TOAST_COPY.genericError);
      }
      const deleted = todoIds.length - failedIds.length;
      if (deleted > 0) toastSuccess(BULK_TOAST_COPY.todosDeleted(deleted));
      return failedIds.length === 0;
    },
    move: async (todoId, target) => {
      const previous = findTodo(todoId);
      if (!previous) return false;
      replaceTodo(moveLocally(previous, target));
      try {
        replaceTodo(await api.moveTodo(todoId, target));
        toastSuccess(BULK_TOAST_COPY.todoMoved);
        return true;
      } catch (error) {
        replaceTodo(previous);
        toastError(errorMessage(error));
        return false;
      }
    },
    addScreenshots: async (todoId, files) => {
      if (files.length === 0) return false;
      try {
        replaceTodo(await api.uploadScreenshots(todoId, files));
        toastSuccess(TOAST_COPY.screenshotsAdded);
        return true;
      } catch (error) {
        toastError(errorMessage(error));
        return false;
      }
    },
    removeScreenshot: async (todoId, screenshotId) => {
      const previous = findTodo(todoId);
      if (!previous) return;
      patchLocal(todoId, { screenshots: previous.screenshots.filter((shot) => shot.id !== screenshotId) });
      try {
        replaceTodo(await api.deleteScreenshot(screenshotId));
      } catch (error) {
        replaceTodo(previous);
        toastError(errorMessage(error));
      }
    },
    setPrompt: (todoId, prompt) => patchLocal(todoId, { prompt }),
  };
});
