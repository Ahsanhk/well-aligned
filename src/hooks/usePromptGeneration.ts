'use client';

import { useCallback, useMemo, useState } from 'react';
import { TOAST_COPY } from '@/constants/toast';
import { api, errorMessage } from '@/lib/api-client';
import { useTodosStore } from '@/store/todos';
import { toastError, toastSuccess } from '@/store/toast';
import type { GeneratedPrompt, PromptGenerationStatus } from '@/types';

export function usePromptGeneration(projectId: string, todoIds: string[]) {
  const allTodos = useTodosStore((state) => state.todos);
  const setPrompt = useTodosStore((state) => state.setPrompt);
  const todos = useMemo(() => allTodos.filter((todo) => todoIds.includes(todo.id)), [allTodos, todoIds]);
  const savedPrompt = todos.length === 1 ? todos[0].prompt : null;

  const [extraInstructions, setExtraInstructions] = useState('');
  const [prompt, setPromptMeta] = useState<GeneratedPrompt | null>(savedPrompt);
  const [text, setText] = useState(savedPrompt?.text ?? '');
  const [warning, setWarning] = useState<string | null>(null);
  const [status, setStatus] = useState<PromptGenerationStatus>(savedPrompt ? 'done' : 'idle');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await api.generatePrompt({ projectId, todoIds, extraInstructions: extraInstructions.trim() });
      setPromptMeta(response.prompt);
      setText(response.prompt.text);
      setWarning(response.warning);
      setStatus('done');
      if (response.todoIds.length === 1) setPrompt(response.todoIds[0], response.prompt);
      toastSuccess(TOAST_COPY.promptGenerated);
    } catch (caught) {
      const message = errorMessage(caught);
      setError(message);
      setStatus('error');
      toastError(message);
    }
  }, [projectId, todoIds, extraInstructions, setPrompt]);

  return {
    todos,
    extraInstructions,
    setExtraInstructions,
    prompt,
    text,
    setText,
    warning,
    status,
    error,
    generate,
    isEdited: prompt !== null && text !== prompt.text,
  };
}
