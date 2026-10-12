'use client';

import { usePromptPanelStore } from '@/store/prompt-panel';
import { PromptModal } from './PromptModal';

interface Props {
  projectId: string | null;
  projectOptions?: { id: string; name: string }[];
}

export function PromptModalHost({ projectId, projectOptions = [] }: Props) {
  const isOpen = usePromptPanelStore((state) => state.isOpen);
  const todoIds = usePromptPanelStore((state) => state.todoIds);
  const close = usePromptPanelStore((state) => state.close);

  if (!isOpen) return null;

  return (
    <PromptModal
      key={todoIds.join(',')}
      projectId={projectId}
      projectOptions={projectOptions}
      todoIds={todoIds}
      onClose={close}
    />
  );
}
