import { create } from 'zustand';

interface PromptPanelState {
  isOpen: boolean;
  todoIds: string[];
  openFor: (todoIds: string[]) => void;
  close: () => void;
  reset: () => void;
}

export const usePromptPanelStore = create<PromptPanelState>((set) => ({
  isOpen: false,
  todoIds: [],
  reset: () => set({ isOpen: false, todoIds: [] }),
  openFor: (todoIds) => set({ isOpen: true, todoIds }),
  close: () => set({ isOpen: false }),
}));
