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
import type React from "react";
import { Slot } from "@radix-ui/react-slot";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  useDismissableLayer,
  useHoverIntent,
  useMenu,
  useMenuItem,
  useMenuTrigger,
  type HoverIntentTargetProps,
  type MenuItemRole,
  type Placement,
  type PositionStrategy,
  type UseMenuResult
} from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";
import { Portal } from "../portal/index.js";
import { usePositioner, type PositionerArrowProps } from "../positioner/index.js";

type MenuContextValue = {
  readonly menu: UseMenuResult;
  readonly parent?: MenuContextValue;
  readonly openOnHover: boolean;
  readonly closeOnSelect: boolean;
  readonly placement: Placement;
  readonly offset: number;
  readonly strategy: PositionStrategy;
  readonly loopFocus: boolean;
  readonly typeaheadTimeout: number;
  readonly portalContainer?: HTMLElement | null;
  readonly contentId: string;
  readonly setContentId: (id: string) => void;
  readonly anchorRef: MutableRefObject<HTMLElement | null>;
  readonly floatingRef: MutableRefObject<HTMLElement | null>;
  readonly setAnchor: (node: HTMLElement | null) => void;
  readonly setFloating: (node: HTMLElement | null) => void;
  readonly hoverProps?: {
    readonly anchorProps: HoverIntentTargetProps;
    readonly floatingProps: HoverIntentTargetProps;
  };
};

type MenuArrowContextValue = {
  readonly arrowProps?: PositionerArrowProps;
  readonly withArrow: boolean;
};

type MenuGroupContextValue = {
  readonly registerLabelId: (id: string | null) => void;
};

type MenuRadioGroupContextValue = {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly name?: string;
};

const MenuContext = createContext<MenuContextValue | null>(null);
const MenuArrowContext = createContext<MenuArrowContextValue | null>(null);
const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);
const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu 하위 컴포넌트는 Menu 또는 MenuSub 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

