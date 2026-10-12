'use client';

import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { SETTINGS_COPY } from '@/constants/claude';
import type { ApiToken, CreatedApiToken } from '@/types';
import { CreatedTokenNotice } from './CreatedTokenNotice';
import { TokenRow } from './TokenRow';

interface Props {
  tokens: ApiToken[];
  isLoaded: boolean;
  created: CreatedApiToken | null;
  isCreating: boolean;
  onCreate: (name: string) => Promise<boolean>;
  onRevoke: (tokenId: string) => void;
}

export function TokenManager({ tokens, isLoaded, created, isCreating, onCreate, onRevoke }: Props) {
  const [name, setName] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (await onCreate(name.trim())) setName('');
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            aria-label={SETTINGS_COPY.tokenName}
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            placeholder={SETTINGS_COPY.tokenNamePlaceholder}
          />
        </div>
        <Button type="submit" disabled={!name.trim() || isCreating} className="h-10">
          <Plus size={14} />
          {isCreating ? SETTINGS_COPY.creating : SETTINGS_COPY.createToken}
        </Button>
      </form>
      {created && <CreatedTokenNotice token={created} />}
      {!isLoaded ? (
        <Skeleton className="h-14 rounded-lg" />
      ) : tokens.length === 0 ? (
        <p className="text-sm text-subtle">{SETTINGS_COPY.noTokens}</p>
      ) : (
        <ul className="divide-y divide-line/60 rounded-lg border border-line bg-surface/60">
          {tokens.map((token) => (
            <TokenRow key={token.id} token={token} onRevoke={() => onRevoke(token.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}
