'use client';

import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { READABLE_WIDTH_CLASS } from '@/constants/layout';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/date';
import { usePromptPanelStore } from '@/store/prompt-panel';
import type { GeneratedPrompt } from '@/types';
import { PromptSourceBadge } from './PromptSourceBadge';

interface Props {
  todoId: string;
  prompt: GeneratedPrompt;
}

export function SavedPrompt({ todoId, prompt }: Props) {
  const openFor = usePromptPanelStore((state) => state.openFor);
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <PromptSourceBadge prompt={prompt} />
        <span className="text-xs text-subtle">{formatRelativeTime(prompt.generatedAt)}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openFor([todoId])}>
            <Maximize2 size={13} />
            Open
          </Button>
          <CopyButton text={prompt.text} />
        </div>
      </div>
      <pre className={cn('max-h-56 overflow-auto px-3 pb-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted', READABLE_WIDTH_CLASS)}>
        {prompt.text}
      </pre>
    </div>
  );
}
