import { forwardRef, useMemo, type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type Ref } from "react";

import { useAraTheme } from "../../theme/index.js";
import { mergeClassNames, resolveSpaceValue, type SpaceScale } from "../layout/shared.js";

interface SpacerOwnProps<T extends ElementType = "div"> {
  readonly as?: T;
  readonly size: SpaceScale | string | number;
  readonly direction?: "inline" | "block";
  readonly inline?: boolean;
  readonly shrink?: boolean;
  readonly grow?: boolean;
}

export type SpacerProps<T extends ElementType = "div"> = SpacerOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SpacerOwnProps<T> | "as">;

export const Spacer = forwardRef<HTMLElement, SpacerProps>(function Spacer(props, ref: Ref<HTMLElement>) {
  const {
    as,
    size,
    direction = "block",
    inline = false,
    shrink = true,
    grow = false,
    className,
    style,
    ...restProps
  } = props;

  const Component = (as ?? "div") as ElementType;
  const theme = useAraTheme();

  const resolvedSize = useMemo(() => resolveSpaceValue(size, theme), [size, theme]);

  const dimensionStyles = useMemo<Partial<CSSProperties>>(
    () =>
      direction === "inline"
        ? { inlineSize: resolvedSize, width: resolvedSize }
        : { blockSize: resolvedSize, height: resolvedSize },
    [direction, resolvedSize]
  );

  const resolvedStyle = useMemo<CSSProperties>(
    () => ({
      display: inline ? "inline-block" : "block",
      flexShrink: shrink ? 1 : 0,
      flexGrow: grow ? 1 : 0,
      ...dimensionStyles,
      ...(style ?? {})
    }),
    [dimensionStyles, grow, inline, shrink, style]
  );

  const resolvedClassName = mergeClassNames("ara-spacer", className);

  return <Component ref={ref} className={resolvedClassName} style={resolvedStyle} aria-hidden {...restProps} />;
});

Spacer.displayName = "Spacer";
