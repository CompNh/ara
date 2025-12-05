import { useCallback, useEffect, useMemo, useState, type CSSProperties, type RefObject } from "react";
import {
  usePositioner as useCorePositioner,
  type Placement,
  type PositionerAnchorProps,
  type PositionerFloatingProps,
  type PositionStrategy
} from "@ara/core";

export type { Placement, PositionStrategy };

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface PositionerArrowProps {
  readonly ref: (node: HTMLElement | null) => void;
  readonly style: CSSProperties;
  readonly "data-side": Side;
  readonly "data-align": Align;
}

export interface UsePositionerOptions {
  readonly anchorRef?: RefObject<HTMLElement | null>;
  readonly floatingRef?: RefObject<HTMLElement | null>;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
  readonly withArrow?: boolean;
}

export interface UsePositionerResult {
  readonly anchorProps: PositionerAnchorProps;
  readonly floatingProps: PositionerFloatingProps & { readonly "data-placement": Placement };
  readonly arrowProps?: PositionerArrowProps;
  readonly placement: Placement;
}

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align];
  return { side, align };
}

export function usePositioner(options: UsePositionerOptions = {}): UsePositionerResult {
  const { anchorRef, floatingRef, placement, offset, strategy, withArrow = false } = options;

  const [localAnchor, setLocalAnchor] = useState<HTMLElement | null>(null);
  const [localFloating, setLocalFloating] = useState<HTMLElement | null>(null);
  const [arrowNode, setArrowNode] = useState<HTMLElement | null>(null);
  const [arrowStyle, setArrowStyle] = useState<CSSProperties>({ position: "absolute" });

  const resolvedAnchor = anchorRef?.current ?? localAnchor;
  const resolvedFloating = floatingRef?.current ?? localFloating;

  const { anchorProps: coreAnchorProps, floatingProps: coreFloatingProps, placement: resolvedPlacement } = useCorePositioner({
    anchor: resolvedAnchor,
    floating: resolvedFloating,
    placement,
    offset,
    strategy
  });

  const updateArrowPosition = useCallback(() => {
    if (!withArrow || !arrowNode || !resolvedAnchor || !resolvedFloating) return;

    const anchorRect = resolvedAnchor.getBoundingClientRect();
    const floatingRect = resolvedFloating.getBoundingClientRect();
    const { side, align } = parsePlacement(resolvedPlacement);

    const scrollX = window.scrollX ?? window.pageXOffset ?? 0;
    const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2 + (coreFloatingProps.style.position === "absolute" ? scrollX : 0);
    const anchorCenterY = anchorRect.top + anchorRect.height / 2 + (coreFloatingProps.style.position === "absolute" ? scrollY : 0);

    const floatingLeft = (typeof coreFloatingProps.style.left === "number" ? coreFloatingProps.style.left : floatingRect.left) +
      (coreFloatingProps.style.position === "absolute" ? scrollX : 0);
    const floatingTop = (typeof coreFloatingProps.style.top === "number" ? coreFloatingProps.style.top : floatingRect.top) +
      (coreFloatingProps.style.position === "absolute" ? scrollY : 0);
    const arrowHalfWidth = (arrowNode.offsetWidth ?? 0) / 2;
    const arrowHalfHeight = (arrowNode.offsetHeight ?? 0) / 2;

    const position: CSSProperties = { position: "absolute" };

    if (side === "top" || side === "bottom") {
      position.left = anchorCenterX - floatingLeft - arrowHalfWidth;
    }

    if (side === "left" || side === "right") {
      position.top = anchorCenterY - floatingTop - arrowHalfHeight;
    }

    setArrowStyle(position);
  }, [arrowNode, coreFloatingProps.style.position, resolvedAnchor, resolvedFloating, resolvedPlacement, withArrow]);

  useEffect(() => {
    updateArrowPosition();
  }, [updateArrowPosition, coreFloatingProps.style.left, coreFloatingProps.style.top]);

  const anchorProps = useMemo<PositionerAnchorProps>(
    () => ({
      ref: (node: HTMLElement | null) => {
        setLocalAnchor(node);
        coreAnchorProps.ref(node);
      }
    }),
    [coreAnchorProps]
  );

  const floatingProps = useMemo<UsePositionerResult["floatingProps"]>(
    () => ({
      ref: (node: HTMLElement | null) => {
        setLocalFloating(node);
        coreFloatingProps.ref(node);
      },
      style: coreFloatingProps.style,
      "data-placement": resolvedPlacement
    }),
    [coreFloatingProps, resolvedPlacement]
  );

  const arrowProps = useMemo<PositionerArrowProps | undefined>(() => {
    if (!withArrow) return undefined;

    const { side, align } = parsePlacement(resolvedPlacement);

    return {
      ref: setArrowNode,
      style: arrowStyle,
      "data-side": side,
      "data-align": align
    };
  }, [arrowStyle, resolvedPlacement, withArrow]);

  return { anchorProps, floatingProps, arrowProps, placement: resolvedPlacement };
}