function useMenuArrowContext(): MenuArrowContextValue {
  const context = useContext(MenuArrowContext);
  if (!context) {
    throw new Error("MenuArrow는 MenuContent 또는 MenuSubContent 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

function useMenuGroupContext(): MenuGroupContextValue {
  const context = useContext(MenuGroupContext);
  if (!context) {
    throw new Error("MenuLabel은 MenuGroup 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const context = useContext(MenuRadioGroupContext);
  if (!context) {
    throw new Error("MenuRadioItem은 MenuRadioGroup 내부에서만 사용할 수 있습니다.");
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

type MenuRootProps = PropsWithChildren<{
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
  readonly openOnHover?: boolean;
  readonly closeOnSelect?: boolean;
  readonly loopFocus?: boolean;
  readonly typeaheadTimeout?: number;
  readonly portalContainer?: HTMLElement | null;
}> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

const DEFAULT_PLACEMENT: Placement = "bottom-start";
const DEFAULT_OFFSET = 6;
const DEFAULT_STRATEGY: PositionStrategy = "absolute";
const DEFAULT_TYPEAHEAD_TIMEOUT = 700;

export function Menu(props: MenuRootProps): JSX.Element {
  const {
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = DEFAULT_PLACEMENT,
    offset = DEFAULT_OFFSET,
    strategy = DEFAULT_STRATEGY,
    openOnHover = false,
    closeOnSelect = true,
    loopFocus = true,
    typeaheadTimeout = DEFAULT_TYPEAHEAD_TIMEOUT,
    portalContainer,
    className,
    style
  } = props;

  const menu = useMenu({
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect,
    loopFocus,
    typeaheadTimeout
  });

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);
  const [contentId, setContentId] = useState(menu.menuId);

  const hoverIntent = useHoverIntent({
    isOpen: menu.isOpen,
    openDelay: 150,
    closeDelay: 100,
    enableSafePolygon: false,
    anchor: anchorNode,
    floating: floatingNode,
    onOpenChange: (next) => {
      if (next) {
        menu.openMenu();
      } else {
        menu.closeMenu();
      }
    }
  });

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
    setAnchorNode(node);
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode(node);
  }, []);

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      menu,
      openOnHover,
      closeOnSelect,
      placement,
      offset,
      strategy,
      loopFocus,
      typeaheadTimeout,
      portalContainer,
      contentId,
      setContentId,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating,
      hoverProps: openOnHover
        ? { anchorProps: hoverIntent.anchorProps, floatingProps: hoverIntent.floatingProps }
        : undefined
    }),
    [
      anchorRef,
      closeOnSelect,
      contentId,
      floatingRef,
      hoverIntent.anchorProps,
      hoverIntent.floatingProps,
      offset,
      loopFocus,
      openOnHover,
      placement,
      portalContainer,
      setAnchor,
      setFloating,
      typeaheadTimeout,
      strategy,
      menu
    ]
  );

  return (
    <MenuContext.Provider value={contextValue}>
      <div className={mergeClassNames("ara-menu__root", className)} style={style}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

type MenuTriggerComponentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const MenuTrigger = forwardRef<HTMLElement, MenuTriggerComponentProps>(function MenuTrigger(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    disabled = false,
    className,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onClick,
    onKeyDown,
    ...restProps
  } = props;
  const { menu, contentId, setAnchor, hoverProps } = useMenuContext();

  const trigger = useMenuTrigger(menu, { disabled });
  const { ref: triggerRef, onClick: triggerOnClick, onKeyDown: triggerOnKeyDown, ...triggerRestProps } =
    trigger.triggerProps;

  const Component = asChild ? Slot : "button";
  const resolvedClassName = mergeClassNames("ara-menu__trigger", className);

  const composedRef = composeRefs<HTMLElement>(
    forwardedRef,
    triggerRef,
    hoverProps?.anchorProps.ref,
    setAnchor
  );

  const pointerEnterHandler = !disabled && hoverProps
    ? composeEventHandlers(hoverProps.anchorProps.onPointerEnter, onPointerEnter)
    : disabled
      ? undefined
      : onPointerEnter;
  const pointerMoveHandler = !disabled && hoverProps
    ? composeEventHandlers(hoverProps.anchorProps.onPointerMove, onPointerMove)
    : disabled
      ? undefined
      : onPointerMove;
  const pointerLeaveHandler = !disabled && hoverProps
    ? composeEventHandlers(hoverProps.anchorProps.onPointerLeave, onPointerLeave)
    : disabled
      ? undefined
      : onPointerLeave;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(triggerOnClick, onClick)(event);
    },
    [onClick, triggerOnClick]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      composeEventHandlers(triggerOnKeyDown, onKeyDown)(event);
    },
    [onKeyDown, triggerOnKeyDown]
  );

  return (
    <Component
      {...restProps}
      {...triggerRestProps}
      ref={composedRef}
      type={!asChild ? "button" : undefined}
      className={resolvedClassName}
      aria-controls={contentId}
      aria-disabled={disabled || undefined}
      data-state={menu.isOpen ? "open" : "closed"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={pointerEnterHandler}
      onPointerMove={pointerMoveHandler}
      onPointerLeave={pointerLeaveHandler}
    >
      {children}
    </Component>
  );
});

type MenuContentComponentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
  readonly withArrow?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "id" | "role"> & {
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
  };

