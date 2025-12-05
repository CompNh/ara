import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export type Placement = `${Side}-${Align}`;

export interface UsePositionerOptions {
  readonly anchor?: HTMLElement | null;
  readonly floating?: HTMLElement | null;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly flip?: boolean;
  readonly shift?: boolean;
  readonly strategy?: PositionStrategy;
}

export interface UsePositionerResult {
  readonly anchorProps: PositionerAnchorProps;
  readonly floatingProps: PositionerFloatingProps;
  readonly placement: Placement;
}

export interface PositionerAnchorProps {
  readonly ref: (node: HTMLElement | null) => void;
}

export interface PositionerFloatingProps {
  readonly ref: (node: HTMLElement | null) => void;
  readonly style: CSSProperties;
}

export type PositionStrategy = "absolute" | "fixed";

interface PositionState {
  readonly x: number | undefined;
  readonly y: number | undefined;
  readonly placement: Placement;
}

const DEFAULT_PLACEMENT: Placement = "bottom-start";
const DEFAULT_OFFSET = 0;
const DEFAULT_STRATEGY: PositionStrategy = "absolute";

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align];
  return { side, align };
}

function flipSide(side: Side): Side {
  switch (side) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
    default:
      return side;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeBasePosition(
  side: Side,
  align: Align,
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  offset: number
): { x: number; y: number } {
  switch (side) {
    case "bottom": {
      const x =
        align === "start"
          ? anchorRect.left
          : align === "center"
            ? anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2
            : anchorRect.right - floatingRect.width;
      const y = anchorRect.bottom + offset;
      return { x, y };
    }
    case "top": {
      const x =
        align === "start"
          ? anchorRect.left
          : align === "center"
            ? anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2
            : anchorRect.right - floatingRect.width;
      const y = anchorRect.top - floatingRect.height - offset;
      return { x, y };
    }
    case "right": {
      const x = anchorRect.right + offset;
      const y =
        align === "start"
          ? anchorRect.top
          : align === "center"
            ? anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2
            : anchorRect.bottom - floatingRect.height;
      return { x, y };
    }
    case "left":
    default: {
      const x = anchorRect.left - floatingRect.width - offset;
      const y =
        align === "start"
          ? anchorRect.top
          : align === "center"
            ? anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2
            : anchorRect.bottom - floatingRect.height;
      return { x, y };
    }
  }
}

function computePosition(
  placement: Placement,
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  options: { flip: boolean; shift: boolean; offset: number; strategy: PositionStrategy }
): PositionState {
  const { side: initialSide, align } = parsePlacement(placement);
  const viewportWidth = document.documentElement?.clientWidth ?? window.innerWidth ?? 0;
  const viewportHeight = document.documentElement?.clientHeight ?? window.innerHeight ?? 0;
  const scrollX = window.scrollX ?? window.pageXOffset ?? 0;
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;

  const resolvePositionForSide = (side: Side) => computeBasePosition(side, align, anchorRect, floatingRect, options.offset);

  let side = initialSide;
  let { x, y } = resolvePositionForSide(side);

  if (options.flip) {
    const overflows = {
      top: y < 0,
      bottom: y + floatingRect.height > viewportHeight,
      left: x < 0,
      right: x + floatingRect.width > viewportWidth
    };

    if ((side === "top" && overflows.top) || (side === "bottom" && overflows.bottom)) {
      side = flipSide(side);
      ({ x, y } = resolvePositionForSide(side));
    } else if ((side === "left" && overflows.left) || (side === "right" && overflows.right)) {
      side = flipSide(side);
      ({ x, y } = resolvePositionForSide(side));
    }
  }

  if (options.shift) {
    if (side === "top" || side === "bottom") {
      x = clamp(x, 0, Math.max(viewportWidth - floatingRect.width, 0));
    } else {
      y = clamp(y, 0, Math.max(viewportHeight - floatingRect.height, 0));
    }
  }

  return {
    x: x + (options.strategy === "absolute" ? scrollX : 0),
    y: y + (options.strategy === "absolute" ? scrollY : 0),
    placement: `${side}-${align}` as Placement
  };
}

export function usePositioner(options: UsePositionerOptions = {}): UsePositionerResult {
  const {
    anchor,
    floating,
    placement = DEFAULT_PLACEMENT,
    offset = DEFAULT_OFFSET,
    flip = true,
    shift = true,
    strategy = DEFAULT_STRATEGY
  } = options;
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<PositionState>({ x: undefined, y: undefined, placement });

  const resolvedAnchor = anchor ?? anchorNode;
  const resolvedFloating = floating ?? floatingNode;

  const updatePosition = useCallback(() => {
    if (!resolvedAnchor || !resolvedFloating) return;
    const anchorRect = resolvedAnchor.getBoundingClientRect();
    const floatingRect = resolvedFloating.getBoundingClientRect();
    setPosition((prev) => {
      const next = computePosition(placement, anchorRect, floatingRect, { flip, shift, offset, strategy });
      if (prev.x === next.x && prev.y === next.y && prev.placement === next.placement) {
        return prev;
      }
      return next;
    });
  }, [flip, offset, placement, resolvedAnchor, resolvedFloating, shift]);

  useEffect(() => {
    if (!resolvedAnchor || !resolvedFloating) return undefined;

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updatePosition()) : null;
    resizeObserver?.observe(resolvedAnchor);
    resizeObserver?.observe(resolvedFloating);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [resolvedAnchor, resolvedFloating, updatePosition]);

  useEffect(() => {
    updatePosition();
  }, [placement, updatePosition]);

  const setAnchor = useCallback((node: HTMLElement | null) => setAnchorNode(node), []);
  const setFloating = useCallback((node: HTMLElement | null) => setFloatingNode(node), []);

  const anchorProps = useMemo<PositionerAnchorProps>(() => ({ ref: setAnchor }), [setAnchor]);

  const floatingProps = useMemo<PositionerFloatingProps>(() => ({
    ref: setFloating,
    style: {
      position: strategy,
      left: position.x,
      top: position.y
    }
  }), [position.x, position.y, setFloating, strategy]);

  return { anchorProps, floatingProps, placement: position.placement };
}
