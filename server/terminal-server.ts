import { existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import type { Duplex } from 'node:stream';
import { spawn, type IPty } from 'node-pty';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';
import {
  RUN_PROMPT_FILE_PATTERN,
  RUNS_DIR_NAME,
  TERMINAL_ALLOWED_ORIGINS,
  TERMINAL_CLI_MISSING_MESSAGE,
  TERMINAL_DEFAULT_COLS,
  TERMINAL_DEFAULT_ROWS,
  TERMINAL_DEFAULT_SHELL,
  TERMINAL_HEALTH_PATH,
  TERMINAL_HOST,
  TERMINAL_IDLE_KILL_MS,
  TERMINAL_IDLE_SWEEP_MS,
  TERMINAL_MAX_COLS,
  TERMINAL_MAX_ROWS,
  TERMINAL_PORT,
  TERMINAL_SCROLLBACK_BYTES,
  TERMINAL_SCRUBBED_ENV_PATTERN,
  TERMINAL_SESSIONS_PATH,
  TERMINAL_SIGNATURE_HEADER,
  TERMINAL_WS_PATH,
} from '@/constants/claude-link';
import { DATA_DIR_NAME } from '@/constants/storage';
import { readTerminalSecret, verifyAdminAction, verifyTicket, type TerminalTicketPayload } from '@/lib/terminal-ticket';

interface Session {
  runId: string;
  userId: string;
  pty: IPty;
  scrollback: string;
  clients: Set<WebSocket>;
  lastActivity: number;
}

const APP_ROOT = process.cwd();
const RUNS_DIR = path.join(APP_ROOT, DATA_DIR_NAME, RUNS_DIR_NAME);
const PORT = Number(process.env.TERMINAL_PORT_OVERRIDE) || TERMINAL_PORT;
const sessions = new Map<string, Session>();

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function startupCommand(promptFile: string): string {
  const launch = `claude "$(cat ${shellQuote(path.resolve(promptFile))})"`;
  return `if command -v claude >/dev/null 2>&1; then ${launch}; else printf ${shellQuote(TERMINAL_CLI_MISSING_MESSAGE)}; fi\r`;
}

function isSafePromptFile(file: string): boolean {
  const resolved = path.resolve(file);
  return path.dirname(resolved) === RUNS_DIR && RUN_PROMPT_FILE_PATTERN.test(path.basename(resolved)) && existsSync(resolved);
}

function isDirectory(target: string): boolean {
  try {
    return statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function shellEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !TERMINAL_SCRUBBED_ENV_PATTERN.test(key)) env[key] = value;
  }
  return { ...env, TERM: 'xterm-256color', COLORTERM: 'truecolor' };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function appendScrollback(session: Session, data: string) {
  session.scrollback += data;
  if (session.scrollback.length > TERMINAL_SCROLLBACK_BYTES) session.scrollback = session.scrollback.slice(-TERMINAL_SCROLLBACK_BYTES);
}

function endSession(runId: string) {
  const session = sessions.get(runId);
  if (!session) return;
  sessions.delete(runId);
  session.clients.forEach((client) => client.close(1000, 'session ended'));
  try {
    session.pty.kill();
  } catch {}
}

function createSession(ticket: TerminalTicketPayload): Session {
  const shell = process.env.SHELL || TERMINAL_DEFAULT_SHELL;
  const pty = spawn(shell, ['-l'], {
    name: 'xterm-256color',
    cols: TERMINAL_DEFAULT_COLS,
    rows: TERMINAL_DEFAULT_ROWS,
    cwd: ticket.cwd,
    env: shellEnv(),
  });
  const session: Session = { runId: ticket.runId, userId: ticket.userId, pty, scrollback: '', clients: new Set(), lastActivity: Date.now() };
  pty.onData((data) => {
    session.lastActivity = Date.now();
    appendScrollback(session, data);
    session.clients.forEach((client) => client.send(data));
  });
  pty.onExit(() => {
    if (sessions.get(session.runId) === session) endSession(session.runId);
  });
  pty.write(startupCommand(ticket.promptFile));
  sessions.set(ticket.runId, session);
  return session;
}

function handleMessage(session: Session, raw: RawData, isBinary: boolean) {
  session.lastActivity = Date.now();
  const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : Array.isArray(raw) ? Buffer.concat(raw).toString('utf8') : Buffer.from(raw).toString('utf8');
  if (!isBinary && text.startsWith('{')) {
    try {
      const message = JSON.parse(text) as { type?: unknown; cols?: unknown; rows?: unknown };
      if (message.type === 'resize') {
        session.pty.resize(
          clamp(message.cols, 2, TERMINAL_MAX_COLS, TERMINAL_DEFAULT_COLS),
          clamp(message.rows, 1, TERMINAL_MAX_ROWS, TERMINAL_DEFAULT_ROWS),
        );
        return;
      }
    } catch {}
  }
  session.pty.write(text);
}

function attach(ws: WebSocket, ticket: TerminalTicketPayload) {
  const existing = sessions.get(ticket.runId);
  if (existing && existing.userId !== ticket.userId) {
    ws.close(1008, 'forbidden');
    return;
  }
  const session = existing ?? createSession(ticket);
  if (existing && session.scrollback) ws.send(session.scrollback);
  session.clients.add(ws);
  ws.on('message', (raw, isBinary) => handleMessage(session, raw, isBinary));
  ws.on('close', () => {
    session.clients.delete(ws);
    session.lastActivity = Date.now();
  });
}

function reject(socket: Duplex, status: number, message: string) {
  socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function handleHttp(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? '/', `http://${TERMINAL_HOST}`);
  if (request.method === 'GET' && url.pathname === TERMINAL_HEALTH_PATH) return json(response, 200, { ok: true });
  const secret = readTerminalSecret(APP_ROOT);
  const signature = request.headers[TERMINAL_SIGNATURE_HEADER];
  const signatureValue = Array.isArray(signature) ? signature[0] : signature;
  if (request.method === 'GET' && url.pathname === TERMINAL_SESSIONS_PATH) {
    if (!secret || !verifyAdminAction('list', signatureValue, secret)) return json(response, 403, { error: 'forbidden' });
    return json(response, 200, { runIds: [...sessions.keys()] });
  }
  const kill = new RegExp(`^${TERMINAL_SESSIONS_PATH}/([0-9a-f-]{36})/kill$`).exec(url.pathname);
  if (request.method === 'POST' && kill?.[1]) {
    if (!secret || !verifyAdminAction(`kill:${kill[1]}`, signatureValue, secret)) return json(response, 403, { error: 'forbidden' });
    endSession(kill[1]);
    return json(response, 200, { ok: true });
  }
  return json(response, 404, { error: 'not found' });
}

function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('The terminal server only runs in local development.');
    process.exit(1);
  }
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });
  const server = createServer(handleHttp);
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url ?? '/', `http://${TERMINAL_HOST}`);
    if (url.pathname !== TERMINAL_WS_PATH) return reject(socket, 404, 'Not Found');
    if (!TERMINAL_ALLOWED_ORIGINS.includes(request.headers.origin ?? '')) return reject(socket, 403, 'Forbidden');
    const secret = readTerminalSecret(APP_ROOT);
    const ticket = secret ? verifyTicket(url.searchParams.get('ticket') ?? '', secret) : null;
    if (!ticket) return reject(socket, 401, 'Unauthorized');
    if (!isSafePromptFile(ticket.promptFile) || !isDirectory(ticket.cwd)) return reject(socket, 400, 'Bad Request');
    wss.handleUpgrade(request, socket, head, (ws) => attach(ws, ticket));
  });
  setInterval(() => {
    const now = Date.now();
    for (const session of sessions.values()) {
      if (session.clients.size === 0 && now - session.lastActivity > TERMINAL_IDLE_KILL_MS) endSession(session.runId);
    }
  }, TERMINAL_IDLE_SWEEP_MS).unref();
  const shutdown = () => {
    [...sessions.keys()].forEach(endSession);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  server.listen(PORT, TERMINAL_HOST, () => console.log(`Terminal server listening on http://${TERMINAL_HOST}:${PORT}`));
}

main();
