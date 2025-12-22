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
  useAriaHidden,
  useDismissableLayer,
  useFocusTrap,
  type DismissableLayerEvent,
  type Placement,
  type PositionStrategy
} from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";
import { Portal } from "../portal/index.js";
import { usePositioner, type PositionerArrowProps } from "../positioner/index.js";

type PopoverContextValue = {
  readonly open: boolean;
  readonly placement: Placement;
  readonly offset: number;
  readonly strategy: PositionStrategy;
  readonly withArrow: boolean;
  readonly modal: boolean;
  readonly closeOnEscape: boolean;
  readonly closeOnInteractOutside: boolean;
  readonly closeOnFocusOutside: boolean;
  readonly returnFocusOnClose: boolean;
  readonly portalContainer?: HTMLElement | null;
  readonly contentId: string;
  readonly headerId: string | null;
  readonly bodyId: string | null;
  readonly setContentId: (id: string) => void;
  readonly registerHeaderId: (id: string | null) => void;
  readonly registerBodyId: (id: string | null) => void;
  readonly setOpen: (next: boolean) => void;
  readonly anchorRef: MutableRefObject<HTMLElement | null>;
  readonly floatingRef: MutableRefObject<HTMLElement | null>;
  readonly setAnchor: (node: HTMLElement | null) => void;
  readonly setFloating: (node: HTMLElement | null) => void;
};

type PopoverArrowContextValue = {
  readonly arrowProps?: PositionerArrowProps;
  readonly withArrow: boolean;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);
const PopoverArrowContext = createContext<PopoverArrowContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover 하위 컴포넌트는 Popover 안에서만 사용할 수 있습니다.");
  }
  return context;
}

function usePopoverArrowContext(): PopoverArrowContextValue {
  const context = useContext(PopoverArrowContext);
  if (!context) {
    throw new Error("PopoverArrow는 PopoverContent 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

function composeEventHandlers<Event>(
  first: ((event: Event) => void) | undefined,
  second: ((event: Event) => void) | undefined
): (event: Event) => void {
  if (!first && !second) return () => {};
  return (event: Event) => {
    first?.(event);
    second?.(event);
  };
}

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align];
  return { side, align };
}

type PopoverRootProps = PropsWithChildren<{
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
  readonly withArrow?: boolean;
  readonly modal?: boolean;
  readonly closeOnEscape?: boolean;
  readonly closeOnInteractOutside?: boolean;
  readonly closeOnFocusOutside?: boolean;
  readonly returnFocusOnClose?: boolean;
  readonly portalContainer?: HTMLElement | null;
}> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

const DEFAULT_PLACEMENT: Placement = "bottom-start";
const DEFAULT_OFFSET = 8;
const DEFAULT_STRATEGY: PositionStrategy = "absolute";

export function Popover(props: PopoverRootProps): JSX.Element {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = DEFAULT_PLACEMENT,
    offset = DEFAULT_OFFSET,
    strategy = DEFAULT_STRATEGY,
    withArrow = false,
    modal = false,
    closeOnEscape = true,
    closeOnInteractOutside = true,
    closeOnFocusOutside = true,
    returnFocusOnClose = true,
    portalContainer,
    className,
    style
  } = props;

  const reactId = useId();
  const generatedId = useMemo(() => `ara-popover-${reactId.replace(/:/g, "-")}`, [reactId]);
  const [contentId, setContentId] = useState(generatedId);
  const [headerId, setHeaderId] = useState<string | null>(null);
  const [bodyId, setBodyId] = useState<string | null>(null);

  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const previousOpenRef = useRef(open);
  useEffect(() => {
    if (previousOpenRef.current && !open && returnFocusOnClose) {
      anchorRef.current?.focus({ preventScroll: true });
    }
    previousOpenRef.current = open;
  }, [open, returnFocusOnClose]);

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
  }, []);

  const registerHeaderId = useCallback((id: string | null) => setHeaderId(id), []);
  const registerBodyId = useCallback((id: string | null) => setBodyId(id), []);

  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      open,
      placement,
      offset,
      strategy,
      withArrow,
      modal,
      closeOnEscape,
      closeOnInteractOutside,
      closeOnFocusOutside,
      returnFocusOnClose,
      portalContainer,
      contentId,
      headerId,
      bodyId,
      setContentId,
      registerHeaderId,
      registerBodyId,
      setOpen: handleOpenChange,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating
    }),
    [
      bodyId,
      closeOnEscape,
      closeOnFocusOutside,
      closeOnInteractOutside,
      contentId,
      handleOpenChange,
      headerId,
      modal,
      offset,
      open,
      placement,
      portalContainer,
      registerBodyId,
      registerHeaderId,
      returnFocusOnClose,
      strategy,
      withArrow
    ]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className={mergeClassNames("ara-popover__root", className)} style={style}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(function PopoverTrigger(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    disabled = false,
    className,
    onClick,
    onKeyDown,
    ...restProps
  } = props;

  const { open, contentId, setOpen, setAnchor } = usePopoverContext();

  const Component = asChild ? Slot : "button";
  const resolvedClassName = mergeClassNames("ara-popover__trigger", className);

  const composedRef = composeRefs<HTMLElement>(forwardedRef, setAnchor);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(!open);
  }, [disabled, open, setOpen]);

  const handleClick = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onClick"]>>(
    (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggleOpen();
    },
    [onClick, toggleOpen]
  );

  const handleKeyDown = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onKeyDown"]>>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleOpen();
      }
    },
    [onKeyDown, toggleOpen]
  );

  return (
    <Component
      ref={composedRef}
      type={!asChild ? "button" : undefined}
      className={resolvedClassName}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      aria-disabled={disabled || undefined}
      data-state={open ? "open" : "closed"}
      disabled={!asChild ? disabled : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...restProps}
    >
      {children}
    </Component>
  );
});

type PopoverContentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
}> &
  Omit<
    HTMLAttributes<HTMLElement>,
    "children" | "id" | "role" | "aria-label" | "aria-labelledby" | "aria-describedby"
  > & {
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
    readonly "aria-describedby"?: string;
  };

export const PopoverContent = forwardRef<HTMLElement, PopoverContentProps>(function PopoverContent(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    id,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    onPointerDown,
    onFocus,
    ...restProps
  } = props;

  const {
    open,
    placement,
    offset,
    strategy,
    withArrow,
    modal,
    closeOnEscape,
    closeOnInteractOutside,
    closeOnFocusOutside,
    returnFocusOnClose,
    portalContainer,
    contentId,
    headerId,
    bodyId,
    setContentId,
    setOpen,
    anchorRef,
    floatingRef,
    setFloating
  } = usePopoverContext();

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

  const {
    containerProps: focusTrapContainerProps,
    beforeFocusGuardProps,
    afterFocusGuardProps
  } = useFocusTrap({
    active: open && modal,
    restoreFocus: returnFocusOnClose
  });

  const { containerProps: ariaHiddenContainerProps } = useAriaHidden({
    active: open && modal,
    inert: true
  });

  const { containerProps: dismissableContainerProps } = useDismissableLayer({
    active: open,
    onDismiss: (event: DismissableLayerEvent) => {
      if (event.type === "escape-key" && !closeOnEscape) return;
      if (event.type === "pointer-down-outside" && !closeOnInteractOutside) return;
      if (event.type === "focus-outside" && !closeOnFocusOutside) return;
      setOpen(false);
    },
    onPointerDownOutside: (event) => {
      if (!closeOnInteractOutside) {
        event.preventDefault();
      }
    },
    onFocusOutside: (event) => {
      if (!closeOnFocusOutside) {
        event.preventDefault();
      }
    }
  });

  const { ref: positionerFloatingRef, style: floatingStyle, ...restFloatingProps } = floatingProps;

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-popover", className);

  const wrapperRef = composeRefs<HTMLElement>(
    positionerFloatingRef,
    setFloating,
    focusTrapContainerProps.ref,
    ariaHiddenContainerProps.ref,
    dismissableContainerProps.ref
  );

  const contentRef = composeRefs<HTMLElement>(forwardedRef);

  const labelledBy = useMemo(() => {
    const ids = [ariaLabelledby, headerId].filter(Boolean).join(" ");
    return ids.length > 0 ? ids : undefined;
  }, [ariaLabelledby, headerId]);

  const describedBy = useMemo(() => {
    const ids = [ariaDescribedby, bodyId].filter(Boolean).join(" ");
    return ids.length > 0 ? ids : undefined;
  }, [ariaDescribedby, bodyId]);

  const focusGuardStyle = useMemo(
    () => ({ position: "fixed", width: 0, height: 0, padding: 0, margin: 0, outline: "none", opacity: 0 }),
    []
  );

  const arrowContext = useMemo<PopoverArrowContextValue>(() => ({ arrowProps, withArrow }), [arrowProps, withArrow]);

  if (!open) return null;

  return (
    <PopoverArrowContext.Provider value={arrowContext}>
      <Portal container={portalContainer} className="ara-popover__portal">
        <div ref={wrapperRef} style={floatingStyle} {...restFloatingProps}>
          {modal ? <span {...beforeFocusGuardProps} style={focusGuardStyle} /> : null}
          <Component
            ref={contentRef}
            id={resolvedId}
            role="dialog"
            aria-modal={modal || undefined}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            className={resolvedClassName}
            data-state={open ? "open" : "closed"}
            data-placement={resolvedPlacement}
            data-side={side}
            data-align={align}
            data-modal={modal ? "true" : undefined}
            style={style}
            onPointerDown={composeEventHandlers(onPointerDown, restProps.onPointerDown)}
            onFocus={composeEventHandlers(onFocus, restProps.onFocus)}
            {...restProps}
          >
            {children}
            {withArrow ? <PopoverArrow /> : null}
          </Component>
          {modal ? <span {...afterFocusGuardProps} style={focusGuardStyle} /> : null}
        </div>
      </Portal>
    </PopoverArrowContext.Provider>
  );
});

