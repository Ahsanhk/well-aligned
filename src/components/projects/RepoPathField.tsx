'use client';

import { FolderGit2, FolderOpen } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { COPY } from '@/constants/app';
import { FOLDER_PICKER_COPY } from '@/constants/system';
import { useFolderDetection } from '@/hooks/useFolderDetection';
import { useRepoFolder } from '@/hooks/useRepoFolder';
import { cn } from '@/lib/cn';
import type { FolderInspection } from '@/types';
import { RepoPathStatus } from './RepoPathStatus';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onDetected: (inspection: FolderInspection) => void;
}

export function RepoPathField({ value, onChange, onDetected }: Props) {
  const detection = useFolderDetection(value, onDetected);
  const folder = useRepoFolder(value, (path) => {
    onChange(path);
    void detection.detect(path);
  });

  return (
    <Field
      label="Repo path"
      htmlFor="project-repo"
      description={
        <RepoPathStatus
          isPicking={folder.isPicking}
          status={detection.status}
          inspection={detection.inspection}
          error={detection.error}
        />
      }
    >
      <Input
        id="project-repo"
        icon={<FolderGit2 size={15} />}
        className="font-mono text-[13px]"
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={detection.flush}
        placeholder={COPY.repoPathPlaceholder}
        trailing={
          <IconButton
            label={FOLDER_PICKER_COPY.browse}
            size="sm"
            onClick={() => void folder.browse()}
            disabled={folder.isPicking}
            className={cn(folder.isPicking && 'text-accent')}
          >
            {folder.isPicking ? <Spinner size={14} /> : <FolderOpen size={15} />}
          </IconButton>
        }
      />
    </Field>
  );
}
