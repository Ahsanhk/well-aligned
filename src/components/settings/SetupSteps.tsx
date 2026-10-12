import { CopyButton } from '@/components/ui/CopyButton';
import { QUEUE_PHRASE, SETTINGS_COPY } from '@/constants/claude';

interface Props {
  command: string | null;
  hasToken: boolean;
}

function Step({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-elevated text-xs font-medium text-accent tabular-nums">
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5 text-sm text-muted">{children}</div>
    </li>
  );
}

export function SetupSteps({ command, hasToken }: Props) {
  return (
    <ol className="flex flex-col gap-4">
      <Step index={1}>{SETTINGS_COPY.stepCreate}</Step>
      <Step index={2}>
        <p>
          {SETTINGS_COPY.stepCommand} {hasToken && <span className="text-success">{SETTINGS_COPY.stepCommandTokenFilled}</span>}
        </p>
        {command && (
          <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-2.5">
            <code className="font-mono text-[12px] leading-relaxed break-all text-fg/90">{command}</code>
            <CopyButton text={command} label={SETTINGS_COPY.copyCommand} className="self-end" />
          </div>
        )}
        <p className="text-xs text-subtle">{SETTINGS_COPY.displayOnly}</p>
      </Step>
      <Step index={3}>{SETTINGS_COPY.stepRestart}</Step>
      <Step index={4}>
        <p>
          {SETTINGS_COPY.stepTry} <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[12px] text-accent">{QUEUE_PHRASE}</code>
        </p>
      </Step>
    </ol>
  );
}
