'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { MenuItem } from '@/components/ui/MenuItem';
import { CLAUDE_COPY, CLI_COPY, DEFAULT_SEND_MODE, SEND_MODE_OPTIONS } from '@/constants/claude';
import type { RunMode } from '@/types';
import { SendModeIcon } from './SendModeIcon';

interface Props {
  onSend: (mode: RunMode) => void;
  size?: 'sm' | 'lg';
  portal?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  showLabel?: boolean;
  isBusy?: boolean;
  terminalUnavailable?: boolean;
}

export function SendToClaudeButton({
  onSend,
  size = 'sm',
  portal = false,
  disabled = false,
  disabledReason = null,
  showLabel = false,
  isBusy = false,
  terminalUnavailable = false,
}: Props) {
  const isDisabled = disabled || isBusy;
  const primaryMode: RunMode = terminalUnavailable ? 'queue' : DEFAULT_SEND_MODE;
  return (
    <div className="flex shrink-0 items-center" title={disabled ? (disabledReason ?? undefined) : undefined}>
      <Button
        variant="secondary"
        size={size}
        onClick={() => onSend(primaryMode)}
        disabled={isDisabled}
        className="rounded-r-none border-r-0"
      >
        <SendModeIcon mode={primaryMode} />
        <span className={showLabel ? undefined : 'hidden sm:inline'}>{isBusy ? CLAUDE_COPY.starting : CLAUDE_COPY.sendToClaude}</span>
      </Button>
      <Menu
        placement="top-start"
        portal={portal}
        className="[&>[role=menu]]:right-0 [&>[role=menu]]:left-auto [&>[role=menu]]:w-64"
        trigger={({ isOpen, toggle }) => (
          <Button
            variant="secondary"
            size={size}
            disabled={isDisabled}
            onClick={toggle}
            aria-expanded={isOpen}
            aria-label="Send options"
            className="rounded-l-none px-2"
          >
            <ChevronDown size={13} />
          </Button>
        )}
      >
        {(close) =>
          SEND_MODE_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              icon={<SendModeIcon mode={option.value} />}
              label={option.label}
              disabled={terminalUnavailable && option.value === 'terminal'}
              title={terminalUnavailable && option.value === 'terminal' ? CLI_COPY.terminalUnavailable : undefined}
              onSelect={() => {
                close();
                onSend(option.value);
              }}
            />
          ))
        }
      </Menu>
    </div>
  );
}
