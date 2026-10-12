'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { isImageFile } from '@/lib/images';

function carriesFiles(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

export function useDropzone(onFiles: (files: File[]) => void, accept: (file: File) => boolean = isImageFile) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const onDragEnter = useCallback((event: DragEvent) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    depth.current += 1;
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragLeave = useCallback((event: DragEvent) => {
    if (!carriesFiles(event)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []).filter(accept);
      if (files.length > 0) onFiles(files);
    },
    [onFiles, accept],
  );

  return { isDragging, dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}
