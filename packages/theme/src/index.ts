import { lightProfile, darkProfile } from "./profiles";
export type { ThemeVars } from "./profiles";
export { applyTheme } from "./applyTheme";

/** Convenience helpers */
export function mountLightTheme(el?: HTMLElement | null) {
  return import("./applyTheme").then((m) => m.applyTheme(lightProfile, el));
}
export function mountDarkTheme(el?: HTMLElement | null) {
  return import("./applyTheme").then((m) => m.applyTheme(darkProfile, el));
}