export const MenuContent = forwardRef<HTMLDivElement, MenuContentComponentProps>(function MenuContent(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    id,
    withArrow = false,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onKeyDown,
    ...restProps
  } = props;

  const {
    menu,
    placement,
    offset,
    strategy,
    portalContainer,
    contentId,
    setContentId,
    anchorRef,
    floatingRef,
    setFloating,
    hoverProps
  } = useMenuContext();

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

  const { containerProps: dismissableContainerProps } = useDismissableLayer({
    active: menu.isOpen,
    onDismiss: (event) => {
      if (event.type === "escape-key") {
        menu.closeMenu(true);
      } else {
        menu.closeMenu();
      }
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__content", className);

  const { ref: floatingRefFromPositioner, style: floatingStyle, ...restFloatingProps } = floatingProps;

  const wrapperRef = composeRefs<HTMLDivElement>(
    floatingRefFromPositioner,
    hoverProps?.floatingProps.ref,
    setFloating,
    dismissableContainerProps.ref
  );

  const contentRef = composeRefs<HTMLDivElement>(forwardedRef);

  const pointerEnterHandler = hoverProps
    ? composeEventHandlers(hoverProps.floatingProps.onPointerEnter, onPointerEnter)
    : onPointerEnter;
  const pointerMoveHandler = hoverProps
    ? composeEventHandlers(hoverProps.floatingProps.onPointerMove, onPointerMove)
    : onPointerMove;
  const pointerLeaveHandler = hoverProps
    ? composeEventHandlers(hoverProps.floatingProps.onPointerLeave, onPointerLeave)
    : onPointerLeave;

  const { onKeyDown: menuOnKeyDown, ...menuRestProps } = menu.menuProps;

  const handleKeyDown = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onKeyDown"]>>(
    (event) => {
      menuOnKeyDown?.(event as never);
      if (event.defaultPrevented) return;
      if (event.key === "Tab") {
        menu.closeMenu();
      }
      onKeyDown?.(event);
    },
    [menuOnKeyDown, menu, onKeyDown]
  );

  const arrowContext = useMemo<MenuArrowContextValue>(
    () => ({ arrowProps, withArrow }),
    [arrowProps, withArrow]
  );

  if (!menu.isOpen) return null;

  return (
    <MenuArrowContext.Provider value={arrowContext}>
      <Portal container={portalContainer} className="ara-menu__portal">
        <div ref={wrapperRef} style={floatingStyle} {...restFloatingProps}>
          <Component
            {...restProps}
            {...menuRestProps}
            ref={contentRef}
            id={resolvedId}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            className={resolvedClassName}
            data-state={menu.isOpen ? "open" : "closed"}
            data-placement={resolvedPlacement}
            data-side={side}
            data-align={align}
            style={style}
            onPointerEnter={pointerEnterHandler}
            onPointerMove={pointerMoveHandler}
            onPointerLeave={pointerLeaveHandler}
            onKeyDown={handleKeyDown}
            {...restProps}
          >
            {children}
            {withArrow ? <MenuArrow /> : null}
          </Component>
        </div>
      </Portal>
    </MenuArrowContext.Provider>
  );
});

type MenuItemComponentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
  readonly textValue?: string;
  readonly inset?: boolean;
  readonly shortcut?: string;
  readonly onSelect?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

function MenuItemBase(
  role: MenuItemRole,
  componentClassName: string,
  extraProps?: (isHighlighted: boolean) => Record<string, unknown>
) {
  return forwardRef<HTMLElement, MenuItemComponentProps>(function MenuItem(props, forwardedRef) {
    const {
      children,
      asChild = false,
      disabled = false,
      textValue,
      inset = false,
      shortcut,
      onSelect,
      className,
      onClick,
      onKeyDown,
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onFocus,
      ...restProps
    } = props;

    const { menu, closeOnSelect } = useMenuContext();

    const { itemProps, isHighlighted } = useMenuItem<HTMLElement>(menu, {
      disabled,
      textValue,
      closeOnSelect,
      role,
      onSelect
    });

    const Component = asChild ? Slot : "div";
    const resolvedClassName = mergeClassNames(componentClassName, className);

    const clickHandler = composeEventHandlers(itemProps.onClick, onClick);
    const keyDownHandler = composeEventHandlers(itemProps.onKeyDown, onKeyDown);
    const pointerEnterHandler = composeEventHandlers(itemProps.onPointerEnter, onPointerEnter);
    const pointerMoveHandler = composeEventHandlers(itemProps.onPointerMove, onPointerMove);
    const pointerLeaveHandler = composeEventHandlers(itemProps.onPointerLeave, onPointerLeave);
    const focusHandler = composeEventHandlers(itemProps.onFocus, onFocus);

    return (
      <Component
        {...restProps}
        {...itemProps}
        ref={forwardedRef}
        className={resolvedClassName}
        data-highlighted={isHighlighted ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-inset={inset ? "true" : undefined}
        onClick={clickHandler}
        onKeyDown={keyDownHandler}
        onPointerEnter={pointerEnterHandler}
        onPointerMove={pointerMoveHandler}
        onPointerLeave={pointerLeaveHandler}
        onFocus={focusHandler}
        {...extraProps?.(isHighlighted)}
      >
        <span className="ara-menu__item-label">{children}</span>
        {shortcut ? <span className="ara-menu__item-shortcut">{shortcut}</span> : null}
      </Component>
    );
  });
}

export const MenuItem = MenuItemBase("menuitem", "ara-menu__item");

type MenuCheckboxItemProps = MenuItemComponentProps & {
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
};

export const MenuCheckboxItem = forwardRef<HTMLElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  props,
  forwardedRef
) {
  const { checked, onCheckedChange, onSelect, ...restProps } = props;

  const handleSelect = useCallback<MenuCheckboxItemProps["onSelect"]>(
    (event) => {
      onSelect?.(event);
      onCheckedChange(!checked);
    },
    [checked, onCheckedChange, onSelect]
  );

  const Base = useMemo(() => MenuItemBase("menuitemcheckbox", "ara-menu__checkbox-item"), []);

  return (
    <Base
      {...restProps}
      ref={forwardedRef}
      aria-checked={checked}
      data-checked={checked ? "true" : undefined}
      onSelect={handleSelect}
    />
  );
});

