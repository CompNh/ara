import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PropsWithChildren
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  useDismissableLayer,
  useHoverIntent,
  useMenu as useCoreMenu,
  useMenuItem,
  useMenuTrigger,
  type Placement,
  type PositionStrategy,
  type UseMenuResult
} from "@ara/core";

import { mergeClassNames } from "../layout/shared.js";
import { Portal } from "../portal/index.js";
import { usePositioner, type PositionerArrowProps } from "../positioner/index.js";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split("-") as [Side, Align];
  return { side, align };
}

function composeEventHandlers<Event extends { defaultPrevented?: boolean }>(
  userHandler: ((event: Event) => void) | undefined,
  ourHandler: ((event: Event) => void) | undefined
): (event: Event) => void {
  return (event) => {
    userHandler?.(event);
    if (event.defaultPrevented) return;
    ourHandler?.(event);
  };
}

type MenuContextValue = {
  readonly menu: UseMenuResult;
  readonly placement: Placement;
  readonly offset: number;
  readonly strategy: PositionStrategy;
  readonly openOnHover: boolean;
  readonly closeOnSelect: boolean;
  readonly loopFocus: boolean;
  readonly typeaheadTimeout?: number;
  readonly portalContainer?: HTMLElement | null;
  readonly anchorRef: MutableRefObject<HTMLElement | null>;
  readonly floatingRef: MutableRefObject<HTMLElement | null>;
  readonly setAnchor: (node: HTMLElement | null) => void;
  readonly setFloating: (node: HTMLElement | null) => void;
  readonly hoverIntent: ReturnType<typeof useHoverIntent>;
  readonly isSubmenu: boolean;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu 하위 컴포넌트는 Menu 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

type MenuParentContextValue = MenuContextValue | null;
const MenuParentContext = createContext<MenuParentContextValue>(null);

function useMenuParentContext(): MenuParentContextValue {
  return useContext(MenuParentContext);
}

type MenuRootContextValue = {
  readonly closeRootMenu: (focusTrigger?: boolean) => void;
  readonly closeOnSelect: boolean;
  readonly rootMenuId: string;
};

const MenuRootContext = createContext<MenuRootContextValue | null>(null);

function useMenuRootContext(): MenuRootContextValue {
  const context = useContext(MenuRootContext);
  if (!context) {
    throw new Error("Menu 컴포넌트는 루트 Menu 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

type MenuContentContextValue = {
  readonly arrowProps?: PositionerArrowProps;
  readonly placement: Placement;
  readonly side: Side;
  readonly align: Align;
};

const MenuContentContext = createContext<MenuContentContextValue | null>(null);

function useMenuContentContext(): MenuContentContextValue {
  const context = useContext(MenuContentContext);
  if (!context) {
    throw new Error("MenuArrow는 MenuContent 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

type MenuGroupContextValue = {
  readonly labelId: string | null;
  readonly registerLabelId: (id: string | null) => void;
};

const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);

function useMenuGroupContext(): MenuGroupContextValue | null {
  return useContext(MenuGroupContext);
}

type MenuProps = PropsWithChildren<{
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

export function Menu(props: MenuProps): JSX.Element {
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
    typeaheadTimeout,
    portalContainer,
    className,
    style
  } = props;

  const menu = useCoreMenu({
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

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
    setAnchorNode(node);
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode(node);
  }, []);

  const hoverIntent = useHoverIntent({
    isOpen: menu.isOpen,
    anchor: anchorNode,
    floating: floatingNode,
    onOpenChange: (next) => {
      if (!openOnHover) return;
      if (next) {
        menu.openMenu();
      } else {
        menu.closeMenu();
      }
    }
  });

  const rootContextValue = useMemo<MenuRootContextValue>(
    () => ({
      closeRootMenu: (focusTrigger = true) => menu.closeMenu(focusTrigger),
      closeOnSelect,
      rootMenuId: menu.menuId
    }),
    [closeOnSelect, menu]
  );

  const menuContextValue = useMemo<MenuContextValue>(
    () => ({
      menu,
      placement,
      offset,
      strategy,
      openOnHover,
      closeOnSelect,
      loopFocus,
      typeaheadTimeout,
      portalContainer,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating,
      hoverIntent,
      isSubmenu: false
    }),
    [
      anchorRef,
      closeOnSelect,
      floatingRef,
      hoverIntent,
      loopFocus,
      menu,
      offset,
      openOnHover,
      placement,
      portalContainer,
      setAnchor,
      setFloating,
      strategy,
      typeaheadTimeout
    ]
  );

  return (
    <MenuRootContext.Provider value={rootContextValue}>
      <MenuParentContext.Provider value={null}>
        <MenuContext.Provider value={menuContextValue}>
          <div className={mergeClassNames("ara-menu__root", className)} style={style}>
            {children}
          </div>
        </MenuContext.Provider>
      </MenuParentContext.Provider>
    </MenuRootContext.Provider>
  );
}

type MenuTriggerProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children">;

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(
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
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...restProps
  } = props;

  const { menu, setAnchor, openOnHover, hoverIntent } = useMenuContext();
  const { triggerProps } = useMenuTrigger(menu, { disabled });

  const Component = asChild ? Slot : "button";
  const resolvedClassName = mergeClassNames("ara-menu__trigger", className);

  const pointerHandlers = openOnHover && !disabled ? hoverIntent.anchorProps : undefined;

  const composedRef = composeRefs<HTMLButtonElement>(
    forwardedRef,
    triggerProps.ref,
    setAnchor,
    pointerHandlers?.ref
  );

  return (
    <Component
      ref={composedRef}
      type={!asChild ? "button" : undefined}
      {...restProps}
      id={restProps.id ?? triggerProps.id}
      role={triggerProps.role}
      tabIndex={restProps.tabIndex ?? triggerProps.tabIndex}
      aria-haspopup="menu"
      aria-expanded={menu.isOpen}
      aria-controls={menu.menuId}
      aria-disabled={disabled || undefined}
      data-state={menu.isOpen ? "open" : "closed"}
      data-disabled={disabled ? "true" : undefined}
      disabled={!asChild ? disabled : undefined}
      onClick={composeEventHandlers(onClick, triggerProps.onClick)}
      onKeyDown={composeEventHandlers(onKeyDown, triggerProps.onKeyDown)}
      onPointerEnter={composeEventHandlers(onPointerEnter, pointerHandlers?.onPointerEnter)}
      onPointerMove={composeEventHandlers(onPointerMove, pointerHandlers?.onPointerMove)}
      onPointerLeave={composeEventHandlers(onPointerLeave, pointerHandlers?.onPointerLeave)}
      className={resolvedClassName}
    >
      {children}
    </Component>
  );
});

type MenuContentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
  readonly withArrow?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "id" | "role"> & {
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
  };

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
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
    onKeyDown,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...restProps
  } = props;

  const {
    menu,
    placement,
    offset,
    strategy,
    portalContainer,
    anchorRef,
    floatingRef,
    setFloating,
    hoverIntent,
    openOnHover
  } = useMenuContext();
  const rootContext = useMenuRootContext();

  const { floatingProps, arrowProps, placement: resolvedPlacement } = usePositioner({
    anchorRef,
    floatingRef,
    placement,
    offset,
    strategy,
    withArrow
  });

  const { side, align } = parsePlacement(resolvedPlacement);

  const { containerProps: dismissableProps } = useDismissableLayer({
    active: menu.isOpen,
    onDismiss: () => rootContext.closeRootMenu(true),
    onPointerDownOutside: (event) => {
      event.preventDefault();
    },
    onFocusOutside: () => {
      rootContext.closeRootMenu(true);
    }
  });

  const pointerHandlers = openOnHover ? hoverIntent.floatingProps : undefined;

  const labelledBy = useMemo(() => {
    const fallbackLabel = `${menu.menuId}-trigger`;
    return (ariaLabelledby ?? fallbackLabel) || undefined;
  }, [ariaLabelledby, menu.menuId]);

  const handleKeyDown = useCallback<NonNullable<HTMLAttributes<HTMLElement>["onKeyDown"]>>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Tab") {
        rootContext.closeRootMenu(false);
        return;
      }

      menu.menuProps.onKeyDown(event as ReactKeyboardEvent<HTMLElement>);
    },
    [menu.menuProps, onKeyDown, rootContext]
  );

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__content", className);

  const { ref: floatingNodeRef, style: floatingStyle, ...restFloatingProps } = floatingProps;

  const composedRef = composeRefs<HTMLDivElement>(
    forwardedRef,
    floatingNodeRef,
    setFloating,
    dismissableProps.ref,
    pointerHandlers?.ref
  );

  const contentContext = useMemo<MenuContentContextValue>(
    () => ({ arrowProps, placement: resolvedPlacement, side, align }),
    [align, arrowProps, resolvedPlacement, side]
  );

  if (!menu.isOpen) return null;

  return (
    <MenuContentContext.Provider value={contentContext}>
      <Portal container={portalContainer} className="ara-menu__portal">
        <Component
          {...restProps}
          {...restFloatingProps}
          ref={composedRef}
          id={id ?? menu.menuId}
          role={menu.menuProps.role}
          tabIndex={menu.menuProps.tabIndex}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? ariaLabelledby : labelledBy}
          aria-activedescendant={menu.menuProps["aria-activedescendant"]}
          hidden={menu.menuProps.hidden}
          data-state={menu.isOpen ? "open" : "closed"}
          data-side={side}
          data-align={align}
          className={resolvedClassName}
          style={{ ...floatingStyle, ...style }}
          onKeyDown={handleKeyDown}
          onPointerEnter={composeEventHandlers(onPointerEnter, pointerHandlers?.onPointerEnter)}
          onPointerMove={composeEventHandlers(onPointerMove, pointerHandlers?.onPointerMove)}
          onPointerLeave={composeEventHandlers(onPointerLeave, pointerHandlers?.onPointerLeave)}
        >
          {children}
        </Component>
      </Portal>
    </MenuContentContext.Provider>
  );
});

