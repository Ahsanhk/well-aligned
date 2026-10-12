import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TRANSCRIPT_FORMATS } from '@/constants/meetings';
import { transcriptUrl } from '@/lib/api-client';
import { downloadFromUrl } from '@/lib/download';

export function TranscriptDownloads({ meetingId }: { meetingId: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {TRANSCRIPT_FORMATS.map((format) => (
        <Button key={format.value} variant="secondary" size="sm" onClick={() => downloadFromUrl(transcriptUrl(meetingId, format.value))}>
          <Download size={13} />
          {format.value.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
