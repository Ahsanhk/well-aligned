'use client';

import { useCallback, useRef, type ChangeEvent } from 'react';

export function useFilePicker(onFiles: (files: File[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  return { inputRef, openPicker, onChange };
}
