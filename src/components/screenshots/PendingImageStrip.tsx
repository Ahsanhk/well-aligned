import type { PendingImage } from '@/types';
import { ScreenshotThumb } from './ScreenshotThumb';

interface Props {
  images: PendingImage[];
  onRemove: (id: string) => void;
}

export function PendingImageStrip({ images, onRemove }: Props) {
  if (images.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {images.map((image) => (
        <ScreenshotThumb key={image.id} src={image.previewUrl} alt={image.file.name} onRemove={() => onRemove(image.id)} />
      ))}
    </div>
  );
}
