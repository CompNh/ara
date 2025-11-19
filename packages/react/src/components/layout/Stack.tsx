import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref
} from "react";
import type { Theme } from "@ara/core";
import type { LayoutKey } from "@ara/tokens/layout";
import { useAraTheme } from "../../theme/index.js";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

type Responsive<T> =
  | T
  | {
      base?: T;
      sm?: T;
      md?: T;
      lg?: T;
    };

type ResponsiveMap<T> = { base: T; sm?: T; md?: T; lg?: T };

type StackDirection = "row" | "row-reverse" | "column" | "column-reverse";
type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type StackWrap = false | "wrap" | "wrap-reverse";
type SpaceScale = LayoutKey<"space">;

interface StackOwnProps<T extends ElementType = "div"> {
  readonly as?: T;
  readonly direction?: Responsive<StackDirection>;
  readonly gap?: Responsive<SpaceScale | string | number>;
  readonly align?: Responsive<StackAlign>;
  readonly justify?: Responsive<StackJustify>;
  readonly wrap?: Responsive<StackWrap>;
  readonly divider?: ReactNode;
  readonly inline?: boolean;
  readonly children?: ReactNode;
}

export type StackProps<T extends ElementType = "div"> = StackOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof StackOwnProps<T> | "as">;

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

function normalizeResponsiveValue<T>(value: Responsive<T> | undefined, fallback: T): ResponsiveMap<T> {
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

function toCSSValue(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}` : value;
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function createRule(selector: string, styles: Partial<CSSProperties>): string {
  const declarations = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([property, value]) => `${toKebabCase(property)}:${toCSSValue(value)};`)
    .join("");

  if (!declarations) return "";

  return `${selector}{${declarations}}`;
}

function mapAlign(value: StackAlign): CSSProperties["alignItems"] {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "center":
      return "center";
    case "baseline":
      return "baseline";
    default:
      return "stretch";
  }
}

function mapJustify(value: StackJustify): CSSProperties["justifyContent"] {
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

function mapWrap(value: StackWrap): CSSProperties["flexWrap"] {
  return value === false ? "nowrap" : value;
}

function resolveSpaceValue(value: SpaceScale | string | number, theme: Theme): string {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string") {
    const tokenValue = theme.layout.space[value as SpaceScale];
    return tokenValue ?? value;
  }

  return "0px";
}

function cloneDividerNode(divider: ReactNode, index: number): ReactNode {
  if (isValidElement(divider)) {
    const element = divider as ReactElement;
    const key = element.key ?? `divider-${index}`;
    return cloneElement(element, { key });
  }

  return (
    <span aria-hidden key={`divider-${index}`}>
      {divider}
    </span>
  );
}

function withDividers(children: ReactNode, divider: ReactNode | undefined): ReactNode[] {
  const items = Children.toArray(children);
  if (!divider || items.length <= 1) return items;

  const spaced: ReactNode[] = [];
  items.forEach((child, index) => {
    spaced.push(child);
    if (index < items.length - 1) {
      spaced.push(cloneDividerNode(divider, index));
    }
  });

  return spaced;
}

function useStackClassName(): string {
  const reactId = useId();

  return useMemo(() => {
    const sanitizedId = reactId.replace(/:/g, "-");
    return `ara-stack-${sanitizedId}`;
  }, [reactId]);
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(props, ref: Ref<HTMLElement>) {
  const {
    as,
    direction: directionProp,
    gap: gapProp,
    align: alignProp,
    justify: justifyProp,
    wrap: wrapProp,
    divider,
    inline = false,
    className,
    children,
    ...restProps
  } = props;

  const Component = (as ?? "div") as ElementType;
  const theme = useAraTheme();
  const generatedClassName = useStackClassName();

  const direction = useMemo(
    () => normalizeResponsiveValue<StackDirection>(directionProp, "column"),
    [directionProp]
  );
  const gap = useMemo(
    () => normalizeResponsiveValue<SpaceScale | string | number>(gapProp, 0),
    [gapProp]
  );
  const align = useMemo(
    () => normalizeResponsiveValue<StackAlign>(alignProp, "stretch"),
    [alignProp]
  );
  const justify = useMemo(
    () => normalizeResponsiveValue<StackJustify>(justifyProp, "start"),
    [justifyProp]
  );
  const wrap = useMemo(
    () => normalizeResponsiveValue<StackWrap>(wrapProp, false),
    [wrapProp]
  );

  const resolvedClassName = mergeClassNames("ara-stack", generatedClassName, className);

  const baseStyles = useMemo<Partial<CSSProperties>>(
    () => ({
      display: inline ? "inline-flex" : "flex",
      boxSizing: "border-box",
      flexDirection: direction.base,
      gap: resolveSpaceValue(gap.base, theme),
      alignItems: mapAlign(align.base),
      justifyContent: mapJustify(justify.base),
      flexWrap: mapWrap(wrap.base)
    }),
    [align.base, direction.base, gap.base, inline, justify.base, theme, wrap.base]
  );

  const responsiveRules = useMemo(
    () =>
      (Object.keys(BREAKPOINTS) as Breakpoint[]).map((breakpoint) => {
        const styles: Partial<CSSProperties> = {
          flexDirection: direction[breakpoint],
          gap:
            gap[breakpoint] !== undefined
              ? resolveSpaceValue(gap[breakpoint] as SpaceScale | string | number, theme)
              : undefined,
          alignItems: align[breakpoint] ? mapAlign(align[breakpoint] as StackAlign) : undefined,
          justifyContent: justify[breakpoint] ? mapJustify(justify[breakpoint] as StackJustify) : undefined,
          flexWrap: wrap[breakpoint] !== undefined ? mapWrap(wrap[breakpoint] as StackWrap) : undefined
        };

        const rule = createRule(`.${generatedClassName}`, styles);
        if (!rule) return "";

        return `@media (min-width: ${BREAKPOINTS[breakpoint]}px){${rule}}`;
      }),
    [align, direction, gap, generatedClassName, justify, theme, wrap]
  );

  const cssText = useMemo(
    () => [createRule(`.${generatedClassName}`, baseStyles), ...responsiveRules].filter(Boolean).join(""),
    [baseStyles, generatedClassName, responsiveRules]
  );

  const content = withDividers(children, divider);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <Component ref={ref} className={resolvedClassName} {...restProps}>
        {content}
      </Component>
    </>
  );
});

Stack.displayName = "Stack";
