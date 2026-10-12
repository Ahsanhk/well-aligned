import { SPEAKER_TONE_CLASSES } from '@/constants/meetings';
import type { TranscriptSegment } from '@/types';

export function speakerToneMap(segments: TranscriptSegment[]) {
  const tones = new Map<string, string>();
  segments.forEach((segment) => {
    if (!tones.has(segment.speaker)) tones.set(segment.speaker, SPEAKER_TONE_CLASSES[tones.size % SPEAKER_TONE_CLASSES.length]);
  });
  return tones;
}
