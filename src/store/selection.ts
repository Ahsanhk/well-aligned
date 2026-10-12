import { create } from 'zustand';

interface SelectionState {
  selectedIds: string[];
  isSelecting: boolean;
  setSelecting: (value: boolean) => void;
  toggle: (todoId: string) => void;
  setMany: (todoIds: string[], selected: boolean) => void;
  prune: (validIds: string[]) => void;
  clear: () => void;
  reset: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  isSelecting: false,
  reset: () => set({ selectedIds: [], isSelecting: false }),
  setSelecting: (value) => set(value ? { isSelecting: true } : { isSelecting: false, selectedIds: [] }),
  toggle: (todoId) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(todoId)
        ? state.selectedIds.filter((id) => id !== todoId)
        : [...state.selectedIds, todoId],
    })),
  setMany: (todoIds, selected) =>
    set((state) => ({
      selectedIds: selected
        ? [...new Set([...state.selectedIds, ...todoIds])]
        : state.selectedIds.filter((id) => !todoIds.includes(id)),
    })),
  prune: (validIds) =>
    set((state) => {
      const next = state.selectedIds.filter((id) => validIds.includes(id));
      return next.length === state.selectedIds.length ? state : { selectedIds: next };
    }),
  clear: () =>
    set((state) => (state.selectedIds.length === 0 && !state.isSelecting ? state : { selectedIds: [], isSelecting: false })),
}));

export function selectSelectionMode(state: SelectionState) {
  return state.isSelecting || state.selectedIds.length > 0;
}
