//
// Ara Theme — minimal skeleton (v0)
//
import type { TokenSchema } from '@ara/tokens';

export type ThemeVars = Record<string, string>;

/** tokens → CSS 변수 맵 */
export function getThemeVars(tokens: TokenSchema): ThemeVars {
  return {
    '--ara-color-primary': tokens.color.primary,
    '--ara-color-primary-fg': tokens.color.primaryFg,
    '--ara-color-neutral': tokens.color.neutral,

    '--ara-radius-sm': tokens.radius.sm,
    '--ara-radius-md': tokens.radius.md,
    '--ara-radius-lg': tokens.radius.lg,

    '--ara-space-1': tokens.spacing[1],
    '--ara-space-2': tokens.spacing[2],
    '--ara-space-3': tokens.spacing[3],
    '--ara-space-4': tokens.spacing[4],
  };
}

/** DOM에 CSS 변수 주입 (SSR 비사용; 3-2는 브라우저 전제) */
export function mountLightTheme(tokens: TokenSchema, root: HTMLElement = document.documentElement) {
  const vars = getThemeVars(tokens);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.dataset.araTheme = 'light';
}

/** 다크 테마(임시: 라이트와 동일, 3-2에서는 토큰 오버레이 없음) */
export function mountDarkTheme(tokens: TokenSchema, root: HTMLElement = document.documentElement) {
  mountLightTheme(tokens, root);
  root.dataset.araTheme = 'dark';
}

export default {
  getThemeVars,
  mountLightTheme,
  mountDarkTheme,
};