type MenuRadioGroupProps = PropsWithChildren<{
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly name?: string;
  readonly asChild?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const MenuRadioGroup = forwardRef<HTMLElement, MenuRadioGroupProps>(function MenuRadioGroup(
  props,
  forwardedRef
) {
  const { children, value, onValueChange, name, asChild = false, className, ...restProps } = props;

  const contextValue = useMemo<MenuRadioGroupContextValue>(
    () => ({ value, onValueChange, name }),
    [name, onValueChange, value]
  );

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__radio-group", className);

  return (
    <MenuRadioGroupContext.Provider value={contextValue}>
      <Component ref={forwardedRef} role="group" className={resolvedClassName} {...restProps}>
        {children}
      </Component>
    </MenuRadioGroupContext.Provider>
  );
});

type MenuRadioItemProps = MenuItemComponentProps & {
  readonly value: string;
};

export const MenuRadioItem = forwardRef<HTMLElement, MenuRadioItemProps>(function MenuRadioItem(
  props,
  forwardedRef
) {
  const { value, onSelect, ...restProps } = props;
  const radioGroup = useMenuRadioGroupContext();
  const checked = radioGroup.value === value;

  const handleSelect = useCallback<MenuRadioItemProps["onSelect"]>(
    (event) => {
      onSelect?.(event);
      if (!checked) {
        radioGroup.onValueChange(value);
      }
    },
    [checked, onSelect, radioGroup, value]
  );

  const Base = useMemo(() => MenuItemBase("menuitemradio", "ara-menu__radio-item"), []);

  return (
    <Base
      {...restProps}
      ref={forwardedRef}
      aria-checked={checked}
      data-checked={checked ? "true" : undefined}
      onSelect={handleSelect}
    />
  );
});

type MenuGroupProps = PropsWithChildren<{
  readonly asChild?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const MenuGroup = forwardRef<HTMLElement, MenuGroupProps>(function MenuGroup(props, forwardedRef) {
  const { children, asChild = false, className, ...restProps } = props;

  const [labelId, setLabelId] = useState<string | null>(null);

  const contextValue = useMemo<MenuGroupContextValue>(() => ({ registerLabelId: setLabelId }), []);

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__group", className);

  return (
    <MenuGroupContext.Provider value={contextValue}>
      <Component ref={forwardedRef} role="group" aria-labelledby={labelId ?? undefined} className={resolvedClassName} {...restProps}>
        {children}
      </Component>
    </MenuGroupContext.Provider>
  );
});

type MenuLabelProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const MenuLabel = forwardRef<HTMLElement, MenuLabelProps>(function MenuLabel(props, forwardedRef) {
  const { children, asChild = false, id, className, ...restProps } = props;
  const group = useMenuGroupContext();

  const reactId = useId();
  const resolvedId = useMemo(() => id ?? `ara-menu-label-${reactId.replace(/:/g, "-")}`, [id, reactId]);

  useEffect(() => {
    group.registerLabelId(resolvedId);
    return () => group.registerLabelId(null);
  }, [group, resolvedId]);

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__label", className);

  return (
    <Component ref={forwardedRef} id={resolvedId} className={resolvedClassName} {...restProps}>
      {children}
    </Component>
  );
});

export const MenuSeparator = forwardRef<HTMLElement, ComponentPropsWithoutRef<"div">>(function MenuSeparator(
  props,
  forwardedRef
) {
  const { className, ...restProps } = props;
  const resolvedClassName = mergeClassNames("ara-menu__separator", className);

  return (
    <div
      {...restProps}
      ref={forwardedRef}
      role="separator"
      aria-orientation="horizontal"
      className={resolvedClassName}
    />
  );
});

export function MenuArrow(): JSX.Element | null {
  const { arrowProps, withArrow } = useMenuArrowContext();
  if (!withArrow || !arrowProps) return null;

  return <span {...arrowProps} className={mergeClassNames("ara-menu__arrow")} data-testid="menu-arrow" />;
}

type MenuSubProps = PropsWithChildren<{
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
}> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

const DEFAULT_SUB_PLACEMENT: Placement = "right-start";

export function MenuSub(props: MenuSubProps): JSX.Element {
  const { children, placement = DEFAULT_SUB_PLACEMENT, offset, strategy, className, style } = props;
  const parentContext = useMenuContext();

  const menu = useMenu({
    closeOnSelect: parentContext.closeOnSelect,
    loopFocus: parentContext.loopFocus,
    typeaheadTimeout: parentContext.typeaheadTimeout
  });

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);
  const [contentId, setContentId] = useState(menu.menuId);

  const hoverIntent = useHoverIntent({
    isOpen: menu.isOpen,
    openDelay: 150,
    closeDelay: 150,
    enableSafePolygon: true,
    anchor: anchorNode,
    floating: floatingNode,
    onOpenChange: (next) => {
      if (next) {
        menu.openMenu();
      } else {
        menu.closeMenu();
      }
    }
  });

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
    setAnchorNode(node);
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode(node);
  }, []);

  useEffect(() => {
    if (!parentContext.menu.isOpen && menu.isOpen) {
      menu.closeMenu();
    }
  }, [menu.closeMenu, menu.isOpen, parentContext.menu.isOpen]);

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      menu,
      parent: parentContext,
      openOnHover: true,
      closeOnSelect: parentContext.closeOnSelect,
      placement,
      offset: offset ?? parentContext.offset,
      strategy: strategy ?? parentContext.strategy,
      loopFocus: parentContext.loopFocus,
      typeaheadTimeout: parentContext.typeaheadTimeout,
      portalContainer: parentContext.portalContainer,
      contentId,
      setContentId,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating,
      hoverProps: {
        anchorProps: hoverIntent.anchorProps,
        floatingProps: hoverIntent.floatingProps
      }
    }),
    [
      anchorRef,
      contentId,
      floatingRef,
      hoverIntent.anchorProps,
      hoverIntent.floatingProps,
      menu,
      offset,
      parentContext,
      placement,
      parentContext.loopFocus,
      parentContext.typeaheadTimeout,
      setAnchor,
      setFloating,
      strategy
    ]
  );

  return (
    <MenuContext.Provider value={contextValue}>
      <div className={mergeClassNames("ara-menu__sub", className)} style={style}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

type MenuSubTriggerProps = MenuItemComponentProps;

export const MenuSubTrigger = forwardRef<HTMLElement, MenuSubTriggerProps>(function MenuSubTrigger(
  props,
  forwardedRef
) {
  const {
    children,
    disabled = false,
    textValue,
    shortcut,
    className,
    onClick,
    onKeyDown: userKeyDown,
    onFocus,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...restProps
  } = props;
  const context = useMenuContext();
  const parentMenu = context.parent;

  if (!parentMenu) {
    throw new Error("MenuSubTrigger는 MenuSub 내부에서만 사용할 수 있습니다.");
  }

  const { itemProps, isHighlighted } = useMenuItem<HTMLElement>(parentMenu.menu, {
    disabled,
    textValue,
    closeOnSelect: false,
    role: "menuitem",
    onSelect: () => {
      context.menu.openMenu("first");
    }
  });

  const Component = props.asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__sub-trigger", className);

  const handleKeyDown = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onKeyDown"]>>(
    (event) => {
      if (disabled) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        context.menu.openMenu("first");
        return;
      }

      if ((event.key === "ArrowLeft" || event.key === "Escape") && context.menu.isOpen) {
        event.preventDefault();
        context.menu.closeMenu(true);
        return;
      }

      itemProps.onKeyDown(event);
      userKeyDown?.(event);
    },
    [context.menu, disabled, itemProps, userKeyDown]
  );

  const clickHandler = composeEventHandlers(itemProps.onClick, onClick);

  const focusHandler = composeEventHandlers(itemProps.onFocus, onFocus);

  const pointerEnterHandler =
    !disabled && context.hoverProps
      ? composeEventHandlers(context.hoverProps.anchorProps.onPointerEnter, onPointerEnter)
      : disabled
        ? undefined
        : onPointerEnter;

  const pointerMoveFromItem = composeEventHandlers(itemProps.onPointerMove, onPointerMove);
  const pointerMoveHandler =
    !disabled && context.hoverProps
      ? composeEventHandlers(context.hoverProps.anchorProps.onPointerMove, pointerMoveFromItem)
      : disabled
        ? undefined
        : pointerMoveFromItem;
  const pointerLeaveHandler =
    !disabled && context.hoverProps
      ? composeEventHandlers(context.hoverProps.anchorProps.onPointerLeave, onPointerLeave)
      : disabled
        ? undefined
        : onPointerLeave;

  return (
    <Component
      {...restProps}
      {...itemProps}
      ref={composeRefs(forwardedRef, itemProps.ref, context.hoverProps?.anchorProps.ref, context.setAnchor)}
      className={resolvedClassName}
      aria-haspopup="menu"
      aria-expanded={context.menu.isOpen}
      data-highlighted={isHighlighted ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-submenu-open={context.menu.isOpen ? "true" : undefined}
      onClick={clickHandler}
      onKeyDown={handleKeyDown}
      onFocus={focusHandler}
      onPointerEnter={pointerEnterHandler}
      onPointerMove={pointerMoveHandler}
      onPointerLeave={pointerLeaveHandler}
    >
      <span className="ara-menu__item-label">{children}</span>
      <span className="ara-menu__item-shortcut">{shortcut}</span>
    </Component>
  );
});

