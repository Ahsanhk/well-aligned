import { create } from 'zustand';
import type { Project, ProjectGroup } from '@/types';

interface LayoutState {
  isDrawerOpen: boolean;
  projectForm: { isOpen: boolean; project: Project | null };
  groupForm: { isOpen: boolean; group: ProjectGroup | null };
  openGroupForm: (group?: ProjectGroup | null) => void;
  closeGroupForm: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openProjectForm: (project?: Project | null) => void;
  closeProjectForm: () => void;
  reset: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isDrawerOpen: false,
  projectForm: { isOpen: false, project: null },
  groupForm: { isOpen: false, group: null },
  reset: () =>
    set({ isDrawerOpen: false, projectForm: { isOpen: false, project: null }, groupForm: { isOpen: false, group: null } }),
  openGroupForm: (group = null) => set({ groupForm: { isOpen: true, group }, isDrawerOpen: false }),
  closeGroupForm: () => set((state) => ({ groupForm: { ...state.groupForm, isOpen: false } })),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  openProjectForm: (project = null) => set({ projectForm: { isOpen: true, project }, isDrawerOpen: false }),
  closeProjectForm: () => set((state) => ({ projectForm: { ...state.projectForm, isOpen: false } })),
}));
