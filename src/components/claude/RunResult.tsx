import { CircleCheckBig, FileDiff } from 'lucide-react';
import { CLAUDE_COPY } from '@/constants/claude';
import type { Run } from '@/types';

export function RunResult({ run }: { run: Run }) {
  return (
    <div className="animate-fade-in flex flex-col gap-3 rounded-lg border border-success/25 bg-success/5 p-3">
      <p className="flex items-center gap-2 text-sm font-medium text-success">
        <CircleCheckBig size={15} />
        {CLAUDE_COPY.runDoneTitle}
      </p>
      {run.summary && <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-fg/90">{run.summary}</p>}
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-subtle uppercase">
          <FileDiff size={11} />
          {CLAUDE_COPY.filesChanged}
        </p>
        {run.filesChanged.length === 0 ? (
          <p className="text-xs text-subtle">{CLAUDE_COPY.noFilesChanged}</p>
        ) : (
          <ul className="flex max-h-40 flex-col overflow-y-auto font-mono text-[12px]">
            {run.filesChanged.map((file) => (
              <li key={file.path} className="flex items-center gap-2 py-0.5">
                <span className="min-w-0 flex-1 truncate text-muted" title={file.path}>
                  {file.path}
                </span>
                <span className="text-success tabular-nums">+{file.additions}</span>
                <span className="text-danger tabular-nums">−{file.deletions}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
