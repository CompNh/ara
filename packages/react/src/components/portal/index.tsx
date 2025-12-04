import { useEffect, useRef, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { usePortal } from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";

export interface PortalProps extends PropsWithChildren {
  readonly container?: HTMLElement | null;
  readonly disablePortal?: boolean;
  readonly className?: string;
}

const PORTAL_CLASSNAME = "ara-portal";

export function Portal(props: PortalProps): JSX.Element {
  const { children, container: containerProp, disablePortal = false, className } = props;

  const { container } = usePortal({ container: containerProp, disabled: disablePortal });
  const originalClassNameRef = useRef<string>("");
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!container || disablePortal) return undefined;

    containerRef.current = container;
    originalClassNameRef.current = container.className;

    const mergedClassName = mergeClassNames(originalClassNameRef.current, PORTAL_CLASSNAME, className);
    container.className = mergedClassName;

    return () => {
      if (!containerRef.current) return;
      containerRef.current.className = originalClassNameRef.current;
      containerRef.current = null;
    };
  }, [className, container, disablePortal]);

  if (!container || disablePortal) {
    return <>{children}</>;
  }

  return createPortal(children, container);
}
