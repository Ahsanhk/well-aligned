import 'server-only';
import { LOCAL_HOSTNAMES } from '@/constants/system';

function hostnameOf(host: string) {
  if (host.startsWith('[')) return host.slice(0, host.indexOf(']') + 1);
  return host.split(':')[0];
}

function isLocalHost(host: string) {
  return LOCAL_HOSTNAMES.includes(hostnameOf(host.toLowerCase()));
}

function isLocalOrigin(origin: string | null) {
  if (!origin) return true;
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

export function isLocalRequest(request: Request) {
  const host = request.headers.get('host');
  return host !== null && isLocalHost(host) && isLocalOrigin(request.headers.get('origin'));
}
