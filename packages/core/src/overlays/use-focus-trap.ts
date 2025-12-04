import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent
} from "react";

export interface UseFocusTrapOptions {
  readonly active?: boolean;
  readonly container?: HTMLElement | null;
  readonly initialFocus?: FocusTarget;
  readonly restoreFocus?: boolean;
}

export interface UseFocusTrapResult {
  readonly containerProps: FocusTrapContainerProps;
  readonly beforeFocusGuardProps: FocusGuardProps;
  readonly afterFocusGuardProps: FocusGuardProps;
}

export interface FocusTrapContainerProps {
  readonly ref: (node: HTMLElement | null) => void;
}

export interface FocusGuardProps {
  readonly tabIndex: 0;
  readonly "aria-hidden": true;
  readonly "data-ara-focus-guard": string;
  readonly onFocus: (event: FocusEvent<HTMLElement>) => void;
}

type FocusTarget = HTMLElement | null | (() => HTMLElement | null);

type FocusDirection = "first" | "last";

const FOCUSABLE_SELECTOR = [
  "a[href]:not([tabindex='-1']):not([inert])",
  "button:not([disabled]):not([tabindex='-1']):not([inert])",
  "input:not([disabled]):not([tabindex='-1']):not([type='hidden']):not([inert])",
  "select:not([disabled]):not([tabindex='-1']):not([inert])",
  "textarea:not([disabled]):not([tabindex='-1']):not([inert])",
  "[tabindex]:not([tabindex='-1']):not([disabled]):not([inert])"
].join(",");

const focusTrapStack: Array<symbol> = [];

function pushTrap(id: symbol) {
  focusTrapStack.push(id);
}

function removeTrap(id: symbol) {
  const index = focusTrapStack.indexOf(id);
  if (index >= 0) {
    focusTrapStack.splice(index, 1);
  }
}

function isTopTrap(id: symbol): boolean {
  return focusTrapStack[focusTrapStack.length - 1] === id;
}

function resolveFocusTarget(target: FocusTarget): HTMLElement | null {
  return typeof target === "function" ? target() : target ?? null;
}

function isHTMLElement(node: unknown): node is HTMLElement {
  return node instanceof HTMLElement;
}

function focusNode(node: HTMLElement | null): boolean {
  if (!node) return false;
  node.focus({ preventScroll: true });
  return document.activeElement === node;
}

function isFocusable(node: HTMLElement | null): node is HTMLElement {
  if (!node) return false;
  if (node.tabIndex >= 0) return true;
  return isHTMLElement(node) && !!node.getAttribute("href");
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

function focusElementInContainer(container: HTMLElement | null, direction: FocusDirection): boolean {
  if (!container) return false;
  const focusable = getFocusableElements(container);
  const target = direction === "first" ? focusable[0] : focusable[focusable.length - 1];

  if (focusNode(target ?? null)) return true;
  if (isFocusable(container)) {
    return focusNode(container);
  }

  return false;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}): UseFocusTrapResult {
  const { active = true, container, initialFocus, restoreFocus = true } = options;
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);
  const resolvedContainer = container ?? containerNode;
  const reactId = useId();
  const trapId = useMemo(() => Symbol(`focus-trap-${reactId}`), [reactId]);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const lastTabDirectionRef = useRef<FocusDirection>("first");

  const setContainer = useCallback((node: HTMLElement | null) => {
    setContainerNode(node);
  }, []);

  const focusInitialNode = useCallback(() => {
    if (!resolvedContainer) return;

    const target = initialFocus ? resolveFocusTarget(initialFocus) : null;
    if (target && resolvedContainer.contains(target) && focusNode(target)) return;

    if (focusElementInContainer(resolvedContainer, "first")) return;

    focusNode(resolvedContainer);
  }, [initialFocus, resolvedContainer]);

  const handleGuardFocus = useCallback(
    (direction: FocusDirection, event: FocusEvent<HTMLElement>) => {
      if (!isTopTrap(trapId) || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      focusElementInContainer(resolvedContainer, direction);
    },
    [resolvedContainer, trapId]
  );

  useEffect(() => {
    if (!active) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        lastTabDirectionRef.current = event.shiftKey ? "last" : "first";
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [active]);

  useEffect(() => {
    if (!active || !resolvedContainer) return undefined;

    const activeElement = document.activeElement;
    previousFocusedElementRef.current = isHTMLElement(activeElement)
      ? activeElement
      : previousFocusedElementRef.current;

    pushTrap(trapId);
    focusInitialNode();

    return () => {
      const wasTop = isTopTrap(trapId);
      removeTrap(trapId);

      if (wasTop && restoreFocus !== false) {
        const previousElement = previousFocusedElementRef.current;
        if (previousElement && document.contains(previousElement)) {
          focusNode(previousElement);
        }
      }
    };
  }, [active, focusInitialNode, resolvedContainer, restoreFocus, trapId]);

  useEffect(() => {
    if (!active || !resolvedContainer || !isTopTrap(trapId)) return undefined;
    focusInitialNode();
    return undefined;
  }, [active, focusInitialNode, resolvedContainer, trapId]);

  const beforeFocusGuardProps = useMemo<FocusGuardProps>(() => ({
    tabIndex: 0,
    "aria-hidden": true,
    "data-ara-focus-guard": "before",
    onFocus: (event: FocusEvent<HTMLElement>) => handleGuardFocus(lastTabDirectionRef.current, event)
  }), [handleGuardFocus]);

  const afterFocusGuardProps = useMemo<FocusGuardProps>(() => ({
    tabIndex: 0,
    "aria-hidden": true,
    "data-ara-focus-guard": "after",
    onFocus: (event: FocusEvent<HTMLElement>) => handleGuardFocus(lastTabDirectionRef.current, event)
  }), [handleGuardFocus]);

  const containerProps = useMemo<FocusTrapContainerProps>(() => ({ ref: setContainer }), [setContainer]);

  return {
    containerProps,
    beforeFocusGuardProps,
    afterFocusGuardProps
  };
}
