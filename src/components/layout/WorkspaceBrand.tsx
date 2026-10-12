'use client';

import { GREETING_COPY } from '@/constants/greeting';
import { useFirstName } from '@/hooks/useFirstName';
import { ownedLabel } from '@/lib/greeting';
import { BrandMark } from './BrandMark';

export function WorkspaceBrand() {
  const name = useFirstName();
  return <BrandMark label={ownedLabel(name, GREETING_COPY.workspaceSuffix, GREETING_COPY.workspaceFallback)} />;
}
