'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DEFAULT_PROJECT_COLOR } from '@/constants/project-colors';
import { GROUP_COPY, NEW_GROUP_VALUE, NO_GROUP_VALUE } from '@/constants/groups';
import { useGroupsStore } from '@/store/groups';

interface Props {
  value: string | null;
  onChange: (groupId: string | null) => void;
}

export function GroupSelect({ value, onChange }: Props) {
  const groups = useGroupsStore((state) => state.groups);
  const create = useGroupsStore((state) => state.create);
  const [draft, setDraft] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const options = [
    { value: NO_GROUP_VALUE, label: GROUP_COPY.noGroup },
    ...groups.map((group) => ({ value: group.id, label: group.name })),
    { value: NEW_GROUP_VALUE, label: GROUP_COPY.createGroupOption },
  ];

  const handleSelect = (next: string) => {
    if (next === NEW_GROUP_VALUE) {
      setDraft('');
      return;
    }
    onChange(next === NO_GROUP_VALUE ? null : next);
  };

  const createGroup = async () => {
    const name = draft?.trim();
    if (!name || isCreating) return;
    setIsCreating(true);
    const group = await create({ name, description: '', color: DEFAULT_PROJECT_COLOR });
    setIsCreating(false);
    if (!group) return;
    onChange(group.id);
    setDraft(null);
  };

  return (
    <Field label={GROUP_COPY.groupField} htmlFor="project-group" hint="Optional">
      {draft === null ? (
        <Select id="project-group" options={options} value={value ?? NO_GROUP_VALUE} onChange={handleSelect} className="w-full" />
      ) : (
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              id="project-group"
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void createGroup();
                }
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  setDraft(null);
                }
              }}
              placeholder={GROUP_COPY.groupNamePlaceholder}
            />
          </div>
          <IconButton label="Create group" onClick={() => void createGroup()} disabled={!draft.trim() || isCreating} className="text-accent">
            <Check size={16} />
          </IconButton>
          <IconButton label="Cancel" onClick={() => setDraft(null)}>
            <X size={16} />
          </IconButton>
        </div>
      )}
    </Field>
  );
}