export function MenuArrow(): JSX.Element | null {
  const { arrowProps, side, align } = useMenuContentContext();
  if (!arrowProps) return null;

  return <span {...arrowProps} className={mergeClassNames("ara-menu__arrow")} data-side={side} data-align={align} />;
}

type BaseMenuItemProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
  readonly inset?: boolean;
  readonly shortcut?: string;
  readonly textValue?: string;
  readonly closeOnSelect?: boolean;
  readonly onSelect?: (event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>) => void;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "role">;

function useResolvedCloseOnSelect(menu: UseMenuResult, closeOnSelect?: boolean): {
  shouldCloseRoot: boolean;
  shouldCloseCurrentMenu: boolean;
} {
  const { closeOnSelect: rootCloseOnSelect, rootMenuId } = useMenuRootContext();
  const resolved = closeOnSelect ?? rootCloseOnSelect;
  const isRootMenu = menu.menuId === rootMenuId;

  return {
    shouldCloseRoot: resolved && !isRootMenu,
    shouldCloseCurrentMenu: resolved && isRootMenu
  };
}

export const MenuItem = forwardRef<HTMLDivElement, BaseMenuItemProps>(function MenuItem(props, forwardedRef) {
  const {
    children,
    asChild = false,
    disabled = false,
    inset = false,
    shortcut,
    textValue,
    closeOnSelect,
    onSelect,
    className,
    ...restProps
  } = props;

  const { menu } = useMenuContext();
  const { closeRootMenu } = useMenuRootContext();
  const { shouldCloseCurrentMenu, shouldCloseRoot } = useResolvedCloseOnSelect(menu, closeOnSelect);

  const { itemProps, isHighlighted } = useMenuItem(menu, {
    disabled,
    closeOnSelect: shouldCloseCurrentMenu,
    textValue,
    onSelect: (event) => {
      onSelect?.(event);
      if (event.defaultPrevented) return;
      if (shouldCloseRoot) {
        closeRootMenu(true);
      }
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__item", inset && "ara-menu__item--inset", className);

  return (
    <Component
      {...restProps}
      {...itemProps}
      ref={composeRefs(forwardedRef, itemProps.ref)}
      role="menuitem"
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "true" : undefined}
      data-highlighted={isHighlighted ? "true" : undefined}
      className={resolvedClassName}
    >
      <span className="ara-menu__label">{children}</span>
      {shortcut ? <span className="ara-menu__shortcut">{shortcut}</span> : null}
    </Component>
  );
});

type MenuCheckboxItemProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly shortcut?: string;
  readonly textValue?: string;
  readonly closeOnSelect?: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "role" | "onSelect">;

export const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    checked,
    disabled = false,
    shortcut,
    textValue,
    closeOnSelect,
    onCheckedChange,
    className,
    ...restProps
  } = props;

  const { menu } = useMenuContext();
  const { closeRootMenu } = useMenuRootContext();
  const { shouldCloseCurrentMenu, shouldCloseRoot } = useResolvedCloseOnSelect(menu, closeOnSelect);

  const { itemProps, isHighlighted } = useMenuItem(menu, {
    disabled,
    closeOnSelect: shouldCloseCurrentMenu,
    textValue,
    onSelect: (event) => {
      onCheckedChange(!checked);
      if (event.defaultPrevented) return;
      if (shouldCloseRoot) {
        closeRootMenu(true);
      }
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__item", className);

  return (
    <Component
      {...restProps}
      {...itemProps}
      ref={composeRefs(forwardedRef, itemProps.ref)}
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-checked={checked ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-highlighted={isHighlighted ? "true" : undefined}
      className={resolvedClassName}
    >
      <span className="ara-menu__label">{children}</span>
      {shortcut ? <span className="ara-menu__shortcut">{shortcut}</span> : null}
    </Component>
  );
});

type MenuRadioGroupContextValue = {
  readonly value: string | undefined;
  readonly name?: string;
  readonly onValueChange: (value: string) => void;
};

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const context = useContext(MenuRadioGroupContext);
  if (!context) {
    throw new Error("MenuRadioItem은 MenuRadioGroup 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

type MenuRadioGroupProps = PropsWithChildren<{
  readonly value?: string;
  readonly defaultValue?: string;
  readonly name?: string;
  readonly onValueChange?: (value: string) => void;
}> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

export function MenuRadioGroup(props: MenuRadioGroupProps): JSX.Element {
  const { children, value, defaultValue, name, onValueChange, className, style } = props;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const groupValue = isControlled ? value : uncontrolledValue;

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo<MenuRadioGroupContextValue>(
    () => ({
      value: groupValue,
      name,
      onValueChange: handleValueChange
    }),
    [groupValue, handleValueChange, name]
  );

  return (
    <MenuRadioGroupContext.Provider value={contextValue}>
      <div className={mergeClassNames("ara-menu__radio-group", className)} style={style} role="group">
        {children}
      </div>
    </MenuRadioGroupContext.Provider>
  );
}

type MenuRadioItemProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly value: string;
  readonly disabled?: boolean;
  readonly shortcut?: string;
  readonly textValue?: string;
  readonly closeOnSelect?: boolean;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "role">;

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(function MenuRadioItem(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    value,
    disabled = false,
    shortcut,
    textValue,
    closeOnSelect,
    className,
    ...restProps
  } = props;

  const { menu } = useMenuContext();
  const { closeRootMenu } = useMenuRootContext();
  const radioGroup = useMenuRadioGroupContext();

  const checked = radioGroup.value === value;
  const { shouldCloseCurrentMenu, shouldCloseRoot } = useResolvedCloseOnSelect(menu, closeOnSelect);

  const { itemProps, isHighlighted } = useMenuItem(menu, {
    disabled,
    closeOnSelect: shouldCloseCurrentMenu,
    textValue,
    onSelect: (event) => {
      radioGroup.onValueChange(value);
      if (event.defaultPrevented) return;
      if (shouldCloseRoot) {
        closeRootMenu(true);
      }
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__item", className);

  return (
    <Component
      {...restProps}
      {...itemProps}
      ref={composeRefs(forwardedRef, itemProps.ref)}
      role="menuitemradio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-checked={checked ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-highlighted={isHighlighted ? "true" : undefined}
      data-name={radioGroup.name}
      className={resolvedClassName}
    >
      <span className="ara-menu__label">{children}</span>
      {shortcut ? <span className="ara-menu__shortcut">{shortcut}</span> : null}
    </Component>
  );
});

type MenuGroupProps = PropsWithChildren<Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">>;

export function MenuGroup(props: MenuGroupProps): JSX.Element {
  const { children, className, style } = props;
  const [labelId, setLabelId] = useState<string | null>(null);

  const contextValue = useMemo<MenuGroupContextValue>(
    () => ({
      labelId,
      registerLabelId: setLabelId
    }),
    [labelId]
  );

  return (
    <MenuGroupContext.Provider value={contextValue}>
      <div
        role="group"
        aria-labelledby={labelId ?? undefined}
        className={mergeClassNames("ara-menu__group", className)}
        style={style}
      >
        {children}
      </div>
    </MenuGroupContext.Provider>
  );
}

type MenuLabelProps = PropsWithChildren<
  { readonly asChild?: boolean } & Pick<HTMLAttributes<HTMLElement>, "className" | "style" | "id">
>;

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(function MenuLabel(props, forwardedRef) {
  const { children, asChild = false, id, className, style, ...restProps } = props;
  const reactId = useId();
  const resolvedId = id ?? `ara-menu-label-${reactId.replace(/:/g, "-")}`;

  const groupContext = useMenuGroupContext();

  useEffect(() => {
    groupContext?.registerLabelId(resolvedId);
    return () => groupContext?.registerLabelId(null);
  }, [groupContext, resolvedId]);

  const Component = asChild ? Slot : "div";

  return (
    <Component
      {...restProps}
      ref={forwardedRef}
      id={resolvedId}
      className={mergeClassNames("ara-menu__label", className)}
      style={style}
    >
      {children}
    </Component>
  );
});

type MenuSeparatorProps = Pick<HTMLAttributes<HTMLElement>, "className" | "style">;

export function MenuSeparator(props: MenuSeparatorProps): JSX.Element {
  const { className, style } = props;

  return (
    <div
      role="separator"
      className={mergeClassNames("ara-menu__separator", className)}
      style={style}
    />
  );
}

type MenuSubProps = PropsWithChildren<{
  readonly placement?: Placement;
  readonly offset?: number;
  readonly strategy?: PositionStrategy;
}>;

export function MenuSub(props: MenuSubProps): JSX.Element {
  const { children, placement = "right-start", offset, strategy } = props;
  const parentMenuContext = useMenuContext();
  const rootContext = useMenuRootContext();

  const menu = useCoreMenu({
    closeOnSelect: rootContext.closeOnSelect,
    loopFocus: parentMenuContext.loopFocus,
    typeaheadTimeout: parentMenuContext.typeaheadTimeout
  });

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const [floatingNode, setFloatingNode] = useState<HTMLElement | null>(null);

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
    setAnchorNode(node);
  }, []);

  const setFloating = useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode(node);
  }, []);

  const hoverIntent = useHoverIntent({
    isOpen: menu.isOpen,
    anchor: anchorNode,
    floating: floatingNode,
    onOpenChange: (next) => {
      if (!parentMenuContext.openOnHover) return;
      if (next) {
        menu.openMenu();
      } else {
        menu.closeMenu();
      }
    }
  });

  const menuContextValue = useMemo<MenuContextValue>(
    () => ({
      menu,
      placement: placement ?? parentMenuContext.placement,
      offset: offset ?? parentMenuContext.offset,
      strategy: strategy ?? parentMenuContext.strategy,
      openOnHover: parentMenuContext.openOnHover,
      closeOnSelect: rootContext.closeOnSelect,
      loopFocus: parentMenuContext.loopFocus,
      typeaheadTimeout: parentMenuContext.typeaheadTimeout,
      portalContainer: parentMenuContext.portalContainer,
      anchorRef,
      floatingRef,
      setAnchor,
      setFloating,
      hoverIntent,
      isSubmenu: true
    }),
    [
      anchorRef,
      floatingRef,
      hoverIntent,
      menu,
      offset,
      parentMenuContext.offset,
      parentMenuContext.openOnHover,
      parentMenuContext.placement,
      parentMenuContext.portalContainer,
      parentMenuContext.loopFocus,
      parentMenuContext.typeaheadTimeout,
      parentMenuContext.strategy,
      placement,
      rootContext.closeOnSelect,
      setAnchor,
      setFloating,
      strategy
    ]
  );

  return (
    <MenuParentContext.Provider value={parentMenuContext}>
      <MenuContext.Provider value={menuContextValue}>{children}</MenuContext.Provider>
    </MenuParentContext.Provider>
  );
}

type MenuSubTriggerProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly disabled?: boolean;
  readonly textValue?: string;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "role">;

export const MenuSubTrigger = forwardRef<HTMLDivElement, MenuSubTriggerProps>(function MenuSubTrigger(
  props,
  forwardedRef
) {
  const {
    children,
    asChild = false,
    disabled = false,
    textValue,
    className,
    onClick,
    onKeyDown,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...restProps
  } = props;

  const submenuContext = useMenuContext();
  const parentMenuContext = useMenuParentContext();

  if (!parentMenuContext) {
    throw new Error("MenuSubTrigger는 MenuSub 내부에서만 사용할 수 있습니다.");
  }

  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    submenuContext.menu.setTriggerRef(triggerRef.current);
    return () => submenuContext.menu.setTriggerRef(null);
  }, [submenuContext.menu]);

  const pointerHandlers = submenuContext.openOnHover && !disabled ? submenuContext.hoverIntent.anchorProps : undefined;

  const { itemProps, isHighlighted } = useMenuItem(parentMenuContext.menu, {
    disabled,
    closeOnSelect: false,
    textValue,
    onSelect: () => {
      submenuContext.menu.openMenu("first");
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__sub-trigger", className);

  return (
    <Component
      {...restProps}
      {...itemProps}
      ref={composeRefs(forwardedRef, triggerRef, itemProps.ref, submenuContext.setAnchor, pointerHandlers?.ref)}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={submenuContext.menu.isOpen}
      aria-disabled={disabled || undefined}
      data-submenu-open={submenuContext.menu.isOpen ? "true" : undefined}
      data-highlighted={isHighlighted ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={resolvedClassName}
      onClick={composeEventHandlers(onClick, () => {
        if (disabled) return;
        submenuContext.menu.toggleMenu();
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.defaultPrevented) return;
        if (disabled) return;
        if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          submenuContext.menu.openMenu("first");
          return;
        }
        itemProps.onKeyDown(event as ReactKeyboardEvent<HTMLElement>);
      })}
      onPointerEnter={composeEventHandlers(onPointerEnter, pointerHandlers?.onPointerEnter)}
      onPointerMove={composeEventHandlers(onPointerMove, pointerHandlers?.onPointerMove)}
      onPointerLeave={composeEventHandlers(onPointerLeave, pointerHandlers?.onPointerLeave)}
    >
      <span className="ara-menu__label">{children}</span>
    </Component>
  );
});

type MenuSubContentProps = PropsWithChildren<{
  readonly asChild?: boolean;
  readonly id?: string;
}> &
  Omit<HTMLAttributes<HTMLElement>, "children" | "role"> & {
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
  };

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(function MenuSubContent(
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
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...restProps
  } = props;

  const { menu, placement, offset, strategy, portalContainer, anchorRef, floatingRef, setFloating, hoverIntent, openOnHover } =
    useMenuContext();
  const rootContext = useMenuRootContext();

  const { floatingProps, arrowProps, placement: resolvedPlacement } = usePositioner({
    anchorRef,
    floatingRef,
    placement,
    offset,
    strategy,
    withArrow: true
  });

  const { side, align } = parsePlacement(resolvedPlacement);

  const pointerHandlers = openOnHover ? hoverIntent.floatingProps : undefined;

  const { containerProps: dismissableProps } = useDismissableLayer({
    active: menu.isOpen,
    onDismiss: () => {
      menu.closeMenu(true);
    },
    onPointerDownOutside: (event) => {
      event.preventDefault();
    },
    onFocusOutside: () => {
      menu.closeMenu(true);
    }
  });

  const Component = asChild ? Slot : "div";
  const resolvedClassName = mergeClassNames("ara-menu__sub-content", className);

  const { ref: floatingNodeRef, style: floatingStyle, ...restFloatingProps } = floatingProps;

  const composedRef = composeRefs<HTMLDivElement>(
    forwardedRef,
    floatingNodeRef,
    setFloating,
    dismissableProps.ref,
    pointerHandlers?.ref
  );

  const contentContext = useMemo<MenuContentContextValue>(
    () => ({ arrowProps, placement: resolvedPlacement, side, align }),
    [align, arrowProps, resolvedPlacement, side]
  );

  if (!menu.isOpen) return null;

  return (
    <MenuContentContext.Provider value={contentContext}>
      <Portal container={portalContainer} className="ara-menu__portal">
        <Component
          {...restProps}
          {...restFloatingProps}
          ref={composedRef}
          id={id ?? menu.menuId}
          role={menu.menuProps.role}
          tabIndex={menu.menuProps.tabIndex}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? ariaLabelledby : `${menu.menuId}-trigger`}
          aria-activedescendant={menu.menuProps["aria-activedescendant"]}
          hidden={menu.menuProps.hidden}
          data-state={menu.isOpen ? "open" : "closed"}
          data-side={side}
          data-align={align}
          className={resolvedClassName}
          style={{ ...floatingStyle, ...style }}
          onKeyDown={(event) => {
            menu.menuProps.onKeyDown(event as ReactKeyboardEvent<HTMLElement>);
          }}
          onPointerEnter={composeEventHandlers(onPointerEnter, pointerHandlers?.onPointerEnter)}
          onPointerMove={composeEventHandlers(onPointerMove, pointerHandlers?.onPointerMove)}
          onPointerLeave={composeEventHandlers(onPointerLeave, pointerHandlers?.onPointerLeave)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              menu.closeMenu(true);
            }
          }}
        >
          {children}
        </Component>
      </Portal>
    </MenuContentContext.Provider>
  );
});

