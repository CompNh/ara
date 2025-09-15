//
// Ara Tokens — minimal skeleton (v0)
// Build/bundle은 Step 4(tsup)에서 처리합니다.
//

export const tokens = {
  color: {
    primary: '#7c3aed', // violet-600
    primaryFg: '#ffffff',
    neutral: '#6b7280', // gray-500
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
  },
  radius: {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '10px',
    full: '9999px',
  },
  motion: {
    duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  typography: {
    fontFamily: {
      sans: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', Roboto, 'Noto Sans KR', 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    fontSize: { sm: '12px', md: '14px', lg: '16px' },
    lineHeight: { sm: '18px', md: '20px', lg: '24px' },
  },
} as const;

export type TokenSchema = typeof tokens;

// (optional) 기본 내보내기 — 나중에 named-only로 바꾸고 싶으면 제거해도 됨
export default tokens;
