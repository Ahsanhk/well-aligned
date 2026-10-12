'use client';

import type { KeyboardEvent } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { ClaudeTodoChip } from '@/components/claude/ClaudeTodoChip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { HiddenFileInput } from '@/components/ui/HiddenFileInput';
import { IconButton } from '@/components/ui/IconButton';
import { IMAGE_ACCEPT, todoAnchorId } from '@/constants/app';
import { DELETE_COPY } from '@/constants/groups';
import { SELECTION_COPY } from '@/constants/status';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useFilePicker } from '@/hooks/useFilePicker';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';
import { useTodoMoveOptions } from '@/hooks/useTodoMoveOptions';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/date';
import { detailsPreview } from '@/lib/todo-preview';
import { usePromptPanelStore } from '@/store/prompt-panel';
import { useRunsStore } from '@/store/runs';
import { selectSelectionMode, useSelectionStore } from '@/store/selection';
import { useTodosStore } from '@/store/todos';
import type { Todo } from '@/types';
import { PriorityIndicator } from './PriorityIndicator';
import { SelectionToggle } from './SelectionToggle';
import { StatusToggle } from './StatusToggle';
import { TodoEditModal } from './TodoEditModal';
import { TodoExpanded } from './TodoExpanded';
import { TodoMenu } from './TodoMenu';
import { TodoMeta } from './TodoMeta';

interface Props {
  todo: Todo;
  meetingTitle: string | null;
}

export function TodoRow({ todo, meetingTitle }: Props) {
  const isSelected = useSelectionStore((state) => state.selectedIds.includes(todo.id));
  const isSelectionMode = useSelectionStore(selectSelectionMode);
  const toggleSelected = useSelectionStore((state) => state.toggle);
  const cycleStatus = useTodosStore((state) => state.cycleStatus);
  const remove = useTodosStore((state) => state.remove);
  const move = useTodosStore((state) => state.move);
  const moves = useTodoMoveOptions(todo);
  const openPrompt = usePromptPanelStore((state) => state.openFor);
  const requestSend = useRunsStore((state) => state.requestSend);
  const expanded = useDisclosure();
  const editor = useDisclosure();
  const confirm = useDisclosure();
  const { upload } = useScreenshotUpload(todo.id);
  const { inputRef, openPicker, onChange } = useFilePicker(upload);
  const isDone = todo.status === 'done';
  const preview = detailsPreview(todo.details);

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      confirm.open();
    }
    if (event.key === 'Enter') expanded.toggle();
  };

  return (
    <li
      id={todoAnchorId(todo.id)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'group/row scroll-mt-24 transition-colors duration-150 outline-none focus-visible:bg-elevated/50 focus-visible:shadow-[inset_2px_0_0_var(--color-accent)]',
        isSelected ? 'bg-accent/[0.06]' : expanded.isOpen ? 'bg-elevated/30' : 'hover:bg-elevated/40',
      )}
    >
      <div className="flex items-start gap-2.5 py-2 pr-2 pl-2.5 sm:pl-3">
        <div className="flex h-6 items-center gap-2">
          <SelectionToggle
            checked={isSelected}
            onChange={() => toggleSelected(todo.id)}
            label={SELECTION_COPY.selectRow}
            isSelectionMode={isSelectionMode}
            revealGroup="row"
          />
          <StatusToggle status={todo.status} onCycle={() => void cycleStatus(todo.id)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
          <button
            type="button"
            onClick={isSelectionMode ? () => toggleSelected(todo.id) : expanded.toggle}
            aria-expanded={expanded.isOpen}
            className="flex min-w-0 cursor-pointer flex-col gap-0.5 text-left"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  'truncate text-sm transition-colors',
                  isDone ? 'text-subtle line-through decoration-subtle/50' : 'text-fg',
                )}
              >
                {todo.title}
              </span>
              <PriorityIndicator priority={todo.priority} />
              <ClaudeTodoChip todoId={todo.id} />
            </span>
            {preview && !expanded.isOpen && (
              <span className={cn('line-clamp-1 text-[13px]', isDone ? 'text-subtle/70' : 'text-muted')}>{preview}</span>
            )}
          </button>
          <TodoMeta todo={todo} meetingTitle={meetingTitle} />
        </div>
        <span className="hidden h-6 shrink-0 items-center text-[11px] text-subtle tabular-nums sm:flex">
          {formatRelativeTime(todo.createdAt)}
        </span>
        <div
          className={cn(
            'flex h-6 shrink-0 items-center transition-opacity duration-150 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100',
            expanded.isOpen ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100',
          )}
        >
          <IconButton label={expanded.isOpen ? 'Collapse' : 'Expand'} size="sm" onClick={expanded.toggle}>
            <ChevronDown size={15} className={cn('transition-transform duration-200', expanded.isOpen && 'rotate-180')} />
          </IconButton>
          <IconButton label={DELETE_COPY.deleteTodo} size="sm" tone="danger" onClick={confirm.open}>
            <Trash2 size={14} />
          </IconButton>
          <TodoMenu
            onEdit={editor.open}
            onAddScreenshots={openPicker}
            onGeneratePrompt={() => openPrompt([todo.id])}
            onSendToClaude={(mode) => requestSend({ todoIds: [todo.id], mode, projectId: null })}
            onDelete={confirm.open}
            moveHeading={moves.heading}
            moveOptions={moves.options}
            onMove={(option) => void move(todo.id, option.target)}
          />
        </div>
      </div>
      {expanded.isOpen && <TodoExpanded todo={todo} />}
      <HiddenFileInput ref={inputRef} accept={IMAGE_ACCEPT} multiple onChange={onChange} />
      {editor.isOpen && <TodoEditModal todo={todo} onClose={editor.close} />}
      <ConfirmModal
        open={confirm.isOpen}
        title="Delete todo?"
        message={`“${todo.title}” and its ${todo.screenshots.length} screenshot(s) will be permanently deleted.`}
        onClose={confirm.close}
        onConfirm={() => {
          confirm.close();
          void remove(todo.id);
        }}
      />
    </li>
  );
}
