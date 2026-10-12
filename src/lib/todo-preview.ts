const QUOTE_TIMESTAMP_PATTERN = /^>\s*Client said \((\d{1,2}:\d{2}(?::\d{2})?)\)/m;

export function detailsPreview(details: string) {
  return details
    .split('\n')
    .filter((line) => !line.trim().startsWith('>'))
    .join(' ')
    .replace(/`{1,3}/g, '')
    .replace(/(^|\s)[#*-]+\s+/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/\.{2,}/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

export function quoteTimestamp(details: string) {
  return details.match(QUOTE_TIMESTAMP_PATTERN)?.[1] ?? null;
}
