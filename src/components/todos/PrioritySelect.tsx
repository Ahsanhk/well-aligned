import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PRIORITY_OPTIONS } from '@/constants/priority';
import type { TodoPriority } from '@/types';

interface Props {
  value: TodoPriority;
  onChange: (priority: TodoPriority) => void;
  className?: string;
}

export function PrioritySelect({ value, onChange, className }: Props) {
  return <SegmentedControl label="Priority" options={PRIORITY_OPTIONS} value={value} onChange={onChange} className={className} />;
}
