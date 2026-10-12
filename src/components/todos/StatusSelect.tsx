import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { STATUS_META, STATUS_OPTIONS } from '@/constants/status';
import type { TodoStatus } from '@/types';

interface Props {
  value: TodoStatus;
  onChange: (status: TodoStatus) => void;
}

const OPTIONS = STATUS_OPTIONS.map((status) => ({ value: status, label: STATUS_META[status].label }));

export function StatusSelect({ value, onChange }: Props) {
  return <SegmentedControl label="Status" options={OPTIONS} value={value} onChange={onChange} />;
}
