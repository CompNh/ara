import { useCallback, useEffect, useMemo, useRef, useState, type PointerEventHandler } from "react";

export interface UseHoverIntentOptions {
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly restMs?: number;
  readonly enableSafePolygon?: boolean;
  readonly anchor?: HTMLElement | null;
  readonly floating?: HTMLElement | null;
  readonly onOpenChange?: (open: boolean) => void;
}

export interface HoverIntentTargetProps {
  readonly ref: (node: HTMLElement | null) => void;
  readonly onPointerEnter: PointerEventHandler<HTMLElement>;
  readonly onPointerMove: PointerEventHandler<HTMLElement>;
  readonly onPointerLeave: PointerEventHandler<HTMLElement>;
}

export interface UseHoverIntentResult {
  readonly isOpen: boolean;
  readonly anchorProps: HoverIntentTargetProps;
  readonly floatingProps: HoverIntentTargetProps;
  readonly open: () => void;
  readonly close: () => void;
}

const DEFAULT_OPEN_DELAY = 150;
const DEFAULT_CLOSE_DELAY = 100;
const DEFAULT_REST_MS = 50;

interface Point {
  readonly x: number;
  readonly y: number;
}

function isPointInSafeArea(point: Point, anchorRect: DOMRect, floatingRect: DOMRect): boolean {
  const left = Math.min(anchorRect.left, floatingRect.left);
  const right = Math.max(anchorRect.right, floatingRect.right);
  const top = Math.min(anchorRect.top, floatingRect.top);
  const bottom = Math.max(anchorRect.bottom, floatingRect.bottom);

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}

export function useHoverIntent(options: UseHoverIntentOptions = {}): UseHoverIntentResult {
  const {
    isOpen: controlledOpen,
    defaultOpen = false,
    openDelay = DEFAULT_OPEN_DELAY,
    closeDelay = DEFAULT_CLOSE_DELAY,
    restMs = DEFAULT_REST_MS,
    enableSafePolygon = true,
    anchor,
    floating,
    onOpenChange
  } = options;

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? Boolean(controlledOpen) : uncontrolledOpen;

  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);

  const resolvedAnchor = anchor ?? anchorNode;
  const resolvedFloating = floating ?? floatingNode;

  const lastPointerTimeRef = useRef<number>(0);
  const openTimerRef = useRef<number>();
  const closeTimerRef = useRef<number>();
  const safeMonitorCleanupRef = useRef<(() => void) | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = undefined;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  const stopSafeMonitor = useCallback(() => {
    safeMonitorCleanupRef.current?.();
    safeMonitorCleanupRef.current = null;
  }, []);

  useEffect(() => () => {
    clearOpenTimer();
    clearCloseTimer();
    stopSafeMonitor();
  }, [clearCloseTimer, clearOpenTimer, stopSafeMonitor]);

  const scheduleOpen = useCallback(() => {
    clearOpenTimer();
    const attemptOpen = () => {
      const elapsed = Date.now() - lastPointerTimeRef.current;
      if (elapsed >= restMs) {
        setOpen(true);
      } else {
        openTimerRef.current = window.setTimeout(attemptOpen, restMs - elapsed);
      }
    };

    openTimerRef.current = window.setTimeout(attemptOpen, openDelay);
  }, [clearOpenTimer, openDelay, restMs, setOpen]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [clearCloseTimer, closeDelay, setOpen]);

  const handlePointerEnter = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      lastPointerTimeRef.current = Date.now();
      stopSafeMonitor();
      clearCloseTimer();
      scheduleOpen();
      if (event.pointerType === "touch") {
        clearOpenTimer();
      }
    },
    [clearCloseTimer, clearOpenTimer, scheduleOpen, stopSafeMonitor]
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>((event) => {
    lastPointerTimeRef.current = Date.now();
    if (event.pointerType === "touch") {
      clearOpenTimer();
    }
  }, [clearOpenTimer]);

  const handlePointerLeave = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const nextTarget = event.relatedTarget as HTMLElement | null;
      if (
        nextTarget instanceof Node &&
        (resolvedAnchor?.contains(nextTarget) || resolvedFloating?.contains(nextTarget))
      ) {
        return;
      }

      clearOpenTimer();

      if (enableSafePolygon && resolvedAnchor && resolvedFloating) {
        const anchorRect = resolvedAnchor.getBoundingClientRect();
        const floatingRect = resolvedFloating.getBoundingClientRect();
        const point: Point = { x: event.clientX, y: event.clientY };

        if (isPointInSafeArea(point, anchorRect, floatingRect)) {
          stopSafeMonitor();
          const handlePointerMoveOutside = (moveEvent: PointerEvent) => {
            const nextPoint: Point = { x: moveEvent.clientX, y: moveEvent.clientY };
            if (!isPointInSafeArea(nextPoint, anchorRect, floatingRect)) {
              stopSafeMonitor();
              scheduleClose();
            }
          };
          document.addEventListener("pointermove", handlePointerMoveOutside);
          safeMonitorCleanupRef.current = () => document.removeEventListener("pointermove", handlePointerMoveOutside);
          return;
        }
      }

      scheduleClose();
    },
    [clearOpenTimer, enableSafePolygon, resolvedAnchor, resolvedFloating, scheduleClose, stopSafeMonitor]
  );

  const openManually = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    stopSafeMonitor();
    setOpen(true);
  }, [clearCloseTimer, clearOpenTimer, setOpen, stopSafeMonitor]);

  const closeManually = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    stopSafeMonitor();
    setOpen(false);
  }, [clearCloseTimer, clearOpenTimer, setOpen, stopSafeMonitor]);

  const setAnchor = useCallback((node: HTMLElement | null) => setAnchorNode(node), []);
  const setFloating = useCallback((node: HTMLElement | null) => setFloatingNode(node), []);

  const anchorProps = useMemo<HoverIntentTargetProps>(
    () => ({
      ref: setAnchor,
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave
    }),
    [handlePointerEnter, handlePointerLeave, handlePointerMove, setAnchor]
  );

  const floatingProps = useMemo<HoverIntentTargetProps>(
    () => ({
      ref: setFloating,
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave
    }),
    [handlePointerEnter, handlePointerLeave, handlePointerMove, setFloating]
  );

  return {
    isOpen: open,
    anchorProps,
    floatingProps,
    open: openManually,
    close: closeManually
  };
}