export type MenuComponentProps = MenuProps;
export type MenuTriggerComponentProps = ComponentPropsWithoutRef<typeof MenuTrigger>;
export type MenuContentComponentProps = ComponentPropsWithoutRef<typeof MenuContent>;
export type MenuItemComponentProps = ComponentPropsWithoutRef<typeof MenuItem>;
export type MenuCheckboxItemComponentProps = ComponentPropsWithoutRef<typeof MenuCheckboxItem>;
export type MenuRadioGroupComponentProps = ComponentPropsWithoutRef<typeof MenuRadioGroup>;
export type MenuRadioItemComponentProps = ComponentPropsWithoutRef<typeof MenuRadioItem>;
export type MenuGroupComponentProps = ComponentPropsWithoutRef<typeof MenuGroup>;
export type MenuLabelComponentProps = ComponentPropsWithoutRef<typeof MenuLabel>;
export type MenuSeparatorComponentProps = ComponentPropsWithoutRef<typeof MenuSeparator>;
export type MenuArrowComponentProps = ComponentPropsWithoutRef<typeof MenuArrow>;
export type MenuSubComponentProps = ComponentPropsWithoutRef<typeof MenuSub>;
export type MenuSubTriggerComponentProps = ComponentPropsWithoutRef<typeof MenuSubTrigger>;
export type MenuSubContentComponentProps = ComponentPropsWithoutRef<typeof MenuSubContent>;
