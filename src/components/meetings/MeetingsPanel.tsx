import type { ItemOwner } from '@/types';
import { MeetingList } from './MeetingList';
import { MeetingUploadCard } from './MeetingUploadCard';

export function MeetingsPanel({ owner }: { owner: ItemOwner }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <MeetingUploadCard owner={owner} />
      <MeetingList />
    </div>
  );
}
