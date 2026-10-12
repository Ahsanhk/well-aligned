'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DEFAULT_PROMPT_VIEW, PROMPT_VIEW_OPTIONS } from '@/constants/prompt-views';
import { usePromptGeneration } from '@/hooks/usePromptGeneration';
import type { PromptView } from '@/types';
import { PromptComposer } from './PromptComposer';
import { RepoPicker } from './RepoPicker';
import { PromptResult } from './PromptResult';
import { PromptSkeleton } from './PromptSkeleton';
import { SelectedTodoChips } from './SelectedTodoChips';
import { TodosJsonView } from './TodosJsonView';

interface Props {
  projectId: string | null;
  projectOptions: { id: string; name: string }[];
  todoIds: string[];
  onClose: () => void;
}

const VIEW_OPTIONS = PROMPT_VIEW_OPTIONS.map(({ icon: Icon, ...option }) => ({ ...option, icon: <Icon size={12} /> }));

export function PromptModal({ projectId, projectOptions, todoIds, onClose }: Props) {
  const [view, setView] = useState<PromptView>(DEFAULT_PROMPT_VIEW);
  const [repoId, setRepoId] = useState(projectId ?? projectOptions[0]?.id ?? '');
  const generation = usePromptGeneration(repoId, todoIds);
  const needsPicker = projectId === null;
  const count = generation.todos.length;
  const isLoading = generation.status === 'loading';

  return (
    <Modal
      open
      size="xl"
      title="Generate prompt"
      description={`${count} todo${count === 1 ? '' : 's'} → paste into a Claude Code terminal`}
      onClose={onClose}
      headerAside={<SegmentedControl label="View" options={VIEW_OPTIONS} value={view} onChange={setView} />}
    >
      {view === 'json' ? (
        <TodosJsonView todos={generation.todos} />
      ) : (
        <div className="flex flex-col gap-5">
          <SelectedTodoChips todos={generation.todos} />
          {needsPicker && (
            <RepoPicker options={projectOptions} value={repoId} onChange={setRepoId} />
          )}
          <PromptComposer
            value={generation.extraInstructions}
            onChange={generation.setExtraInstructions}
            onGenerate={() => void generation.generate()}
            isLoading={isLoading}
            isDisabled={!repoId}
            hasResult={generation.prompt !== null}
          />
          {isLoading && <PromptSkeleton />}
          {!isLoading && generation.error && <p className="text-sm text-danger">{generation.error}</p>}
          {!isLoading && generation.prompt && (
            <PromptResult
              prompt={generation.prompt}
              text={generation.text}
              onTextChange={generation.setText}
              warning={generation.warning}
              isEdited={generation.isEdited}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