export function PopoverArrow(): JSX.Element | null {
  const { arrowProps, withArrow } = usePopoverArrowContext();
  if (!withArrow || !arrowProps) return null;

  return <span {...arrowProps} className={mergeClassNames("ara-popover__arrow")} data-testid="popover-arrow" />;
}

type PopoverCloseProps = PropsWithChildren<{
  readonly asChild?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const PopoverClose = forwardRef<HTMLElement, PopoverCloseProps>(function PopoverClose(props, forwardedRef) {
  const { children, asChild = false, className, onClick, ...restProps } = props;
  const { setOpen } = usePopoverContext();

  const Component = asChild ? Slot : "button";
  const resolvedClassName = mergeClassNames("ara-popover__close", className);

  const handleClick = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onClick"]>>(
    (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(false);
    },
    [onClick, setOpen]
  );

  return (
    <Component
      ref={forwardedRef}
      type={!asChild ? "button" : undefined}
      className={resolvedClassName}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </Component>
  );
});

type PopoverSectionProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const PopoverHeader = forwardRef<HTMLElement, PopoverSectionProps>(function PopoverHeader(
  props,
  forwardedRef
) {
  const { children, asChild = false, id, className, ...restProps } = props;
  const { registerHeaderId } = usePopoverContext();
  const reactId = useId();
  const resolvedId = id ?? `ara-popover-header-${reactId.replace(/:/g, "-")}`;

  useEffect(() => {
    registerHeaderId(resolvedId);
    return () => registerHeaderId(null);
  }, [registerHeaderId, resolvedId]);

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-popover__header", className);

  return (
    <Component ref={forwardedRef} id={resolvedId} className={resolvedClassName} {...restProps}>
      {children}
    </Component>
  );
});

export const PopoverBody = forwardRef<HTMLElement, PopoverSectionProps>(function PopoverBody(props, forwardedRef) {
  const { children, asChild = false, id, className, ...restProps } = props;
  const { registerBodyId } = usePopoverContext();
  const reactId = useId();
  const resolvedId = id ?? `ara-popover-body-${reactId.replace(/:/g, "-")}`;

  useEffect(() => {
    registerBodyId(resolvedId);
    return () => registerBodyId(null);
  }, [registerBodyId, resolvedId]);

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-popover__body", className);

  return (
    <Component ref={forwardedRef} id={resolvedId} className={resolvedClassName} {...restProps}>
      {children}
    </Component>
  );
});

export const PopoverFooter = forwardRef<HTMLElement, PropsWithChildren<Omit<PopoverSectionProps, "id">>>(
  function PopoverFooter(props, forwardedRef) {
    const { children, asChild = false, className, ...restProps } = props;

    const Component = asChild ? Slot : "div";
    const resolvedClassName = mergeClassNames("ara-popover__footer", className);

    return (
      <Component ref={forwardedRef} className={resolvedClassName} {...restProps}>
        {children}
      </Component>
    );
  }
);

export type PopoverProps = PopoverRootProps;
export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverTrigger>;
export type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverContent>;
export type PopoverArrowProps = ComponentPropsWithoutRef<typeof PopoverArrow>;
export type PopoverCloseProps = ComponentPropsWithoutRef<typeof PopoverClose>;
export type PopoverHeaderProps = ComponentPropsWithoutRef<typeof PopoverHeader>;
export type PopoverBodyProps = ComponentPropsWithoutRef<typeof PopoverBody>;
export type PopoverFooterProps = ComponentPropsWithoutRef<typeof PopoverFooter>;
