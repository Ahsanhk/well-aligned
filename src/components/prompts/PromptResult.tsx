import type { ReactNode } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Textarea } from '@/components/ui/Textarea';
import { formatRelativeTime } from '@/lib/date';
import type { GeneratedPrompt } from '@/types';
import { PromptSourceBadge } from './PromptSourceBadge';
import { PromptWarning } from './PromptWarning';

interface Props {
  prompt: GeneratedPrompt;
  text: string;
  onTextChange: (text: string) => void;
  warning: string | null;
  isEdited: boolean;
  actions?: ReactNode;
  actionsHint?: string | null;
}

export function PromptResult({ prompt, text, onTextChange, warning, isEdited, actions, actionsHint }: Props) {
  return (
    <div className="animate-fade-in flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <PromptSourceBadge prompt={prompt} />
        <span className="text-xs text-subtle">Generated {formatRelativeTime(prompt.generatedAt)}</span>
        {isEdited && <span className="text-xs text-accent">· edited</span>}
      </div>
      {warning && <PromptWarning message={warning} />}
      <Textarea
        mono
        aria-label="Generated prompt"
        spellCheck={false}
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        className="h-[45dvh] min-h-60 resize-y bg-sunken"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <CopyButton text={text} label="Copy prompt" copiedLabel="Copied ✓" variant="primary" size="lg" className="w-full sm:flex-1" />
        {actions}
      </div>
      {actionsHint && <p className="text-xs text-subtle">{actionsHint}</p>}
    </div>
  );
}
