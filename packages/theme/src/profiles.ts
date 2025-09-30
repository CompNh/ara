/**
 * Minimal demo profiles. Later we will wire real values from @ara/tokens.
 * Keep keys aligned with variables.css names.
 */
export type ThemeVars = Record<string, string>;

/** Base color profiles */
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

/** Density profiles (space scale) */
export const densityCompact: ThemeVars = {
  "--space-xs": "3px",
  "--space-sm": "6px",
};

export const densityComfortable: ThemeVars = {
  "--space-xs": "5px",
  "--space-sm": "10px",
};

/** Radius profiles */
export const radiusSharp: ThemeVars = {
  "--radius-sm": "0px",
  "--radius-md": "4px",
};

export const radiusSoft: ThemeVars = {
  "--radius-sm": "4px",
  "--radius-md": "12px",
};
