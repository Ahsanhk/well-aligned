import { create } from 'zustand';
import { TOAST_DURATION_MS, TOAST_LIMIT } from '@/constants/toast';
import type { Toast, ToastAction, ToastTone } from '@/types';

interface ToastState {
  toasts: Toast[];
  show: (message: string, options?: { tone?: ToastTone; action?: ToastAction }) => void;
  dismiss: (id: number) => void;
  reset: () => void;
}

let toastSequence = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  reset: () => set({ toasts: [] }),
  show: (message, { tone = 'default', action } = {}) => {
    toastSequence += 1;
    const id = toastSequence;
    set((state) => ({ toasts: [...state.toasts.slice(-(TOAST_LIMIT - 1)), { id, message, tone, action }] }));
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export function toastSuccess(message: string) {
  useToastStore.getState().show(message, { tone: 'success' });
}

export function toastError(message: string) {
  useToastStore.getState().show(message, { tone: 'danger' });
}
