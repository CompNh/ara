import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref
} from "react";
import { useAraTheme } from "../../theme/index.js";
import {
  BREAKPOINTS,
  type Breakpoint,
  type FlexAlign,
  type FlexDirection,
  type FlexOrientation,
  type FlexJustify,
  type FlexWrap,
  type Responsive,
  type SpaceScale,
  createRule,
  mapAlign,
  mapJustify,
  mapWrap,
  mergeClassNames,
  normalizeDirection,
  normalizeResponsiveValue,
  resolveSpaceValue,
  useLayoutClassName
} from "./shared.js";

type StackDirection = FlexDirection;
type StackAlign = FlexAlign;
type StackJustify = FlexJustify;
type StackWrap = FlexWrap;

interface StackOwnProps<T extends ElementType = "div"> {
  readonly as?: T;
  readonly direction?: Responsive<StackDirection>;
  readonly orientation?: Responsive<FlexOrientation>;
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

function cloneDividerNode(divider: ReactNode, index: number): ReactNode {
  if (isValidElement(divider)) {
    const element = divider as ReactElement;
    const key = element.key ?? `divider-${index}`;
    return cloneElement(element, {
      key,
      role: element.props.role ?? "presentation",
      tabIndex: element.props.tabIndex ?? -1,
      "aria-hidden": element.props["aria-hidden"] ?? true
    });
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

interface StackComponent {
  <T extends ElementType = "div">(props: StackProps<T> & { ref?: Ref<HTMLElement> }): JSX.Element;
  displayName?: string;
}

export const Stack = forwardRef(function Stack<T extends ElementType = "div">(
  props: StackProps<T>,
  ref: Ref<HTMLElement>
) {
  const {
    as,
    direction: directionProp,
    orientation: orientationProp,
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
  const generatedClassName = useLayoutClassName("stack");

  const direction = useMemo(
    () => normalizeDirection(directionProp, orientationProp, "column", "vertical"),
    [directionProp, orientationProp]
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
          justifyContent: justify[breakpoint]
            ? mapJustify(justify[breakpoint] as StackJustify)
            : undefined,
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
}) as StackComponent;

Stack.displayName = "Stack";
