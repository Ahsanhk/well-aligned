'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { HiddenFileInput } from '@/components/ui/HiddenFileInput';
import { Spinner } from '@/components/ui/Spinner';
import { IMAGE_ACCEPT } from '@/constants/app';
import { useDropzone } from '@/hooks/useDropzone';
import { useFilePicker } from '@/hooks/useFilePicker';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';
import { screenshotUrl } from '@/lib/api-client';
import { useTodosStore } from '@/store/todos';
import type { Todo } from '@/types';
import { DropOverlay } from './DropOverlay';
import { ScreenshotLightbox } from './ScreenshotLightbox';
import { ScreenshotThumb } from './ScreenshotThumb';

export function ScreenshotManager({ todo }: { todo: Todo }) {
  const removeScreenshot = useTodosStore((state) => state.removeScreenshot);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { upload, isUploading } = useScreenshotUpload(todo.id);

  const { inputRef, openPicker, onChange } = useFilePicker(upload);
  const { isDragging, dropProps } = useDropzone(upload);

  return (
    <div {...dropProps} className="relative rounded-lg">
      <DropOverlay visible={isDragging} />
      <div className="flex flex-wrap gap-2">
        {todo.screenshots.map((shot, index) => (
          <ScreenshotThumb
            key={shot.id}
            src={screenshotUrl(shot.id)}
            alt={shot.originalName}
            onOpen={() => setOpenIndex(index)}
            onRemove={() => void removeScreenshot(todo.id, shot.id)}
          />
        ))}
        <button
          type="button"
          onClick={openPicker}
          disabled={isUploading}
          className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-xs text-subtle transition-colors duration-150 hover:border-accent/60 hover:text-accent disabled:cursor-wait"
        >
          {isUploading ? <Spinner /> : <ImagePlus size={16} />}
          {isUploading ? 'Uploading' : 'Add or drop'}
        </button>
      </div>
      <HiddenFileInput ref={inputRef} accept={IMAGE_ACCEPT} multiple onChange={onChange} />
      {openIndex !== null && (
        <ScreenshotLightbox
          screenshots={todo.screenshots}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
