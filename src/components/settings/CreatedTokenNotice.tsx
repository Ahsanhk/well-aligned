import { TriangleAlert } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { SETTINGS_COPY } from '@/constants/claude';
import type { CreatedApiToken } from '@/types';

export function CreatedTokenNotice({ token }: { token: CreatedApiToken }) {
  return (
    <div className="animate-fade-in flex flex-col gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3">
      <p className="flex items-start gap-2 text-[13px] text-warning">
        <TriangleAlert size={14} className="mt-0.5 shrink-0" />
        {SETTINGS_COPY.tokenOnceWarning}
      </p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-sunken px-3 py-2 font-mono text-[12px] text-fg" title={token.token}>
          {token.token}
        </code>
        <CopyButton text={token.token} label={SETTINGS_COPY.copyToken} variant="primary" />
      </div>
    </div>
  );
}
