import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref
} from "react";
import { useAraTheme } from "../../theme/index.js";
import {
  BREAKPOINTS,
  type Breakpoint,
  type FlexAlign,
  type FlexDirection,
  type FlexJustify,
  type FlexWrap,
  type Responsive,
  type SpaceScale,
  createRule,
  mapAlign,
  mapJustify,
  mapWrap,
  mergeClassNames,
  normalizeResponsiveValue,
  resolveSpaceValue,
  useLayoutClassName
} from "./shared.js";

interface FlexOwnProps<T extends ElementType = "div"> {
  readonly as?: T;
  readonly direction?: Responsive<FlexDirection>;
  readonly gap?: Responsive<SpaceScale | string | number>;
  readonly align?: Responsive<FlexAlign>;
  readonly justify?: Responsive<FlexJustify>;
  readonly wrap?: Responsive<FlexWrap>;
  readonly inline?: boolean;
  readonly children?: ReactNode;
}

export type FlexProps<T extends ElementType = "div"> = FlexOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof FlexOwnProps<T> | "as">;

interface FlexComponent {
  <T extends ElementType = "div">(props: FlexProps<T> & { ref?: Ref<HTMLElement> }): JSX.Element;
  displayName?: string;
}

export const Flex = forwardRef(function Flex<T extends ElementType = "div">(
  props: FlexProps<T>,
  ref: Ref<HTMLElement>
) {
  const {
    as,
    direction: directionProp,
    gap: gapProp,
    align: alignProp,
    justify: justifyProp,
    wrap: wrapProp,
    inline = false,
    className,
    children,
    ...restProps
  } = props;

  const Component = (as ?? "div") as ElementType;
  const theme = useAraTheme();
  const generatedClassName = useLayoutClassName("flex");

  const direction = useMemo(
    () => normalizeResponsiveValue<FlexDirection>(directionProp, "row"),
    [directionProp]
  );
  const gap = useMemo(
    () => normalizeResponsiveValue<SpaceScale | string | number>(gapProp, 0),
    [gapProp]
  );
  const align = useMemo(
    () => normalizeResponsiveValue<FlexAlign>(alignProp, "stretch"),
    [alignProp]
  );
  const justify = useMemo(
    () => normalizeResponsiveValue<FlexJustify>(justifyProp, "start"),
    [justifyProp]
  );
  const wrap = useMemo(
    () => normalizeResponsiveValue<FlexWrap>(wrapProp, false),
    [wrapProp]
  );

  const resolvedClassName = mergeClassNames("ara-flex", generatedClassName, className);

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
          alignItems: align[breakpoint] ? mapAlign(align[breakpoint] as FlexAlign) : undefined,
          justifyContent: justify[breakpoint]
            ? mapJustify(justify[breakpoint] as FlexJustify)
            : undefined,
          flexWrap: wrap[breakpoint] !== undefined ? mapWrap(wrap[breakpoint] as FlexWrap) : undefined
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <Component ref={ref} className={resolvedClassName} {...restProps}>
        {children}
      </Component>
    </>
  );
}) as FlexComponent;

Flex.displayName = "Flex";
