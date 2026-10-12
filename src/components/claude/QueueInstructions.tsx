import { ListPlus } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { CLAUDE_COPY, QUEUE_PHRASE } from '@/constants/claude';

export function QueueInstructions() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent/25 bg-accent/5 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-fg">
        <ListPlus size={16} className="text-accent" />
        {CLAUDE_COPY.queuedTitle}
      </p>
      <p className="text-[13px] leading-relaxed text-muted">{CLAUDE_COPY.queuedHint}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-md border border-line bg-sunken px-3 py-2 font-mono text-[13px] text-accent">{QUEUE_PHRASE}</code>
        <CopyButton text={QUEUE_PHRASE} label={CLAUDE_COPY.copyPhrase} />
      </div>
    </div>
  );
}
