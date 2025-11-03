// ✍️ 프로젝트 전역 타이포그래피(글꼴) 토큰 정의
export const typography = {
  // 사용 폰트 패밀리: 기본(sans), 코드용(mono)
  fontFamily: {
    sans: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono:
      "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },

  // 글자 크기 스케일 (rem 단위)
  fontSize: {
    xs: "0.75rem",   // 12px
    sm: "0.875rem",  // 14px
    md: "1rem",      // 16px
    lg: "1.25rem",   // 20px
    xl: "1.5rem"     // 24px
  },

  // 줄 높이(line-height) 스케일
  lineHeight: {
    tight: "1.25",   // 조밀한 행간
    normal: "1.5",   // 일반 행간
    relaxed: "1.75"  // 넉넉한 행간
  },

  // 글자 굵기(weight)
  fontWeight: {
    regular: 400, // 기본
    medium: 500,  // 중간(버튼, 헤드라인 등)
    bold: 700     // 굵게
  },

  // 자간(letter-spacing)
  letterSpacing: {
    tighter: "-0.01em", // 약간 좁힘
    normal: "0",
    wider: "0.05em"     // 넓힘
  }
} as const; // as const → 리터럴 고정 (readonly, 타입 추론 강화)

// 전체 타이포그래피 토큰 타입
export type TypographyTokens = typeof typography;

// 카테고리명 (fontFamily | fontSize | lineHeight | fontWeight | letterSpacing)
export type TypographyCategory = keyof TypographyTokens;

// 특정 카테고리 내의 스케일(세부 단위) 타입
export type TypographyScale<
  TCategory extends TypographyCategory = TypographyCategory
> = TypographyTokens[TCategory];

// 특정 카테고리에서의 키 이름 (예: "sm" | "md" | "lg" 등)
export type TypographyKey<
  TCategory extends TypographyCategory = TypographyCategory
> = keyof TypographyTokens[TCategory];

// 특정 카테고리·키에 해당하는 값을 타입 안전하게 반환
export function getTypographyValue<
  C extends TypographyCategory,
  K extends TypographyKey<C>
>(category: C, key: K): TypographyTokens[C][K] {
  return typography[category][key];
  // 예: getTypographyValue("fontSize", "lg") → "1.25rem"
}
