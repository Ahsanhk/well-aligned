import { FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { GeneratedPrompt } from '@/types';

export function PromptSourceBadge({ prompt }: { prompt: Pick<GeneratedPrompt, 'source' | 'model'> }) {
  if (prompt.source === 'ai') {
    return (
      <Badge tone="violet" icon={<Sparkles size={10} />}>
        AI enhanced{prompt.model ? ` (${prompt.model})` : ''}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" icon={<FileText size={10} />}>
      Template
    </Badge>
  );
}
