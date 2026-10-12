'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, Film, Sparkles, Trash2 } from 'lucide-react';
import { ProjectDot } from '@/components/projects/ProjectDot';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconButton } from '@/components/ui/IconButton';
import { InlineEdit } from '@/components/ui/InlineEdit';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useOwnerInfo } from '@/hooks/useOwnerInfo';
import { formatDateKey } from '@/lib/date';
import { meetingOwner, ownerTabRoute } from '@/lib/owner';
import { formatBytes } from '@/lib/images';
import { transcriptDurationSeconds } from '@/lib/meeting-stats';
import { formatDurationLabel } from '@/lib/timestamp';
import { useMeetingsStore } from '@/store/meetings';
import type { Meeting } from '@/types';
import { MeetingStatusPill } from './MeetingStatusPill';

export function MeetingDetailHeader({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const owner = meetingOwner(meeting);
  const ownerInfo = useOwnerInfo(owner);
  const rename = useMeetingsStore((state) => state.rename);
  const remove = useMeetingsStore((state) => state.remove);
  const confirm = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const duration = transcriptDurationSeconds(meeting.transcript);
  const backHref = ownerTabRoute(owner, 'meetings');

  const handleDelete = async () => {
    setIsDeleting(true);
    const ok = await remove(meeting.id);
    setIsDeleting(false);
    confirm.close();
    if (ok) router.push(backHref);
  };

  return (
    <header className="flex flex-col gap-4">
      <Link href={backHref} className="inline-flex items-center gap-2 self-start text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft size={14} />
        {ownerInfo && <ProjectDot color={ownerInfo.color} />}
        {ownerInfo ? `${ownerInfo.name} · Meetings` : 'Meetings'}
      </Link>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <h1 className="min-w-0 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            <InlineEdit
              value={meeting.title || meeting.videoName}
              label="Rename meeting"
              onSave={(title) => void rename(meeting.id, title)}
              inputClassName="h-9 text-xl font-semibold sm:text-2xl"
            />
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <MeetingStatusPill status={meeting.status} />
            <Badge icon={<CalendarDays size={10} />}>{formatDateKey(meeting.meetingDate)}</Badge>
            {duration > 0 && <Badge icon={<Clock size={10} />}>{formatDurationLabel(duration)}</Badge>}
            <Badge icon={<Film size={10} />} className="max-w-60">
              <span className="truncate">{meeting.videoName}</span>
              {meeting.videoSize > 0 && <span className="text-subtle">· {formatBytes(meeting.videoSize)}</span>}
            </Badge>
            {meeting.model && (
              <Badge tone="violet" icon={<Sparkles size={10} />}>
                {meeting.model}
              </Badge>
            )}
          </div>
        </div>
        <IconButton label="Delete meeting" tone="danger" onClick={confirm.open} className="border border-line">
          <Trash2 size={15} />
        </IconButton>
      </div>
      <ConfirmModal
        open={confirm.isOpen}
        title="Delete meeting?"
        message="The transcript and any unreviewed suggestions will be permanently deleted. Todos you already added from this meeting are kept."
        confirmLabel="Delete meeting"
        busy={isDeleting}
        onClose={confirm.close}
        onConfirm={() => void handleDelete()}
      />
    </header>
  );
}