type MenuSubContentProps = ComponentPropsWithoutRef<typeof MenuContent>;

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(function MenuSubContent(
  props,
  forwardedRef
) {
  return <MenuContent {...props} ref={forwardedRef} />;
});

export type MenuProps = MenuRootProps;
export type MenuTriggerProps = ComponentPropsWithoutRef<typeof MenuTrigger>;
export type MenuContentProps = ComponentPropsWithoutRef<typeof MenuContent>;
export type MenuItemProps = ComponentPropsWithoutRef<typeof MenuItem>;
export type MenuCheckboxItemProps = ComponentPropsWithoutRef<typeof MenuCheckboxItem>;
export type MenuRadioGroupProps = ComponentPropsWithoutRef<typeof MenuRadioGroup>;
export type MenuRadioItemProps = ComponentPropsWithoutRef<typeof MenuRadioItem>;
export type MenuGroupProps = ComponentPropsWithoutRef<typeof MenuGroup>;
export type MenuLabelProps = ComponentPropsWithoutRef<typeof MenuLabel>;
export type MenuSeparatorProps = ComponentPropsWithoutRef<typeof MenuSeparator>;
export type MenuArrowProps = ComponentPropsWithoutRef<typeof MenuArrow>;
export type MenuSubProps = ComponentPropsWithoutRef<typeof MenuSub>;
export type MenuSubTriggerProps = ComponentPropsWithoutRef<typeof MenuSubTrigger>;
export type MenuSubContentProps = ComponentPropsWithoutRef<typeof MenuSubContent>;
