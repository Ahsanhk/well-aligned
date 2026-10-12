'use client';

import { useCallback, useState } from 'react';
import { TOAST_COPY } from '@/constants/toast';
import { partitionImageFiles } from '@/lib/images';
import { useTodosStore } from '@/store/todos';
import { toastError } from '@/store/toast';

export function useScreenshotUpload(todoId: string) {
  const addScreenshots = useTodosStore((state) => state.addScreenshots);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (files: File[]) => {
      const { accepted, rejected } = partitionImageFiles(files);
      if (rejected > 0) toastError(TOAST_COPY.screenshotTooLarge);
      if (accepted.length === 0) return;
      setIsUploading(true);
      await addScreenshots(todoId, accepted);
      setIsUploading(false);
    },
    [addScreenshots, todoId],
  );

  return { upload, isUploading };
}
