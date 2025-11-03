import { tokens } from "@ara/tokens";

// 전체 토큰 구조를 테마로 사용
export type Theme = typeof tokens;

// 자바스크립트 원시 타입
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

// 리터럴 타입이면 widen(넓히기): 'red' → string, 42 → number
type WidenIfLiteral<T> = T extends Primitive
  ? T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T
  : T;

// 재귀적으로 Partial 적용 (readonly 해제 + 깊은 병합 가능 형태)
export type DeepPartial<T> = {
  -readonly [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : WidenIfLiteral<T[K]>;
};

// 사용자 정의 테마 오버라이드 타입
export type ThemeOverrides = DeepPartial<Theme>;

// 단순 객체 판별 유틸
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

// 값 복제 유틸 (깊은 clone)
function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    // 배열이면 재귀 복제
    return value.map((item) => cloneValue(item)) as unknown as T;
  }

  if (isPlainObject(value)) {
    // 객체면 모든 key 순회 후 재귀 복제
    return Object.keys(value).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = cloneValue((value as Record<string, unknown>)[key]);
      return acc;
    }, {}) as T;
  }

  // 원시값은 그대로 반환
  return value;
}

// base + override를 재귀 병합하는 함수
function mergeObjects<T extends Record<string, unknown>>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) {
    // override 없으면 복제 후 반환
    return cloneValue(base);
  }

  const result: Record<string, unknown> = {};

  // base 키를 기준으로 병합
  for (const key of Object.keys(base) as (keyof T)[]) {
    const baseValue = base[key];
    const overrideValue = override[key];

    if (overrideValue === undefined) {
      // override가 없으면 base값 유지
      result[key as string] = cloneValue(baseValue);
      continue;
    }

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      // 둘 다 객체면 재귀 병합
      result[key as string] = mergeObjects(
        baseValue as Record<string, unknown>,
        overrideValue as DeepPartial<Record<string, unknown>>
      );
      continue;
    }

    // 그 외엔 override 우선 적용
    result[key as string] = cloneValue(overrideValue as T[keyof T]);
  }

  // base에 없는 키는 override에서 추가
  for (const key of Object.keys(override)) {
    if ((base as Record<string, unknown>)[key] === undefined) {
      result[key] = cloneValue(override[key] as T[keyof T]);
    }
  }

  return result as T;
}

// 객체를 깊게 freeze (불변화)
function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((item) => deepFreeze(item));
    return Object.freeze(value) as unknown as T;
  }

  if (isPlainObject(value)) {
    Object.values(value).forEach((item) => {
      deepFreeze(item);
    });
    return Object.freeze(value) as T;
  }

  // 원시값은 그대로 반환
  return value;
}

// 사용자 오버라이드 테마 생성 (기본 tokens 병합)
export function createTheme(overrides: ThemeOverrides = {}): Theme {
  return mergeObjects(tokens, overrides);
}

// 완전 불변화된 기본 테마 객체
export const defaultTheme = deepFreeze(createTheme());
