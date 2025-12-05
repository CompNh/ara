import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseAriaHiddenOptions {
  readonly active?: boolean;
  readonly container?: HTMLElement | null;
  readonly inert?: boolean;
}

export interface UseAriaHiddenResult {
  readonly containerProps: AriaHiddenContainerProps;
}

export interface AriaHiddenContainerProps {
  readonly ref: (node: HTMLElement | null) => void;
}

type InertableElement = HTMLElement & { inert?: boolean };

interface HiddenElementState {
  readonly ariaHidden: string | null;
  readonly inertAttribute: boolean;
  readonly inertValue: boolean | undefined;
}

const hiddenCounts = new WeakMap<HTMLElement, number>();
const hiddenStates = new WeakMap<HTMLElement, HiddenElementState>();

function isHTMLElement(node: unknown): node is HTMLElement {
  return node instanceof HTMLElement;
}

function setElementHidden(element: HTMLElement, enableInert: boolean) {
  const count = hiddenCounts.get(element) ?? 0;

  if (count === 0) {
    hiddenStates.set(element, {
      ariaHidden: element.getAttribute("aria-hidden"),
      inertAttribute: element.hasAttribute("inert"),
      inertValue: (element as InertableElement).inert
    });
  }

  hiddenCounts.set(element, count + 1);
  element.setAttribute("aria-hidden", "true");

  if (enableInert) {
    const inertable = element as InertableElement;
    inertable.inert = true;
    element.setAttribute("inert", "");
  }
}

function restoreElementHidden(element: HTMLElement, enableInert: boolean) {
  const count = hiddenCounts.get(element) ?? 0;
  if (count <= 0) return;

  if (count > 1) {
    hiddenCounts.set(element, count - 1);
    return;
  }

  hiddenCounts.delete(element);
  const previousState = hiddenStates.get(element);
  if (!previousState) return;

  if (previousState.ariaHidden === null) {
    element.removeAttribute("aria-hidden");
  } else {
    element.setAttribute("aria-hidden", previousState.ariaHidden);
  }

  if (enableInert) {
    const inertable = element as InertableElement;
    inertable.inert = previousState.inertValue ?? false;

    if (previousState.inertAttribute) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  }
}

function collectElementsToHide(node: HTMLElement): HTMLElement[] {
  const elements = new Set<HTMLElement>();
  let current: HTMLElement | null = node;

  while (current) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;

    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current) return;
      if (isHTMLElement(sibling)) {
        elements.add(sibling);
      }
    });

    if (parent === document.body || parent === document.documentElement) {
      break;
    }

    current = parent;
  }

  return Array.from(elements);
}

export function useAriaHidden(options: UseAriaHiddenOptions = {}): UseAriaHiddenResult {
  const { active = true, container, inert = true } = options;
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);
  const resolvedContainer = container ?? containerNode;

  const setContainer = useCallback((node: HTMLElement | null) => {
    setContainerNode(node);
  }, []);

  useEffect(() => {
    if (!active || !resolvedContainer) return undefined;

    const elementsToHide = collectElementsToHide(resolvedContainer);
    elementsToHide.forEach((element) => setElementHidden(element, inert));

    return () => {
      elementsToHide.forEach((element) => restoreElementHidden(element, inert));
    };
  }, [active, inert, resolvedContainer]);

  const containerProps = useMemo<AriaHiddenContainerProps>(() => ({ ref: setContainer }), [setContainer]);

  return { containerProps };
}
