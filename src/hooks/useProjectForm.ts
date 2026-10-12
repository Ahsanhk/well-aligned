'use client';

import { useCallback, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/app';
import { DEFAULT_PROJECT_COLOR } from '@/constants/project-colors';
import { TOAST_COPY } from '@/constants/toast';
import { useProjectsStore } from '@/store/projects';
import { toastSuccess } from '@/store/toast';
import type { FolderInspection, Project, ProjectInput } from '@/types';

function toInput(project: Project | null): ProjectInput {
  return {
    name: project?.name ?? '',
    description: project?.description ?? '',
    repoPath: project?.repoPath ?? '',
    techStack: project?.techStack ?? '',
    color: project?.color ?? DEFAULT_PROJECT_COLOR,
    groupId: project?.groupId ?? null,
  };
}

function trimInput(values: ProjectInput): ProjectInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    repoPath: values.repoPath.trim(),
    techStack: values.techStack.trim(),
    color: values.color,
    groupId: values.groupId ?? null,
  };
}

export function useProjectForm(project: Project | null, onDone: () => void) {
  const router = useRouter();
  const create = useProjectsStore((state) => state.create);
  const update = useProjectsStore((state) => state.update);
  const [values, setValues] = useState<ProjectInput>(() => toInput(project));
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setRepoPath = useCallback((repoPath: string) => setValues((current) => ({ ...current, repoPath })), []);

  const [detected, setDetected] = useState<FolderInspection | null>(null);
  const autoFilled = useRef<{ name: string | null; techStack: string | null }>({ name: null, techStack: null });

  const fillFromFolder = useCallback((inspection: FolderInspection) => {
    setDetected(inspection);
    setValues((current) => {
      const canFillName = !current.name.trim() || current.name === autoFilled.current.name;
      const canFillStack = !current.techStack.trim() || current.techStack === autoFilled.current.techStack;
      if (canFillName) autoFilled.current.name = inspection.name;
      if (canFillStack) autoFilled.current.techStack = inspection.techStack;
      return {
        ...current,
        name: canFillName ? inspection.name : current.name,
        techStack: canFillStack ? inspection.techStack : current.techStack,
      };
    });
  }, []);

  const applyDetectedStack = useCallback(() => {
    if (!detected) return;
    autoFilled.current.techStack = detected.techStack;
    setValues((current) => ({ ...current, techStack: detected.techStack }));
  }, [detected]);

  const detectedStackOffer =
    detected && detected.techStack && detected.techStack !== values.techStack ? detected.techStack : null;

  const canSubmit = values.name.trim().length > 0 && !isSaving;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    const input = trimInput(values);
    if (project) {
      const ok = await update(project.id, input);
      setIsSaving(false);
      if (!ok) return;
      toastSuccess(TOAST_COPY.projectUpdated);
      onDone();
      return;
    }
    const created = await create(input);
    setIsSaving(false);
    if (!created) return;
    toastSuccess(TOAST_COPY.projectCreated);
    onDone();
    router.push(ROUTES.project(created.id));
  };

  return {
    values,
    setField,
    setRepoPath,
    fillFromFolder,
    detectedStackOffer,
    applyDetectedStack,
    submit,
    canSubmit,
    isSaving,
    isEditing: Boolean(project),
  };
}
