'use client';

import { useRef, type KeyboardEvent } from 'react';
import { CalendarDays, Paperclip, Plus } from 'lucide-react';
import { DropOverlay } from '@/components/screenshots/DropOverlay';
import { PendingImageStrip } from '@/components/screenshots/PendingImageStrip';
import { Button } from '@/components/ui/Button';
import { HiddenFileInput } from '@/components/ui/HiddenFileInput';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Kbd } from '@/components/ui/Kbd';
import { Textarea } from '@/components/ui/Textarea';
import { COPY, IMAGE_ACCEPT } from '@/constants/app';
import { COMPOSER_COPY } from '@/constants/backlog';
import { SHORTCUTS } from '@/constants/shortcuts';
import { useDropzone } from '@/hooks/useDropzone';
import { useFilePicker } from '@/hooks/useFilePicker';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { usePasteImages } from '@/hooks/usePasteImages';
import { useTodoComposer } from '@/hooks/useTodoComposer';
import { cn } from '@/lib/cn';
import { hasModifier } from '@/lib/keyboard';
import type { ItemOwner, TodoOrigin } from '@/types';
import { CategorySelect } from './CategorySelect';
import { PrioritySelect } from './PrioritySelect';

interface Props {
  owner: ItemOwner;
  origin: TodoOrigin;
}

export function TodoComposer({ owner, origin }: Props) {
  const composer = useTodoComposer(owner, origin);
  const copy = COMPOSER_COPY[origin];
  const isSelf = origin === 'self';
  const containerRef = useRef<HTMLFormElement>(null);
  const { isDragging, dropProps } = useDropzone(composer.images.add);
  const { inputRef, openPicker, onChange } = useFilePicker(composer.images.add);
  usePasteImages(containerRef, composer.images.add);
  useKeyboardShortcut(SHORTCUTS.focusComposer, composer.focus);

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === SHORTCUTS.submit.key && hasModifier(event)) {
      event.preventDefault();
      void composer.submit();
    }
  };

  const imageCount = composer.images.images.length;

  return (
    <form
      ref={containerRef}
      onSubmit={composer.submit}
      onKeyDown={handleKeyDown}
      {...dropProps}
      className="group/composer relative rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_var(--color-accent-soft),0_0_32px_-12px_var(--color-accent)]"
    >
      <DropOverlay visible={isDragging} />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <Input
          ref={composer.titleRef}
          aria-label={copy.titleLabel}
          value={composer.title}
          onChange={(event) => composer.setTitle(event.target.value)}
          placeholder={copy.titlePlaceholder}
          className="h-9 border-transparent bg-transparent px-1 text-[15px] font-medium focus:border-transparent focus:shadow-none"
        />
        <Textarea
          aria-label="Details"
          rows={isSelf ? 2 : 3}
          value={composer.details}
          onChange={(event) => composer.setDetails(event.target.value)}
          placeholder={copy.detailsPlaceholder}
          className="min-h-14 border-transparent bg-transparent px-1 py-1 text-muted focus:border-transparent focus:text-fg focus:shadow-none"
        />
        <PendingImageStrip images={composer.images.images} onRemove={composer.images.remove} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5 sm:px-4">
        {isSelf && <CategorySelect value={composer.category} onChange={composer.setCategory} />}
        <label className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-sunken px-2 text-xs text-muted focus-within:border-accent/60">
          <CalendarDays size={14} className="text-subtle" />
          <span className={isSelf ? 'text-subtle' : 'sr-only'}>{copy.dateLabel}</span>
          <input
            type="date"
            required
            value={composer.meetingDate}
            onChange={(event) => composer.setMeetingDate(event.target.value)}
            className="bg-transparent text-xs text-fg outline-none"
          />
        </label>
        <PrioritySelect value={composer.priority} onChange={composer.setPriority} />
        <IconButton label="Attach screenshots" size="sm" onClick={openPicker} className={cn(imageCount > 0 && 'text-accent')}>
          <Paperclip size={15} />
        </IconButton>
        {imageCount > 0 ? (
          <span className="text-xs text-accent">{imageCount} attached</span>
        ) : (
          <span className="hidden text-xs text-subtle md:inline">{COPY.composerPasteHint}</span>
        )}
        <Button type="submit" size="sm" disabled={!composer.canSubmit} className="ml-auto">
          <Plus size={14} />
          {composer.isSubmitting ? 'Adding…' : copy.submitLabel}
          <Kbd keys={SHORTCUTS.submit.label} className="ml-1 hidden sm:inline-flex" />
        </Button>
      </div>
      <HiddenFileInput ref={inputRef} accept={IMAGE_ACCEPT} multiple onChange={onChange} />
    </form>
  );
}
