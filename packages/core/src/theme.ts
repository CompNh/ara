import { tokens } from "@ara/tokens";

export type Theme = typeof tokens;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

export type ThemeOverrides = DeepPartial<Theme>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as unknown as T;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = cloneValue((value as Record<string, unknown>)[key]);
      return acc;
    }, {}) as T;
  }

  return value;
}

function mergeObjects<T extends Record<string, unknown>>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) {
    return cloneValue(base);
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(base) as (keyof T)[]) {
    const baseValue = base[key];
    const overrideValue = override[key];

    if (overrideValue === undefined) {
      result[key as string] = cloneValue(baseValue);
      continue;
    }

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key as string] = mergeObjects(
        baseValue as Record<string, unknown>,
        overrideValue as DeepPartial<Record<string, unknown>>
      );
      continue;
    }

    result[key as string] = overrideValue as unknown;
  }

  for (const key of Object.keys(override)) {
    if ((base as Record<string, unknown>)[key] === undefined) {
      result[key] = override[key];
    }
  }

  return result as T;
}

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

  return value;
}

export function createTheme(overrides: ThemeOverrides = {}): Theme {
  return mergeObjects(tokens, overrides);
}

export const defaultTheme = deepFreeze(createTheme());
