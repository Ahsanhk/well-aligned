'use client';

import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { screenshotUrl } from '@/lib/api-client';
import { formatBytes } from '@/lib/images';
import type { Screenshot } from '@/types';

interface Props {
  screenshots: Screenshot[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function ScreenshotLightbox({ screenshots, ...props }: Props) {
  const images = screenshots.map((shot) => ({
    id: shot.id,
    src: screenshotUrl(shot.id),
    name: shot.originalName,
    meta: formatBytes(shot.size),
  }));
  return <ImageLightbox images={images} {...props} />;
}
