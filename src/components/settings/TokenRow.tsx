'use client';

import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SETTINGS_COPY } from '@/constants/claude';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatRelativeTime } from '@/lib/date';
import type { ApiToken } from '@/types';

interface Props {
  token: ApiToken;
  onRevoke: () => void;
}

export function TokenRow({ token, onRevoke }: Props) {
  const confirm = useDisclosure();
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <KeyRound size={14} className="shrink-0 text-subtle" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">{token.name}</p>
        <p className="text-xs text-subtle">
          {SETTINGS_COPY.lastUsed}: {token.lastUsedAt ? formatRelativeTime(token.lastUsedAt) : SETTINGS_COPY.neverUsed}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={confirm.open} className="text-danger hover:text-danger">
        {SETTINGS_COPY.revoke}
      </Button>
      <ConfirmModal
        open={confirm.isOpen}
        title={SETTINGS_COPY.revokeTitle}
        message={SETTINGS_COPY.revokeMessage(token.name)}
        confirmLabel={SETTINGS_COPY.revoke}
        onClose={confirm.close}
        onConfirm={() => {
          confirm.close();
          onRevoke();
        }}
      />
    </li>
  );
}
