'use client';

import { CalendarDays, Film, RotateCcw, Upload, X } from 'lucide-react';
import { DropOverlay } from '@/components/screenshots/DropOverlay';
import { Button } from '@/components/ui/Button';
import { HiddenFileInput } from '@/components/ui/HiddenFileInput';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { MEETING_ACCEPT, MEETING_COPY } from '@/constants/meetings';
import { useDropzone } from '@/hooks/useDropzone';
import { useFilePicker } from '@/hooks/useFilePicker';
import { useMeetingUpload } from '@/hooks/useMeetingUpload';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/lib/images';
import { isMediaFile } from '@/lib/media';
import type { ItemOwner } from '@/types';
import { MeetingProcessingState } from './MeetingProcessingState';
import { UploadProgress } from './UploadProgress';

export function MeetingUploadCard({ owner }: { owner: ItemOwner }) {
  const upload = useMeetingUpload(owner);
  const { inputRef, openPicker, onChange } = useFilePicker(upload.pick);
  const { isDragging, dropProps } = useDropzone(upload.pick, isMediaFile);
  const isBusy = upload.phase === 'uploading' || upload.phase === 'processing';

  return (
    <section
      {...(isBusy ? {} : dropProps)}
      className="relative overflow-hidden rounded-xl border border-line bg-surface"
    >
      <DropOverlay visible={isDragging && !isBusy} label={MEETING_COPY.dropHint} />
      {upload.phase === 'uploading' && upload.file && (
        <UploadProgress file={upload.file} progress={upload.progress} onCancel={upload.cancel} />
      )}
      {upload.phase === 'processing' && upload.processingMeeting && (
        <MeetingProcessingState startedAt={upload.processingMeeting.createdAt} fileName={upload.processingMeeting.videoName} />
      )}
      {!isBusy && (
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-medium text-fg">{MEETING_COPY.uploadTitle}</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{MEETING_COPY.uploadDescription}</p>
          </div>
          {upload.file ? (
            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5">
              <Film size={18} className="shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{upload.file.name}</p>
                <p className="text-xs text-muted">{formatBytes(upload.file.size)}</p>
              </div>
              <IconButton label="Remove file" size="sm" onClick={upload.clearFile}>
                <X size={14} />
              </IconButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-8 text-center transition-colors duration-150 hover:border-accent/60 hover:bg-accent/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elevated text-muted transition-colors group-hover:text-accent">
                <Upload size={18} />
              </span>
              <span className="text-sm text-fg">{MEETING_COPY.dropHint}</span>
              <span className="text-xs text-subtle">{MEETING_COPY.formatsHint}</span>
            </button>
          )}
          {upload.phase === 'error' && upload.error && <p className="text-sm text-danger">{upload.error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Meeting title"
                value={upload.title}
                onChange={(event) => upload.setTitle(event.target.value)}
                placeholder={MEETING_COPY.titlePlaceholder}
              />
            </div>
            <label className="flex h-10 items-center gap-1.5 rounded-lg border border-line bg-sunken/70 px-3 text-sm focus-within:border-accent/60">
              <CalendarDays size={14} className="text-subtle" />
              <span className="sr-only">Meeting date</span>
              <input
                type="date"
                required
                value={upload.meetingDate}
                onChange={(event) => upload.setMeetingDate(event.target.value)}
                className="bg-transparent text-sm text-fg outline-none"
              />
            </label>
            <Button
              onClick={() => void upload.start()}
              disabled={!upload.file || !upload.meetingDate}
              className={cn('h-10', !upload.file && 'shadow-none')}
            >
              {upload.phase === 'error' ? <RotateCcw size={15} /> : <Upload size={15} />}
              {upload.phase === 'error' ? 'Try again' : 'Upload & analyze'}
            </Button>
          </div>
        </div>
      )}
      <HiddenFileInput ref={inputRef} accept={MEETING_ACCEPT} onChange={onChange} />
    </section>
  );
}
