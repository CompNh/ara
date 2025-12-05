import { forwardRef, type HTMLAttributes, type PropsWithChildren, useCallback } from "react";
import { Slot } from "@radix-ui/react-slot";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useDismissableLayer, type DismissableLayerEvent } from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";

type DismissReason = "escape" | "pointer" | "focus";

type DismissableLayerOptions = {
  readonly disableOutsidePointerEvents?: boolean;
  readonly active?: boolean;
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => void;
  readonly onPointerDownOutside?: (event: PointerEvent) => void;
  readonly onFocusOutside?: (event: FocusEvent) => void;
  readonly onDismiss?: (reason: DismissReason) => void;
  readonly asChild?: boolean;
};

export type DismissableLayerProps = PropsWithChildren<DismissableLayerOptions> &
  Omit<HTMLAttributes<HTMLElement>, keyof DismissableLayerOptions | "children">;

function mapDismissReason(event: DismissableLayerEvent): DismissReason {
  switch (event.type) {
    case "escape-key":
      return "escape";
    case "focus-outside":
      return "focus";
    case "pointer-down-outside":
    default:
      return "pointer";
  }
}

export const DismissableLayer = forwardRef<HTMLElement, DismissableLayerProps>(function DismissableLayer(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    disableOutsidePointerEvents = false,
    active,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onDismiss,
    className,
    ...restProps
  } = props;

  const handleDismiss = useCallback(
    (event: DismissableLayerEvent) => {
      onDismiss?.(mapDismissReason(event));
    },
    [onDismiss]
  );

  const handlePointerDownOutside = useCallback(
    (event: PointerEvent) => {
      if (disableOutsidePointerEvents && !event.defaultPrevented) {
        event.preventDefault();
      }

      onPointerDownOutside?.(event);
    },
    [disableOutsidePointerEvents, onPointerDownOutside]
  );

  const { containerProps } = useDismissableLayer({
    active,
    onDismiss: handleDismiss,
    onEscapeKeyDown,
    onPointerDownOutside: handlePointerDownOutside,
    onFocusOutside
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-dismissable-layer", className);
  const composedRef = composeRefs<HTMLElement>(forwardedRef, containerProps.ref);

  return (
    <Component ref={composedRef} className={resolvedClassName} data-ara-dismissable-layer="" {...restProps}>
      {children}
    </Component>
  );
});
