const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function newId(): string {
  return crypto.randomUUID();
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function nowIso(): string {
  return new Date().toISOString();
}
