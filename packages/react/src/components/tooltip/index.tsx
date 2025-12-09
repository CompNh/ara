import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type MutableRefObject,
  type PropsWithChildren
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  useHoverIntent,
  type HoverIntentTargetProps,
  type Placement,
  type PositionStrategy
} from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";
import { Portal } from "../portal/index.js";
import { usePositioner, type PositionerArrowProps } from "../positioner/index.js";

type TooltipContextValue = {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly placement: Placement;
  readonly offset: number;
  readonly strategy: PositionStrategy;
  readonly withArrow: boolean;
  readonly portalContainer?: HTMLElement | null;
  readonly contentId: string;
  readonly setContentId: (id: string) => void;
  readonly setOpen: (next: boolean) => void;
  readonly anchorRef: MutableRefObject<HTMLElement | null>;
  readonly floatingRef: MutableRefObject<HTMLElement | null>;
  readonly setAnchor: (node: HTMLElement | null) => void;
  readonly setFloating: (node: HTMLElement | null) => void;
  readonly anchorHoverProps: HoverIntentTargetProps;
  readonly floatingHoverProps: HoverIntentTargetProps;
};

type TooltipArrowContextValue = {
  readonly arrowProps?: PositionerArrowProps;
  readonly withArrow: boolean;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);
const TooltipArrowContext = createContext<TooltipArrowContextValue | null>(null);

function useTooltipContext(): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip 하위 컴포넌트는 Tooltip 안에서만 사용할 수 있습니다.");
  }
  return context;
}

function useTooltipArrowContext(): TooltipArrowContextValue {
  const context = useContext(TooltipArrowContext);
  if (!context) {
    throw new Error("TooltipArrow는 TooltipContent 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

function composeEventHandlers<Event>(
  ours: ((event: Event) => void) | undefined,
  theirs: ((event: Event) => void) | undefined
): (event: Event) => void {
  if (!ours && !theirs) return () => {};
  return (event: Event) => {
    ours?.(event);
    theirs?.(event);
  };
}

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align];
  return { side, align };
}

type TooltipRootProps = PropsWithChildren<{
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
  readonly withArrow?: boolean;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly disabled?: boolean;
  readonly portalContainer?: HTMLElement | null;
}> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

const DEFAULT_PLACEMENT: Placement = "top-start";
const DEFAULT_OFFSET = 8;
const DEFAULT_STRATEGY: PositionStrategy = "absolute";
const DEFAULT_OPEN_DELAY = 300;
const DEFAULT_CLOSE_DELAY = 150;

export function Tooltip(props: TooltipRootProps): JSX.Element {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = DEFAULT_PLACEMENT,
    offset = DEFAULT_OFFSET,
    strategy = DEFAULT_STRATEGY,
    withArrow = false,
    openDelay = DEFAULT_OPEN_DELAY,
    closeDelay = DEFAULT_CLOSE_DELAY,
    disabled = false,
    portalContainer,
    className,
    style
  } = props;

  const reactId = useId();
  const generatedId = useMemo(() => `ara-tooltip-${reactId.replace(/:/g, "-")}`, [reactId]);
  const [contentId, setContentId] = useState(generatedId);

  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = disabled ? false : isControlled ? Boolean(openProp) : uncontrolledOpen;

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      const resolved = disabled ? false : next;
      if (!isControlled) {
        setUncontrolledOpen(resolved);
      }
      onOpenChange?.(resolved);
    },
    [disabled, isControlled, onOpenChange]
  );

  useEffect(() => {
    if (!disabled) return;
    setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [disabled, onOpenChange]);

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
    setAnchorNode(node);
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode(node);
  }, []);

  const { anchorProps: anchorHoverProps, floatingProps: floatingHoverProps } = useHoverIntent({
    isOpen: open,
    openDelay,
    closeDelay,
    enableSafePolygon: false,
    anchor: anchorNode,
    floating: floatingNode,
    onOpenChange: handleOpenChange
  });

  useEffect(() => {
    if (!open || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && (anchorRef.current?.contains(target) || floatingRef.current?.contains(target))) {
        return;
      }
      handleOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [anchorRef, disabled, floatingRef, handleOpenChange, open]);

  const contextValue = useMemo<TooltipContextValue>(
    () => ({
      open,
      disabled,
      placement,
      offset,
      strategy,
      withArrow,
      portalContainer,
      contentId,
      setContentId,
      setOpen: handleOpenChange,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating,
      anchorHoverProps,
      floatingHoverProps
    }),
    [
      anchorHoverProps,
      anchorRef,
      contentId,
      disabled,
      floatingHoverProps,
      floatingRef,
      handleOpenChange,
      open,
      offset,
      placement,
      portalContainer,
      setAnchor,
      setFloating,
      strategy,
      withArrow
    ]
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      <div className={mergeClassNames("ara-tooltip__root", className)} style={style}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(function TooltipTrigger(
  props,
  forwardedRef
) {
  const { children, asChild = false, disabled: disabledProp, className, onPointerEnter, onPointerMove, onPointerLeave, onFocus, onBlur, ...restProps } = props;

  const {
    open,
    disabled: contextDisabled,
    contentId,
    setOpen,
    setAnchor,
    anchorHoverProps
  } = useTooltipContext();
  const disabled = contextDisabled || disabledProp;

  const Component = asChild ? Slot : "span";
  const resolvedClassName = mergeClassNames("ara-tooltip__trigger", className);

  const composedRef = composeRefs<HTMLElement>(forwardedRef, anchorHoverProps.ref, setAnchor);

  const handleFocus = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onFocus"]>>(
    (event) => {
      if (disabled) return;
      setOpen(true);
      onFocus?.(event);
    },
    [disabled, onFocus, setOpen]
  );

  const handleBlur = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onBlur"]>>(
    (event) => {
      if (disabled) return;
      setOpen(false);
      onBlur?.(event);
    },
    [disabled, onBlur, setOpen]
  );

  const pointerEnterHandler = disabled
    ? undefined
    : composeEventHandlers(anchorHoverProps.onPointerEnter, onPointerEnter);
  const pointerMoveHandler = disabled
    ? undefined
    : composeEventHandlers(anchorHoverProps.onPointerMove, onPointerMove);
  const pointerLeaveHandler = disabled
    ? undefined
    : composeEventHandlers(anchorHoverProps.onPointerLeave, onPointerLeave);

  return (
    <Component
      ref={composedRef}
      className={resolvedClassName}
      aria-describedby={!disabled ? contentId : undefined}
      aria-disabled={disabled || undefined}
      data-state={open ? "open" : "closed"}
      onPointerEnter={pointerEnterHandler}
      onPointerMove={pointerMoveHandler}
      onPointerLeave={pointerLeaveHandler}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...restProps}
    >
      {children}
    </Component>
  );
});

type TooltipContentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const TooltipContent = forwardRef<HTMLElement, TooltipContentProps>(function TooltipContent(
  props,
  forwardedRef
) {
  const { children, asChild = false, id, className, style, onPointerEnter, onPointerMove, onPointerLeave, ...restProps } = props;

  const {
    open,
    disabled,
    placement,
    offset,
    strategy,
    withArrow,
    portalContainer,
    contentId,
    setContentId,
    floatingHoverProps,
    floatingRef,
    anchorRef,
    setFloating
  } = useTooltipContext();

  const resolvedId = id ?? contentId;

  useEffect(() => {
    setContentId(resolvedId);
  }, [resolvedId, setContentId]);

  const { floatingProps, arrowProps, placement: resolvedPlacement } = usePositioner({
    anchorRef,
    floatingRef,
    placement,
    offset,
    strategy,
    withArrow
  });

  const { side, align } = parsePlacement(resolvedPlacement);

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-tooltip", className);

  const composedRef = composeRefs<HTMLElement>(forwardedRef, floatingProps.ref, floatingHoverProps.ref, setFloating);

  const pointerEnterHandler = disabled
    ? undefined
    : composeEventHandlers(floatingHoverProps.onPointerEnter, onPointerEnter);
  const pointerMoveHandler = disabled
    ? undefined
    : composeEventHandlers(floatingHoverProps.onPointerMove, onPointerMove);
  const pointerLeaveHandler = disabled
    ? undefined
    : composeEventHandlers(floatingHoverProps.onPointerLeave, onPointerLeave);

  const arrowContext = useMemo<TooltipArrowContextValue>(() => ({ arrowProps, withArrow }), [arrowProps, withArrow]);

  if (!open || disabled) return null;

  return (
    <TooltipArrowContext.Provider value={arrowContext}>
      <Portal container={portalContainer} className="ara-tooltip__portal">
        <Component
          ref={composedRef}
          id={resolvedId}
          role="tooltip"
          className={resolvedClassName}
          data-state={open ? "open" : "closed"}
          data-placement={resolvedPlacement}
          data-side={side}
          data-align={align}
          style={{ ...floatingProps.style, ...(style ?? {}) }}
          onPointerEnter={pointerEnterHandler}
          onPointerMove={pointerMoveHandler}
          onPointerLeave={pointerLeaveHandler}
          {...restProps}
        >
          {children}
          {withArrow ? <TooltipArrow /> : null}
        </Component>
      </Portal>
    </TooltipArrowContext.Provider>
  );
});

export function TooltipArrow(): JSX.Element | null {
  const { arrowProps, withArrow } = useTooltipArrowContext();
  if (!withArrow || !arrowProps) return null;

  return (
    <span
      {...arrowProps}
      className={mergeClassNames("ara-tooltip__arrow")}
      data-testid="tooltip-arrow"
    ></span>
  );
}

export type TooltipProps = TooltipRootProps;
export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipTrigger>;
export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipContent>;
export type TooltipArrowProps = ComponentPropsWithoutRef<typeof TooltipArrow>;
