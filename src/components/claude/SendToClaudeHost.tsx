'use client';

import { useRunsStore } from '@/store/runs';
import { SendToClaudeModal } from './SendToClaudeModal';

interface Props {
  projectId: string | null;
  projectOptions?: { id: string; name: string }[];
}

export function SendToClaudeHost({ projectId, projectOptions = [] }: Props) {
  const request = useRunsStore((state) => state.sendRequest);
  const closeSend = useRunsStore((state) => state.closeSend);
  if (!request) return null;
  const resolved = { ...request, projectId: request.projectId ?? projectId };
  return (
    <SendToClaudeModal
      key={`${request.todoIds.join(',')}-${request.mode}`}
      request={resolved}
      projectOptions={projectOptions}
      onClose={closeSend}
    />
  );
}
