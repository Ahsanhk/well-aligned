import { TERMINAL_THEME_VARS } from '@/constants/claude';

type ThemeKey = keyof typeof TERMINAL_THEME_VARS;

export function readTerminalTheme(): Partial<Record<ThemeKey, string>> {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(TERMINAL_THEME_VARS).map(([key, variable]) => [key, styles.getPropertyValue(variable).trim()]),
  ) as Partial<Record<ThemeKey, string>>;
}
