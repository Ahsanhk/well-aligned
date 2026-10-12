'use client';

import { SendToClaudeHost } from '@/components/claude/SendToClaudeHost';
import { MeetingsPanel } from '@/components/meetings/MeetingsPanel';
import { PromptModalHost } from '@/components/prompts/PromptModalHost';
import { SelectionBar } from '@/components/todos/SelectionBar';
import { SharedSection } from '@/components/todos/SharedSection';
import { TodoComposer } from '@/components/todos/TodoComposer';
import { TodoList } from '@/components/todos/TodoList';
import { TAB_ORIGINS } from '@/constants/backlog';
import { ownerKey } from '@/lib/owner';
import type { ItemOwner, ProjectGroupSummary, ProjectTab } from '@/types';

interface Props {
  owner: ItemOwner;
  tab: ProjectTab;
  sharedGroup: ProjectGroupSummary | null;
  promptProjectId: string | null;
  promptProjectOptions?: { id: string; name: string }[];
}

export function WorkspaceBody({ owner, tab, sharedGroup, promptProjectId, promptProjectOptions }: Props) {
  const key = ownerKey(owner);
  return (
    <>
      {(tab === 'todos' || tab === 'backlog') && (
        <div key={tab} className="animate-fade-in flex flex-col gap-8">
          <TodoComposer key={`${key}-${tab}`} owner={owner} origin={TAB_ORIGINS[tab]} />
          {sharedGroup && <SharedSection group={sharedGroup} origin={TAB_ORIGINS[tab]} />}
          <TodoList key={`list-${key}-${tab}`} owner={owner} origin={TAB_ORIGINS[tab]} />
          <SelectionBar />
        </div>
      )}
      <div hidden={tab !== 'meetings'}>
        <MeetingsPanel key={key} owner={owner} />
      </div>
      <PromptModalHost projectId={promptProjectId} projectOptions={promptProjectOptions} />
      <SendToClaudeHost projectId={promptProjectId} projectOptions={promptProjectOptions} />
    </>
  );
}
