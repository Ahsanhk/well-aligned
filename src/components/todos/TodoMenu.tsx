'use client';

import { ArrowRightLeft, Ellipsis, ImagePlus, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { MenuDivider } from '@/components/ui/MenuDivider';
import { MenuItem } from '@/components/ui/MenuItem';
import { MenuLabel } from '@/components/ui/MenuLabel';
import type { MoveOption } from '@/types';

interface Props {
  onEdit: () => void;
  onAddScreenshots: () => void;
  onGeneratePrompt: () => void;
  onDelete: () => void;
  moveHeading: string;
  moveOptions: MoveOption[];
  onMove: (option: MoveOption) => void;
}

export function TodoMenu({ onEdit, onAddScreenshots, onGeneratePrompt, onDelete, moveHeading, moveOptions, onMove }: Props) {
  return (
    <Menu
      trigger={({ isOpen, toggle }) => (
        <IconButton label="Todo actions" size="sm" onClick={toggle} aria-expanded={isOpen} className={isOpen ? 'bg-elevated text-fg' : undefined}>
          <Ellipsis size={16} />
        </IconButton>
      )}
    >
      {(close) => {
        const select = (action: () => void) => () => {
          close();
          action();
        };
        return (
          <>
            <MenuItem icon={<Pencil size={14} />} label="Edit" onSelect={select(onEdit)} />
            <MenuItem icon={<ImagePlus size={14} />} label="Add screenshots" onSelect={select(onAddScreenshots)} />
            <MenuItem icon={<Sparkles size={14} />} label="Generate prompt" onSelect={select(onGeneratePrompt)} />
            {moveOptions.length > 0 && (
              <>
                <MenuDivider />
                <MenuLabel>{moveHeading}</MenuLabel>
                {moveOptions.map((option) => (
                  <MenuItem key={option.key} icon={<ArrowRightLeft size={14} />} label={option.label} onSelect={select(() => onMove(option))} />
                ))}
              </>
            )}
            <MenuDivider />
            <MenuItem icon={<Trash2 size={14} />} label="Delete" tone="danger" onSelect={select(onDelete)} />
          </>
        );
      }}
    </Menu>
  );
}
