'use client';

import { Sparkles, Trash2, X } from 'lucide-react';
import { SendToClaudeButton } from '@/components/claude/SendToClaudeButton';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { DELETE_COPY } from '@/constants/groups';
import { SHORTCUTS } from '@/constants/shortcuts';
import { useClaudeCli } from '@/hooks/useClaudeCli';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { usePromptPanelStore } from '@/store/prompt-panel';
import { useRunsStore } from '@/store/runs';
import { useSelectionStore } from '@/store/selection';
import { useTodosStore } from '@/store/todos';

export function SelectionBar() {
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const clear = useSelectionStore((state) => state.clear);
  const openFor = usePromptPanelStore((state) => state.openFor);
  const removeMany = useTodosStore((state) => state.removeMany);
  const requestSend = useRunsStore((state) => state.requestSend);
  const cli = useClaudeCli();
  const confirm = useDisclosure();
  const count = selectedIds.length;
  const generate = () => openFor(selectedIds);

  useKeyboardShortcut(SHORTCUTS.generatePrompt, generate, { enabled: count > 0 });
  useKeyboardShortcut(SHORTCUTS.clearSelection, clear, { enabled: count > 0 });

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:pl-64">
      <div className="animate-slide-up pointer-events-auto flex w-full max-w-2xl items-center gap-2 rounded-xl border border-line-strong bg-elevated/95 py-2 pr-2 pl-3 shadow-2xl shadow-black/60 backdrop-blur-md">
        <IconButton label="Clear selection" size="sm" onClick={clear}>
          <X size={14} />
        </IconButton>
        <p className="flex-1 text-sm text-fg">
          <span className="font-semibold text-accent tabular-nums">{count}</span> selected
        </p>
        <Button variant="danger" size="sm" onClick={confirm.open} aria-label={DELETE_COPY.delete}>
          <Trash2 size={14} />
          <span className="hidden sm:inline">{DELETE_COPY.delete}</span>
        </Button>
        <SendToClaudeButton
          terminalUnavailable={cli.cliMissing}
          onSend={(mode) => requestSend({ todoIds: [...selectedIds], mode, projectId: null })}
        />
        <Button size="sm" onClick={generate}>
          <Sparkles size={14} />
          <span className="hidden sm:inline">Generate prompt</span>
          <Kbd keys={SHORTCUTS.generatePrompt.label} className="ml-1 hidden sm:inline-flex" />
        </Button>
      </div>
      <ConfirmModal
        open={confirm.isOpen}
        title={DELETE_COPY.bulkTitle(count)}
        message={DELETE_COPY.bulkMessage}
        confirmLabel={DELETE_COPY.bulkConfirm(count)}
        onClose={confirm.close}
        onConfirm={() => {
          const ids = [...selectedIds];
          confirm.close();
          clear();
          void removeMany(ids);
        }}
      />
    </div>
  );
}
