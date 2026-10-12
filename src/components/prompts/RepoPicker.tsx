import { FolderGit2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { GROUP_COPY } from '@/constants/groups';

interface Props {
  options: { id: string; name: string }[];
  value: string;
  onChange: (projectId: string) => void;
}

export function RepoPicker({ options, value, onChange }: Props) {
  if (options.length === 0) {
    return <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-sm text-muted">{GROUP_COPY.promptNoProjects}</p>;
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-indigo/25 bg-indigo/5 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-indigo">
        <FolderGit2 size={13} />
        {GROUP_COPY.promptRepo}
      </span>
      <Select
        size="sm"
        aria-label={GROUP_COPY.promptRepo}
        options={options.map((option) => ({ value: option.id, label: option.name }))}
        value={value}
        onChange={onChange}
        className="min-w-48"
      />
      <span className="text-xs text-subtle sm:ml-auto">{GROUP_COPY.promptRepoHint}</span>
    </div>
  );
}
