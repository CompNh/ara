/**
 * Apply CSS variables to an element (default: <html>).
 * Only mutates DOM at runtime (SSR-safe check).
 */
export function applyTheme(
  vars: Record<string, string>,
  el?: HTMLElement | null,
) {
  if (typeof document === "undefined") return; // SSR-safe
  const target = el ?? document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    // enforce --ara-* prefix from caller; do not add here to keep pure
    target.style.setProperty(k, v);
  }
}
