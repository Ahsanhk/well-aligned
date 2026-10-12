'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/app';
import { DEFAULT_PROJECT_COLOR } from '@/constants/project-colors';
import { useGroupsStore } from '@/store/groups';
import type { ProjectGroup, ProjectGroupInput } from '@/types';

function toInput(group: ProjectGroup | null): ProjectGroupInput {
  return {
    name: group?.name ?? '',
    description: group?.description ?? '',
    color: group?.color ?? DEFAULT_PROJECT_COLOR,
  };
}

export function useGroupForm(group: ProjectGroup | null, onDone: () => void) {
  const router = useRouter();
  const create = useGroupsStore((state) => state.create);
  const update = useGroupsStore((state) => state.update);
  const [values, setValues] = useState<ProjectGroupInput>(() => toInput(group));
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof ProjectGroupInput>(key: K, value: ProjectGroupInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const canSubmit = values.name.trim().length > 0 && !isSaving;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    const input = { ...values, name: values.name.trim(), description: values.description.trim() };
    if (group) {
      const ok = await update(group.id, input);
      setIsSaving(false);
      if (ok) onDone();
      return;
    }
    const created = await create(input);
    setIsSaving(false);
    if (!created) return;
    onDone();
    router.push(ROUTES.group(created.id));
  };

  return { values, setField, submit, canSubmit, isSaving, isEditing: Boolean(group) };
}
