import { useEffect, useRef, useState } from "react";

export interface UsePortalOptions {
  readonly container?: HTMLElement | null;
  readonly disabled?: boolean;
  readonly onContainerChange?: (node: HTMLElement) => void;
}

export interface UsePortalResult {
  readonly container: HTMLElement | null;
}

const DEFAULT_PORTAL_SELECTOR = "data-ara-portal-container";

function createDefaultContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const { body } = document;
  if (!body) return null;

  const element = document.createElement("div");
  element.setAttribute(DEFAULT_PORTAL_SELECTOR, "");
  body.appendChild(element);
  return element;
}

function removeContainer(node: HTMLElement | null) {
  node?.remove();
}

export function usePortal(options: UsePortalOptions = {}): UsePortalResult {
  const { container, disabled = false, onContainerChange } = options;
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const createdContainerRef = useRef<HTMLElement | null>(null);
  const notifiedContainerRef = useRef<HTMLElement | null>(null);
  const onContainerChangeRef = useRef(onContainerChange);

  useEffect(() => {
    onContainerChangeRef.current = onContainerChange;
  }, [onContainerChange]);

  useEffect(() => {
    const cleanupCreatedContainer = () => {
      removeContainer(createdContainerRef.current);
      createdContainerRef.current = null;
    };

    if (disabled) {
      cleanupCreatedContainer();
      setPortalContainer(null);
      return cleanupCreatedContainer;
    }

    let resolvedContainer = container ?? null;

    if (!resolvedContainer) {
      resolvedContainer = createDefaultContainer();
      createdContainerRef.current = resolvedContainer;
    }

    setPortalContainer(resolvedContainer);

    if (resolvedContainer && notifiedContainerRef.current !== resolvedContainer) {
      notifiedContainerRef.current = resolvedContainer;
      onContainerChangeRef.current?.(resolvedContainer);
    }

    return cleanupCreatedContainer;
  }, [container, disabled]);

  return { container: portalContainer };
}
