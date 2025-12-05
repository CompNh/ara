import { forwardRef, type HTMLAttributes, type PropsWithChildren, type ReactNode, type RefObject } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";

import { mergeClassNames } from "../layout/shared.js";
import {
  usePositioner,
  type Placement,
  type PositionerArrowProps,
  type PositionStrategy
} from "./use-positioner.js";

export type PositionerProps = PropsWithChildren<{
  readonly anchorRef?: RefObject<HTMLElement | null>;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
  readonly withArrow?: boolean;
  readonly asChild?: boolean;
  readonly renderArrow?: (props: PositionerArrowProps) => ReactNode;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "className"> & { readonly className?: string };

export const Positioner = forwardRef<HTMLElement, PositionerProps>(function Positioner(props, forwardedRef) {
  const {
    children,
    anchorRef,
    placement,
    offset,
    strategy,
    withArrow = false,
    renderArrow,
    asChild = false,
    className,
    style: userStyle,
    ...restProps
  } = props;

  const { floatingProps, arrowProps } = usePositioner({
    anchorRef,
    placement,
    offset,
    strategy,
    withArrow: withArrow || Boolean(renderArrow)
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-positioner", className);
  const { ref: floatingRef, style: floatingStyle, ...restFloatingProps } = floatingProps;
  const composedRef = composeRefs<HTMLElement>(forwardedRef, floatingRef);

  return (
    <Component
      ref={composedRef}
      className={resolvedClassName}
      {...restFloatingProps}
      {...restProps}
      style={{ ...floatingStyle, ...(userStyle ?? {}) }}
    >
      {children}
      {arrowProps &&
        (renderArrow ? renderArrow(arrowProps) : <span {...arrowProps} className="ara-positioner__arrow" />)}
    </Component>
  );
});

export { usePositioner } from "./use-positioner.js";
export type { UsePositionerOptions, UsePositionerResult, PositionerArrowProps, PositionStrategy } from "./use-positioner.js";
