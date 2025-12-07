import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface UseDismissableLayerOptions {
  readonly active?: boolean;
  readonly container?: HTMLElement | null;
  readonly onDismiss?: (event: DismissableLayerEvent) => void;
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => void;
  readonly onPointerDownOutside?: (event: PointerEvent) => void;
  readonly onFocusOutside?: (event: FocusEvent) => void;
}

export interface UseDismissableLayerResult {
  readonly containerProps: DismissableLayerContainerProps;
}

export interface DismissableLayerContainerProps {
  readonly ref: (node: HTMLElement | null) => void;
}

export interface DismissableLayerEvent<T extends Event = Event> {
  readonly type: "escape-key" | "pointer-down-outside" | "focus-outside";
  readonly originalEvent: T;
}

type DismissableLayerEntry = { readonly id: symbol; node: HTMLElement | null };

const dismissableLayerStack: Array<DismissableLayerEntry> = [];

function pushLayer(entry: DismissableLayerEntry) {
  dismissableLayerStack.push(entry);
}

function removeLayer(id: symbol) {
  const index = dismissableLayerStack.findIndex((entry) => entry.id === id);
  if (index >= 0) {
    dismissableLayerStack.splice(index, 1);
  }
}

function updateLayerNode(id: symbol, node: HTMLElement | null) {
  const entry = dismissableLayerStack.find((item) => item.id === id);
  if (entry) {
    entry.node = node;
  }
}

function getTopLayerId(): symbol | undefined {
  let top: DismissableLayerEntry | undefined;

  for (const entry of dismissableLayerStack) {
    const entryNode = entry.node;
    if (!entryNode) continue;

    const isAncestor = dismissableLayerStack.some(
      (other) => other.id !== entry.id && other.node && entryNode.contains(other.node)
    );

    if (isAncestor) continue;
    top = entry;
  }

  return top?.id;
}

function isTopLayer(id: symbol): boolean {
  return getTopLayerId() === id;
}

export function useDismissableLayer(options: UseDismissableLayerOptions = {}): UseDismissableLayerResult {
  const { active = true, container, onDismiss, onEscapeKeyDown, onPointerDownOutside, onFocusOutside } = options;
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);
  const resolvedContainer = container ?? containerNode;
  const reactId = useId();
  const layerId = useMemo(() => Symbol(`dismissable-layer-${reactId}`), [reactId]);
  const onDismissRef = useRef(onDismiss);
  const onEscapeKeyDownRef = useRef(onEscapeKeyDown);
  const onPointerDownOutsideRef = useRef(onPointerDownOutside);
  const onFocusOutsideRef = useRef(onFocusOutside);
  const ignoreFocusOutsideRef = useRef(false);
  const dismissedInFrameRef = useRef(false);

  useEffect(() => {
    onDismissRef.current = onDismiss;
    onEscapeKeyDownRef.current = onEscapeKeyDown;
    onPointerDownOutsideRef.current = onPointerDownOutside;
    onFocusOutsideRef.current = onFocusOutside;
  }, [onDismiss, onEscapeKeyDown, onFocusOutside, onPointerDownOutside]);

  const setContainer = useCallback(
    (node: HTMLElement | null) => {
      setContainerNode(node);
      updateLayerNode(layerId, node);
    },
    [layerId]
  );

  useLayoutEffect(() => {
    if (!active) return undefined;

    pushLayer({ id: layerId, node: resolvedContainer ?? null });

    const dismiss = <TEvent extends Event>(type: DismissableLayerEvent["type"], event: TEvent) => {
      if (dismissedInFrameRef.current) return;
      dismissedInFrameRef.current = true;

      setTimeout(() => {
        dismissedInFrameRef.current = false;
        ignoreFocusOutsideRef.current = false;
      });

      onDismissRef.current?.({ type, originalEvent: event });
    };

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isTopLayer(layerId)) return;

      onEscapeKeyDownRef.current?.(event);
      if (event.defaultPrevented) return;

      dismiss("escape-key", event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isTopLayer(layerId)) return;
      const target = event.target as Node | null;
      if (resolvedContainer && target && resolvedContainer.contains(target)) return;

      onPointerDownOutsideRef.current?.(event);
      if (event.defaultPrevented) return;

      ignoreFocusOutsideRef.current = true;
      dismiss("pointer-down-outside", event);
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTopLayer(layerId)) return;
      const target = event.target as Node | null;
      if (resolvedContainer && target && resolvedContainer.contains(target)) return;

      if (ignoreFocusOutsideRef.current) {
        ignoreFocusOutsideRef.current = false;
        return;
      }

      onFocusOutsideRef.current?.(event);
      if (event.defaultPrevented) return;

      dismiss("focus-outside", event);
    };

    document.addEventListener("keydown", handleEscapeKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      removeLayer(layerId);
      document.removeEventListener("keydown", handleEscapeKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [active, layerId, resolvedContainer]);

  const containerProps = useMemo<DismissableLayerContainerProps>(() => ({ ref: setContainer }), [setContainer]);

  return { containerProps };
}
