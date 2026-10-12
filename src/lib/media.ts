import { MEETING_FALLBACK_MIME, MEETING_FILE_EXTENSIONS } from '@/constants/meetings';

function extensionOf(name: string) {
  const index = name.lastIndexOf('.');
  return index === -1 ? '' : name.slice(index + 1).toLowerCase();
}

export function isMediaFile(file: File) {
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) return true;
  return extensionOf(file.name) in MEETING_FILE_EXTENSIONS;
}

export function mediaMimeType(file: File) {
  if (file.type) return file.type;
  return MEETING_FILE_EXTENSIONS[extensionOf(file.name)] ?? MEETING_FALLBACK_MIME;
}
