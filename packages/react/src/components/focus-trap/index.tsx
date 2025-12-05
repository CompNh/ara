import { forwardRef, type HTMLAttributes, type PropsWithChildren } from "react";
import { Slot } from "@radix-ui/react-slot";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useFocusTrap, type UseFocusTrapOptions } from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";

type FocusTrapOptions = Pick<UseFocusTrapOptions, "active" | "initialFocus" | "restoreFocus">;

export type FocusTrapProps = PropsWithChildren<FocusTrapOptions & {
  readonly asChild?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, keyof FocusTrapOptions | "children">;

export const FocusTrap = forwardRef<HTMLElement, FocusTrapProps>(function FocusTrap(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    active,
    initialFocus,
    restoreFocus,
    className,
    ...restProps
  } = props;

  const { containerProps, beforeFocusGuardProps, afterFocusGuardProps } = useFocusTrap({
    active,
    initialFocus,
    restoreFocus
  });

  const Component = asChild ? Slot : "div";
  const composedRef = composeRefs<HTMLElement>(forwardedRef, containerProps.ref);
  const resolvedClassName = mergeClassNames("ara-focus-trap", className);

  return (
    <>
      <span {...beforeFocusGuardProps} />
      <Component ref={composedRef} className={resolvedClassName} data-ara-focus-trap="" {...restProps}>
        {children}
      </Component>
      <span {...afterFocusGuardProps} />
    </>
  );
});
