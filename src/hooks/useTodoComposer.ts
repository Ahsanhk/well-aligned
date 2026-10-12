'use client';

import { useCallback, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_CATEGORY } from '@/constants/backlog';
import { DEFAULT_PRIORITY } from '@/constants/priority';
import { todayKey } from '@/lib/date';
import { useTodosStore } from '@/store/todos';
import type { ItemOwner, TodoCategory, TodoInput, TodoOrigin, TodoPriority } from '@/types';
import { usePendingImages } from './usePendingImages';

export function useTodoComposer(owner: ItemOwner, origin: TodoOrigin) {
  const create = useTodosStore((state) => state.create);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [meetingDate, setMeetingDate] = useState(todayKey);
  const [priority, setPriority] = useState<TodoPriority>(DEFAULT_PRIORITY);
  const [category, setCategory] = useState<TodoCategory>(DEFAULT_CATEGORY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const images = usePendingImages();

  const canSubmit = title.trim().length > 0 && meetingDate.length > 0 && !isSubmitting;

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!canSubmit) return;
      setIsSubmitting(true);
      const input: TodoInput = { title: title.trim(), details: details.trim(), meetingDate, priority };
      const todo = await create(owner, origin === 'self' ? { ...input, origin, category } : input, images.files);
      setIsSubmitting(false);
      if (!todo) return;
      setTitle('');
      setDetails('');
      setPriority(DEFAULT_PRIORITY);
      images.clear();
      titleRef.current?.focus();
    },
    [canSubmit, create, owner, origin, category, title, details, meetingDate, priority, images],
  );

  const focus = useCallback(() => titleRef.current?.focus(), []);

  return {
    titleRef,
    title,
    setTitle,
    details,
    setDetails,
    meetingDate,
    setMeetingDate,
    priority,
    setPriority,
    category,
    setCategory,
    images,
    canSubmit,
    isSubmitting,
    submit,
    focus,
  };
}
