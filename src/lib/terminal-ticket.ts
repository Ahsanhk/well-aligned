import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ENV_FILE_NAME, TERMINAL_SECRET_BYTES, TERMINAL_SECRET_ENV } from '@/constants/claude-link';

export interface TerminalTicketPayload {
  userId: string;
  runId: string;
  cwd: string;
  promptFile: string;
  exp: number;
}

const SECRET_LINE = new RegExp(`^\\s*${TERMINAL_SECRET_ENV}\\s*=\\s*"?([^"\\s]+)"?\\s*$`, 'm');

function envFilePath(root: string): string {
  return path.join(root, ENV_FILE_NAME);
}

export function readTerminalSecret(root: string = process.cwd()): string | null {
  const fromEnv = process.env[TERMINAL_SECRET_ENV];
  if (fromEnv) return fromEnv;
  const file = envFilePath(root);
  if (!existsSync(file)) return null;
  return SECRET_LINE.exec(readFileSync(file, 'utf8'))?.[1] ?? null;
}

export function ensureTerminalSecret(root: string = process.cwd()): string {
  const existing = readTerminalSecret(root);
  if (existing) return existing;
  const secret = randomBytes(TERMINAL_SECRET_BYTES).toString('hex');
  const file = envFilePath(root);
  const prefix = existsSync(file) && !readFileSync(file, 'utf8').endsWith('\n') ? '\n' : '';
  appendFileSync(file, `${prefix}${TERMINAL_SECRET_ENV}=${secret}\n`, { mode: 0o600 });
  process.env[TERMINAL_SECRET_ENV] = secret;
  return secret;
}

function hmac(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function signTicket(payload: TerminalTicketPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(secret, body)}`;
}

function isPayload(value: unknown): value is TerminalTicketPayload {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.userId === 'string' &&
    typeof record.runId === 'string' &&
    typeof record.cwd === 'string' &&
    typeof record.promptFile === 'string' &&
    typeof record.exp === 'number'
  );
}

export function verifyTicket(ticket: string, secret: string, now: number = Date.now()): TerminalTicketPayload | null {
  const [body, signature, extra] = ticket.split('.');
  if (!body || !signature || extra !== undefined) return null;
  if (!safeEqual(signature, hmac(secret, body))) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!isPayload(payload) || payload.exp <= now) return null;
  return payload;
}

export function signAdminAction(action: string, secret: string): string {
  return hmac(secret, `admin:${action}`);
}

export function verifyAdminAction(action: string, signature: string | null | undefined, secret: string): boolean {
  return Boolean(signature) && safeEqual(signature ?? '', signAdminAction(action, secret));
}
