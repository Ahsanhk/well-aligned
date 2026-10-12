import { create } from 'zustand';
import { api, errorMessage } from '@/lib/api-client';
import { isOwnedBy, projectOwner } from '@/lib/owner';
import { summarizeTodos } from '@/lib/project-stats';
import { toastError } from '@/store/toast';
import type { LoadStatus, Project, ProjectExport, ProjectInput, ProjectSummary, Todo } from '@/types';

interface ProjectsState {
  projects: ProjectSummary[];
  status: LoadStatus;
  error: string | null;
  load: () => Promise<void>;
  ensureLoaded: () => void;
  create: (input: ProjectInput) => Promise<Project | null>;
  update: (projectId: string, patch: Partial<ProjectInput>) => Promise<boolean>;
  remove: (projectId: string) => Promise<boolean>;
  importProject: (data: ProjectExport) => Promise<Project | null>;
  syncCounts: (projectId: string, todos: Todo[]) => void;
  ungroupLocally: (groupId: string) => void;
  reset: () => void;
}

function toSummary(project: Project, todos: Todo[] = []): ProjectSummary {
  return { ...project, ...summarizeTodos(todos) };
}

function replaceProject(projects: ProjectSummary[], project: Project) {
  return projects.map((item) => (item.id === project.id ? { ...item, ...project } : item));
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  status: 'idle',
  error: null,
  reset: () => set({ projects: [], status: 'idle', error: null }),
  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const projects = await api.listProjects();
      set({ projects, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: errorMessage(error) });
    }
  },
  ensureLoaded: () => {
    if (get().status === 'idle') void get().load();
  },
  create: async (input) => {
    try {
      const project = await api.createProject(input);
      set((state) => ({ projects: [toSummary(project), ...state.projects] }));
      return project;
    } catch (error) {
      toastError(errorMessage(error));
      return null;
    }
  },
  update: async (projectId, patch) => {
    const previous = get().projects;
    set({ projects: previous.map((item) => (item.id === projectId ? { ...item, ...patch } : item)) });
    try {
      const project = await api.updateProject(projectId, patch);
      set((state) => ({ projects: replaceProject(state.projects, project) }));
      return true;
    } catch (error) {
      set({ projects: previous });
      toastError(errorMessage(error));
      return false;
    }
  },
  remove: async (projectId) => {
    const previous = get().projects;
    set({ projects: previous.filter((item) => item.id !== projectId) });
    try {
      await api.deleteProject(projectId);
      return true;
    } catch (error) {
      set({ projects: previous });
      toastError(errorMessage(error));
      return false;
    }
  },
  importProject: async (data) => {
    try {
      const project = await api.importProject(data);
      set((state) => ({ projects: [toSummary(project, data.todos), ...state.projects] }));
      return project;
    } catch (error) {
      toastError(errorMessage(error));
      return null;
    }
  },
  syncCounts: (projectId, todos) => {
    const own = todos.filter((todo) => isOwnedBy(todo, projectOwner(projectId)));
    set((state) => ({
      projects: state.projects.map((item) => (item.id === projectId ? { ...item, ...summarizeTodos(own) } : item)),
    }));
  },
  ungroupLocally: (groupId) =>
    set((state) => ({
      projects: state.projects.map((item) => (item.groupId === groupId ? { ...item, groupId: null } : item)),
    })),
}));
