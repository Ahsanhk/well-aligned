import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { IntegrationStatus } from '@/types';

interface IntegrationState {
  status: IntegrationStatus | null;
  isChecking: boolean;
  check: () => Promise<void>;
  markCliMissing: () => void;
  reset: () => void;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  status: null,
  isChecking: false,
  reset: () => set({ status: null, isChecking: false }),
  check: async () => {
    if (get().isChecking) return;
    set({ isChecking: true });
    try {
      set({ status: await api.integrationStatus() });
    } catch {
      return;
    } finally {
      set({ isChecking: false });
    }
  },
  markCliMissing: () =>
    set((state) => ({
      status: state.status
        ? { ...state.status, claudeCliFound: false }
        : { mcpAddCommand: '', claudeCliFound: false, terminalServerOnline: false },
    })),
}));
