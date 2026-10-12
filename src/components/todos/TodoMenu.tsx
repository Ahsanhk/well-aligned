'use client';

import { ArrowRightLeft, Ellipsis, ImagePlus, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { SendModeIcon } from '@/components/claude/SendModeIcon';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { MenuDivider } from '@/components/ui/MenuDivider';
import { MenuItem } from '@/components/ui/MenuItem';
import { MenuLabel } from '@/components/ui/MenuLabel';
import { CLAUDE_COPY, SEND_MODE_OPTIONS } from '@/constants/claude';
import type { MoveOption, RunMode } from '@/types';

interface Props {
  onEdit: () => void;
  onAddScreenshots: () => void;
  onGeneratePrompt: () => void;
  onSendToClaude: (mode: RunMode) => void;
  onDelete: () => void;
  moveHeading: string;
  moveOptions: MoveOption[];
  onMove: (option: MoveOption) => void;
}

export function TodoMenu({ onEdit, onAddScreenshots, onGeneratePrompt, onSendToClaude, onDelete, moveHeading, moveOptions, onMove }: Props) {
  return (
    <Menu
      portal
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
            <MenuDivider />
            <MenuLabel>{CLAUDE_COPY.sendToClaude}</MenuLabel>
            {SEND_MODE_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                icon={<SendModeIcon mode={option.value} />}
                label={option.label}
                onSelect={select(() => onSendToClaude(option.value))}
              />
            ))}
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
