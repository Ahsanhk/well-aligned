import type { Metadata } from 'next';
import { SettingsView } from '@/components/settings/SettingsView';
import { SETTINGS_COPY } from '@/constants/claude';

export const metadata: Metadata = { title: SETTINGS_COPY.title };

export default function SettingsPage() {
  return <SettingsView />;
}
