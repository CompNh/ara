import { useId, useMemo, type CSSProperties } from "react";
import type { Theme } from "@ara/core";
import type { LayoutKey } from "@ara/tokens/layout";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export type Responsive<T> =
  | T
  | {
      base?: T;
      sm?: T;
      md?: T;
      lg?: T;
    };

export type ResponsiveMap<T> = { base: T; sm?: T; md?: T; lg?: T };

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type FlexWrap = false | "wrap" | "wrap-reverse";
export type SpaceScale = LayoutKey<"space">;

export function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

export function normalizeResponsiveValue<T>(value: Responsive<T> | undefined, fallback: T): ResponsiveMap<T> {
  if (
    value !== undefined &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("base" in value || "sm" in value || "md" in value || "lg" in value)
  ) {
    const responsiveValue = value as {
      base?: T;
      sm?: T;
      md?: T;
      lg?: T;
    };

    return {
      base: responsiveValue.base ?? fallback,
      sm: responsiveValue.sm,
      md: responsiveValue.md,
      lg: responsiveValue.lg
    };
  }

  return { base: (value ?? fallback) as T };
}

export function toCSSValue(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}` : value;
}

export function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function createRule(selector: string, styles: Partial<CSSProperties>): string {
  const declarations = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([property, value]) => `${toKebabCase(property)}:${toCSSValue(value)};`)
    .join("");

  if (!declarations) return "";

  return `${selector}{${declarations}}`;
}

export function mapAlign(value: FlexAlign): CSSProperties["alignItems"] {
  switch (value) {
    case "start":
      return "start";
    case "end":
      return "end";
    case "center":
      return "center";
    case "baseline":
      return "baseline";
    default:
      return "stretch";
  }
}

export function mapJustify(value: FlexJustify): CSSProperties["justifyContent"] {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "between":
      return "space-between";
    case "around":
      return "space-around";
    case "evenly":
      return "space-evenly";
    default:
      return "flex-start";
  }
}

export function mapWrap(value: FlexWrap): CSSProperties["flexWrap"] {
  return value === false ? "nowrap" : value;
}

export function resolveSpaceValue(value: SpaceScale | string | number, theme: Theme): string {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string") {
    const tokenValue = theme.layout.space[value as SpaceScale];
    return tokenValue ?? value;
  }

  return "0px";
}

export function useLayoutClassName(component: "stack" | "flex" | "grid"): string {
  const reactId = useId();

  return useMemo(() => {
    const sanitizedId = reactId.replace(/:/g, "-");
    return `ara-${component}-${sanitizedId}`;
  }, [component, reactId]);
}
