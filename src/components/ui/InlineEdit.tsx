'use client';

import { useState, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  value: string;
  onSave: (value: string) => void;
  label: string;
  className?: string;
  inputClassName?: string;
}

export function InlineEdit({ value, onSave, label, className, inputClassName }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const next = draft.trim();
    setDraft(null);
    if (next && next !== value) onSave(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') {
      event.stopPropagation();
      setDraft(null);
    }
  };

  if (draft !== null) {
    return (
      <input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full min-w-0 rounded-md border border-accent/60 bg-sunken px-1.5 text-fg shadow-[0_0_0_3px_var(--color-accent-soft)] outline-none',
          inputClassName,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setDraft(value)}
      title={label}
      className={cn('group/inline inline-flex max-w-full min-w-0 cursor-text items-center gap-2 rounded-md text-left', className)}
    >
      <span className="truncate">{value}</span>
      <Pencil size={14} className="shrink-0 text-subtle opacity-0 transition-opacity duration-150 group-hover/inline:opacity-100" />
    </button>
  );
}
