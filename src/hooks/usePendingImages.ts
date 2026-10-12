'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOAST_COPY } from '@/constants/toast';
import { partitionImageFiles } from '@/lib/images';
import { useToastStore } from '@/store/toast';
import type { PendingImage } from '@/types';

let pendingSequence = 0;

export function usePendingImages() {
  const [images, setImages] = useState<PendingImage[]>([]);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), []);

  const add = useCallback((files: File[]) => {
    const { accepted, rejected } = partitionImageFiles(files);
    if (rejected > 0) useToastStore.getState().show(TOAST_COPY.screenshotTooLarge, { tone: 'danger' });
    if (accepted.length === 0) return;
    const next = accepted.map((file) => {
      pendingSequence += 1;
      return { id: `pending-${pendingSequence}`, file, previewUrl: URL.createObjectURL(file) };
    });
    setImages((current) => [...current, ...next]);
  }, []);

  const remove = useCallback((id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  }, []);

  return { images, files: images.map((image) => image.file), add, remove, clear };
}
