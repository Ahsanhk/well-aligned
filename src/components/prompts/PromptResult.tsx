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
}

export function PromptResult({ prompt, text, onTextChange, warning, isEdited }: Props) {
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
      <CopyButton text={text} label="Copy prompt" copiedLabel="Copied ✓" variant="primary" size="lg" className="w-full" />
    </div>
  );
}
