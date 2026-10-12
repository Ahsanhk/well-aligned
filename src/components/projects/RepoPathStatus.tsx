import { CircleAlert, GitBranch } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { COPY } from '@/constants/app';
import { STACK_DISPLAY_SEPARATOR } from '@/constants/stack';
import { FOLDER_PICKER_COPY } from '@/constants/system';
import { cn } from '@/lib/cn';
import type { FolderDetectionStatus, FolderInspection } from '@/types';

interface Props {
  isPicking: boolean;
  status: FolderDetectionStatus;
  inspection: FolderInspection | null;
  error: string | null;
}

export function RepoPathStatus({ isPicking, status, inspection, error }: Props) {
  if (isPicking) {
    return (
      <span className="flex items-center gap-1.5 text-accent">
        <Spinner size={12} />
        {FOLDER_PICKER_COPY.picking}
      </span>
    );
  }
  if (status === 'detecting') {
    return (
      <span className="flex items-center gap-1.5 text-muted">
        <Spinner size={12} />
        {FOLDER_PICKER_COPY.detecting}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-danger/80">
        <CircleAlert size={12} />
        {error}
      </span>
    );
  }
  if (status === 'detected' && inspection) {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-muted">
          {inspection.stack.length > 0 ? (
            <>
              <span className="text-subtle">{FOLDER_PICKER_COPY.detectedPrefix}</span>{' '}
              <span className="text-fg/80">{inspection.stack.join(STACK_DISPLAY_SEPARATOR)}</span>
            </>
          ) : (
            FOLDER_PICKER_COPY.nothingDetected
          )}
        </span>
        <span className={cn('inline-flex items-center gap-1', inspection.isGitRepo ? 'text-success' : 'text-warning')}>
          <GitBranch size={11} />
          {inspection.isGitRepo ? FOLDER_PICKER_COPY.gitRepo : FOLDER_PICKER_COPY.notGitRepo}
        </span>
      </span>
    );
  }
  return <span>{COPY.repoPathHint}</span>;
}
