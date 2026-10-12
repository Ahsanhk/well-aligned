import { PageHeader } from '@/components/layout/PageHeader';
import { SETTINGS_COPY } from '@/constants/claude';
import { READABLE_WIDTH_CLASS } from '@/constants/layout';
import { cn } from '@/lib/cn';
import { ClaudeLinkSection } from './ClaudeLinkSection';

export function SettingsView() {
  return (
    <div className={cn('flex flex-col gap-6', READABLE_WIDTH_CLASS)}>
      <PageHeader title={SETTINGS_COPY.title} />
      <ClaudeLinkSection />
    </div>
  );
}
