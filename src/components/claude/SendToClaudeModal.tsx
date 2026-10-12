'use client';

import { ChevronDown } from 'lucide-react';
import { RepoPicker } from '@/components/prompts/RepoPicker';
import { SelectedTodoChips } from '@/components/prompts/SelectedTodoChips';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { CLAUDE_COPY, SEND_MODE_OPTIONS } from '@/constants/claude';
import { useClaudeCli } from '@/hooks/useClaudeCli';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useRepoReadiness } from '@/hooks/useRepoReadiness';
import { useSendToClaude } from '@/hooks/useSendToClaude';
import { cn } from '@/lib/cn';
import type { ClaudeSendRequest } from '@/types';
import { CliInstallNotice } from './CliInstallNotice';
import { SendModeIcon } from './SendModeIcon';

interface Props {
  request: ClaudeSendRequest;
  projectOptions: { id: string; name: string }[];
  onClose: () => void;
}

const MODE_OPTIONS = SEND_MODE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  icon: <SendModeIcon mode={option.value} size={12} />,
}));

export function SendToClaudeModal({ request, projectOptions, onClose }: Props) {
  const send = useSendToClaude(request, projectOptions);
  const preview = useDisclosure(false);
  const readiness = useRepoReadiness(send.projectId);
  const cli = useClaudeCli();
  const terminalBlocked = send.mode === 'terminal' && cli.cliMissing;
  const modeMeta = SEND_MODE_OPTIONS.find((option) => option.value === send.mode);
  const isGenerating = send.generation.status === 'loading' || send.generation.status === 'idle';

  return (
    <Modal
      open
      size="lg"
      title={CLAUDE_COPY.sendTitle}
      description={modeMeta?.description}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void send.send()} disabled={!send.isReady || send.isStarting || !readiness.isReady || terminalBlocked}>
            <SendModeIcon mode={send.mode} />
            {send.isStarting ? CLAUDE_COPY.starting : send.mode === 'terminal' ? CLAUDE_COPY.startRun : CLAUDE_COPY.queueRun}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SegmentedControl label="Send mode" options={MODE_OPTIONS} value={send.mode} onChange={send.setMode} className="self-start" />
        {terminalBlocked && <CliInstallNotice isChecking={cli.isChecking} onCheck={() => void cli.check()} showQueueHint />}
        <SelectedTodoChips todos={send.generation.todos} />
        {request.projectId === null && <RepoPicker options={projectOptions} value={send.projectId} onChange={send.setProjectId} />}
        {readiness.reason && <p className="text-sm text-warning">{readiness.reason}</p>}
        <div className="rounded-lg border border-line">
          <button
            type="button"
            onClick={preview.toggle}
            aria-expanded={preview.isOpen}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-muted hover:text-fg"
          >
            <ChevronDown size={14} className={cn('transition-transform duration-200', !preview.isOpen && '-rotate-90')} />
            {CLAUDE_COPY.promptPreview}
            <span className="text-xs text-subtle">· {CLAUDE_COPY.promptPreviewHint}</span>
            {isGenerating && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-subtle">
                <Spinner size={12} />
                {CLAUDE_COPY.preparingPrompt}
              </span>
            )}
          </button>
          {preview.isOpen && !isGenerating && (
            <div className="border-t border-line p-2">
              <Textarea
                mono
                aria-label={CLAUDE_COPY.promptPreview}
                spellCheck={false}
                value={send.generation.text}
                onChange={(event) => send.generation.setText(event.target.value)}
                className="h-64 bg-sunken"
              />
            </div>
          )}
        </div>
        {send.generation.error && <p className="text-sm text-danger">{send.generation.error}</p>}
      </div>
    </Modal>
  );
}
