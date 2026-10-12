import { SETTINGS_COPY } from '@/constants/claude';

export function commandWithToken(command: string, token: string | null) {
  return token ? command.split(SETTINGS_COPY.tokenPlaceholder).join(token) : command;
}
