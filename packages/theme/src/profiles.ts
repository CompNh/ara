/**
 * Minimal demo profiles. Later we will wire real values from @ara/tokens.
 * Keep keys prefixed with --ara-*
 */
export type ThemeVars = Record<string, string>;

export const lightProfile: ThemeVars = {
  "--color-brand-primary": "#3b82f6",
  "--semantic-color-bg-default": "#ffffff",
  "--semantic-color-fg-default": "#0b1220",
};

export const darkProfile: ThemeVars = {
  "--color-brand-primary": "#3b82f6",
  "--semantic-color-bg-default": "#0b1220",
  "--semantic-color-fg-default": "#ffffff",
};
