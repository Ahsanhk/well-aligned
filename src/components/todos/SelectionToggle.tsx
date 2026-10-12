'use client';

import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/cn';

interface Props {
  checked: boolean;
  onChange: () => void;
  label: string;
  isSelectionMode: boolean;
  revealGroup: 'row' | 'header';
}

const REVEAL_CLASSES = {
  row: 'group-hover/row:opacity-100',
  header: 'group-hover/header:opacity-100',
};

export function SelectionToggle({ checked, onChange, label, isSelectionMode, revealGroup }: Props) {
  return (
    <span
      className={cn(
        'flex w-4 shrink-0 items-center justify-center transition-opacity duration-150 focus-within:opacity-100 pointer-coarse:opacity-100',
        isSelectionMode || checked ? 'opacity-100' : cn('opacity-0', REVEAL_CLASSES[revealGroup]),
      )}
    >
      <Checkbox checked={checked} onChange={onChange} label={label} />
    </span>
  );
}
