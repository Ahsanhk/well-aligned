'use client';

import { useState, type FormEvent } from 'react';
import { DEFAULT_CATEGORY } from '@/constants/backlog';
import { TOAST_COPY } from '@/constants/toast';
import { isSelfItem } from '@/lib/todo-origin';
import { useTodosStore } from '@/store/todos';
import { toastSuccess } from '@/store/toast';
import type { Todo, TodoPatch } from '@/types';

type TodoFormValues = Required<TodoPatch>;

function toValues(todo: Todo): TodoFormValues {
  return {
    title: todo.title,
    details: todo.details,
    meetingDate: todo.meetingDate,
    priority: todo.priority,
    status: todo.status,
    category: todo.category ?? null,
  };
}

export function useTodoForm(todo: Todo, onDone: () => void) {
  const update = useTodosStore((state) => state.update);
  const [values, setValues] = useState<TodoFormValues>(() => toValues(todo));
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof TodoFormValues>(key: K, value: TodoFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const canSubmit = values.title.trim().length > 0 && values.meetingDate.length > 0 && !isSaving;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    const { category, ...rest } = values;
    const patch = { ...rest, title: values.title.trim(), details: values.details.trim() };
    const ok = await update(todo.id, isSelfItem(todo) ? { ...patch, category: category ?? DEFAULT_CATEGORY } : patch);
    setIsSaving(false);
    if (!ok) return;
    toastSuccess(TOAST_COPY.todoUpdated);
    onDone();
  };

  return { values, setField, submit, canSubmit, isSaving, isSelf: isSelfItem(todo) };
}
