import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Spinner } from '@/components/ui/Spinner';
import { CLI_COPY, CLI_INSTALL_COMMAND } from '@/constants/claude';

interface Props {
  isChecking: boolean;
  onCheck: () => void;
  showQueueHint?: boolean;
}

export function CliInstallNotice({ isChecking, onCheck, showQueueHint = false }: Props) {
  return (
    <div role="status" className="animate-fade-in flex flex-col gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3">
      <p className="flex items-center gap-2 text-sm font-medium text-warning">
        <TriangleAlert size={15} className="shrink-0" />
        {CLI_COPY.title}
      </p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-sunken px-3 py-2 font-mono text-[12px] text-fg" title={CLI_INSTALL_COMMAND}>
          {CLI_INSTALL_COMMAND}
        </code>
        <CopyButton text={CLI_INSTALL_COMMAND} label={CLI_COPY.copyCommand} />
      </div>
      <p className="text-[13px] text-muted">
        {CLI_COPY.then} <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[12px] text-accent">{CLI_COPY.loginCommand}</code>{' '}
        {CLI_COPY.thenSuffix}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onCheck} disabled={isChecking}>
          {isChecking ? <Spinner size={12} /> : <RotateCcw size={12} />}
          {isChecking ? CLI_COPY.checking : CLI_COPY.checkAgain}
        </Button>
        {showQueueHint && <span className="text-xs text-subtle">{CLI_COPY.queueStillWorks}</span>}
      </div>
    </div>
  );
}
