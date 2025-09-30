import {
  lightProfile,
  darkProfile,
  densityCompact,
  densityComfortable,
  radiusSharp,
  radiusSoft,
  type ThemeVars,
} from "./profiles";
export type { ThemeVars } from "./profiles";
export { applyTheme } from "./applyTheme";

/** Merge any number of ThemeVars objects (right-most wins) */
export function composeTheme(...profiles: ThemeVars[]): ThemeVars {
  return Object.assign({}, ...profiles);
}

/** Convenience helpers */
export function mountLightTheme(el?: HTMLElement | null) {
  return import("./applyTheme").then((m) => m.applyTheme(lightProfile, el));
}
export function mountDarkTheme(el?: HTMLElement | null) {
  return import("./applyTheme").then((m) => m.applyTheme(darkProfile, el));
}

/** Re-exports for consumers */
export {
  lightProfile,
  darkProfile,
  densityCompact,
  densityComfortable,
  radiusSharp,
  radiusSoft,
};
