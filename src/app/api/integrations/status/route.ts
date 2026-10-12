import { MCP_ADD_COMMAND } from '@/constants/claude-link';
import { withSession } from '@/lib/api-session';
import { isClaudeCliAvailable } from '@/lib/claude-cli';
import { isTerminalServerOnline } from '@/lib/terminal-client';
import type { IntegrationStatus } from '@/types';

export const runtime = 'nodejs';

export const GET = withSession(async () => {
  const [claudeCliFound, terminalServerOnline] = await Promise.all([isClaudeCliAvailable(), isTerminalServerOnline()]);
  return Response.json({ mcpAddCommand: MCP_ADD_COMMAND, claudeCliFound, terminalServerOnline } satisfies IntegrationStatus);
});
