import type { Meeting, TranscriptSegment } from '@/types';

function segmentLine(segment: TranscriptSegment): string {
  return `[${segment.start}] ${segment.speaker}: ${segment.text}`;
}

export function buildTranscriptMarkdown(meeting: Meeting): string {
  const header = [`# ${meeting.title}`, '', `- Date: ${meeting.meetingDate}`, `- Recording: ${meeting.videoName}`];
  if (meeting.model) header.push(`- Transcribed by: ${meeting.model}`);
  const sections = [header.join('\n')];
  if (meeting.summary) sections.push(`## Summary\n\n${meeting.summary}`);
  const lines = meeting.transcript.map(segmentLine);
  sections.push(`## Transcript\n\n${lines.length ? lines.join('\n\n') : '_No transcript._'}`);
  return `${sections.join('\n\n')}\n`;
}

export function buildTranscriptJson(meeting: Meeting): string {
  return JSON.stringify(
    {
      id: meeting.id,
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      videoName: meeting.videoName,
      model: meeting.model,
      summary: meeting.summary,
      transcript: meeting.transcript,
    },
    null,
    2,
  );
}
