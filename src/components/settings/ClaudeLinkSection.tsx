'use client';

import { Bot, ShieldCheck } from 'lucide-react';
import { CliInstallNotice } from '@/components/claude/CliInstallNotice';
import { Card } from '@/components/ui/Card';
import { SETTINGS_COPY } from '@/constants/claude';
import { useClaudeLink } from '@/hooks/useClaudeLink';
import { commandWithToken } from '@/lib/mcp-command';
import { SettingsSection } from './SettingsSection';
import { SetupSteps } from './SetupSteps';
import { StatusCheck } from './StatusCheck';
import { TokenManager } from './TokenManager';

export function ClaudeLinkSection() {
  const link = useClaudeLink();
  const command = link.status ? commandWithToken(link.status.mcpAddCommand, link.created?.token ?? null) : null;

  return (
    <Card className="flex flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet/30 bg-violet/10 text-violet">
          <Bot size={17} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">{SETTINGS_COPY.claudeLink}</h2>
          <p className="mt-0.5 text-sm text-muted">{SETTINGS_COPY.claudeLinkDescription}</p>
        </div>
      </header>
      <SettingsSection title={SETTINGS_COPY.checks}>
        {link.statusError ? (
          <p className="text-sm text-danger">{link.statusError}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            <StatusCheck ok={Boolean(link.status?.claudeCliFound)} okLabel={SETTINGS_COPY.cliFound} failLabel={SETTINGS_COPY.cliMissing} />
            <StatusCheck
              ok={Boolean(link.status?.terminalServerOnline)}
              okLabel={SETTINGS_COPY.terminalOnline}
              failLabel={SETTINGS_COPY.terminalOffline}
            />
          </ul>
        )}
        {link.status && !link.status.claudeCliFound && (
          <CliInstallNotice isChecking={link.isCheckingStatus} onCheck={() => void link.reloadStatus()} />
        )}
      </SettingsSection>
      <SettingsSection title={SETTINGS_COPY.tokens}>
        <TokenManager
          tokens={link.tokens}
          isLoaded={link.tokensLoaded}
          created={link.created}
          isCreating={link.isCreating}
          onCreate={link.createToken}
          onRevoke={(tokenId) => void link.revokeToken(tokenId)}
        />
      </SettingsSection>
      <SettingsSection title={SETTINGS_COPY.setup}>
        <SetupSteps command={command} hasToken={Boolean(link.created)} />
      </SettingsSection>
      <p className="flex items-start gap-2 border-t border-line pt-4 text-xs leading-relaxed text-subtle">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
        {SETTINGS_COPY.privacy}
      </p>
    </Card>
  );
}
