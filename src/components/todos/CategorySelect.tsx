import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CATEGORY_META, CATEGORY_ORDER } from '@/constants/backlog';
import { cn } from '@/lib/cn';
import type { TodoCategory } from '@/types';

interface Props {
  value: TodoCategory;
  onChange: (category: TodoCategory) => void;
  className?: string;
}

const OPTIONS = CATEGORY_ORDER.map((category) => {
  const { label, icon: Icon, className } = CATEGORY_META[category];
  return { value: category, label, icon: <Icon size={12} className={cn('shrink-0', className)} /> };
});

export function CategorySelect({ value, onChange, className }: Props) {
  return <SegmentedControl label="Category" options={OPTIONS} value={value} onChange={onChange} className={className} />;
}
