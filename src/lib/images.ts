import { SCREENSHOT_MAX_BYTES } from '@/constants/app';

export function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

export function partitionImageFiles(files: Iterable<File>) {
  const accepted: File[] = [];
  let rejected = 0;
  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (file.size > SCREENSHOT_MAX_BYTES) rejected += 1;
    else accepted.push(file);
  }
  return { accepted, rejected };
}

export function nameClipboardImage(file: File, index: number) {
  if (file.name && file.name !== 'image.png') return file;
  const extension = file.type.split('/')[1] ?? 'png';
  return new File([file], `pasted-${Date.now()}-${index + 1}.${extension}`, { type: file.type });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
