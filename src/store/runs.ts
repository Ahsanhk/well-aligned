import { create } from 'zustand';
import { CLAUDE_COPY, CLI_MISSING_STATUS } from '@/constants/claude';
import { api, errorMessage, errorStatus } from '@/lib/api-client';
import { isRunActive } from '@/lib/run-progress';
import { useIntegrationStore } from '@/store/integration';
import { useProjectsStore } from '@/store/projects';
import { useTodosStore } from '@/store/todos';
import { toastError, toastSuccess } from '@/store/toast';
import type { ClaudeSendRequest, Run, StartRunRequest } from '@/types';

interface RunsState {
  runs: Record<string, Run>;
  panelRunId: string | null;
  isPanelOpen: boolean;
  sendRequest: ClaudeSendRequest | null;
  loadActive: () => Promise<void>;
  refresh: (runId: string) => Promise<void>;
  start: (body: StartRunRequest) => Promise<Run | null>;
  complete: (runId: string) => Promise<void>;
  cancel: (runId: string) => Promise<void>;
  openPanel: (runId: string) => void;
  minimisePanel: () => void;
  requestSend: (request: ClaudeSendRequest) => void;
  closeSend: () => void;
  reset: () => void;
}

function projectName(projectId: string) {
  return useProjectsStore.getState().projects.find((project) => project.id === projectId)?.name ?? CLAUDE_COPY.panelTitle;
}

async function refreshTodos() {
  await useTodosStore.getState().reload();
  const { scope, status, todos } = useTodosStore.getState();
  if (scope?.owner.kind === 'project' && status === 'ready') useProjectsStore.getState().syncCounts(scope.owner.id, todos);
}

export const useRunsStore = create<RunsState>((set, get) => {
  const applyRun = (run: Run) => {
    const previous = get().runs[run.id];
    set((state) => ({ runs: { ...state.runs, [run.id]: run } }));
    if (!previous) return;
    const progressChanged = JSON.stringify(previous.progress) !== JSON.stringify(run.progress);
    if (isRunActive(previous) && run.status === 'done') {
      toastSuccess(CLAUDE_COPY.runDoneToast(projectName(run.projectId)));
      void refreshTodos();
      return;
    }
    if (progressChanged || previous.status !== run.status) void refreshTodos();
  };

  return {
    runs: {},
    panelRunId: null,
    isPanelOpen: false,
    sendRequest: null,
    reset: () => set({ runs: {}, panelRunId: null, isPanelOpen: false, sendRequest: null }),
    loadActive: async () => {
      try {
        const runs = await api.listActiveRuns();
        set((state) => ({ runs: { ...state.runs, ...Object.fromEntries(runs.map((run) => [run.id, run])) } }));
      } catch {
        return;
      }
    },
    refresh: async (runId) => {
      try {
        applyRun(await api.getRun(runId));
      } catch {
        return;
      }
    },
    start: async (body) => {
      try {
        const run = await api.createRun(body);
        set((state) => ({ runs: { ...state.runs, [run.id]: run }, panelRunId: run.id, isPanelOpen: true, sendRequest: null }));
        void refreshTodos();
        return run;
      } catch (error) {
        if (errorStatus(error) === CLI_MISSING_STATUS) {
          useIntegrationStore.getState().markCliMissing();
          return null;
        }
        toastError(errorMessage(error));
        return null;
      }
    },
    complete: async (runId) => {
      try {
        applyRun(await api.completeRun(runId));
      } catch (error) {
        toastError(errorMessage(error));
      }
    },
    cancel: async (runId) => {
      try {
        applyRun(await api.cancelRun(runId));
        void refreshTodos();
      } catch (error) {
        toastError(errorMessage(error));
      }
    },
    openPanel: (runId) => set({ panelRunId: runId, isPanelOpen: true }),
    minimisePanel: () => set({ isPanelOpen: false }),
    requestSend: (request) => set({ sendRequest: request }),
    closeSend: () => set({ sendRequest: null }),
  };
});

export function selectActiveRuns(state: RunsState) {
  return Object.values(state.runs).filter(isRunActive);
}
