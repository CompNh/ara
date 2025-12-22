import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject
} from "react";

import type { RovingFocusItemController } from "./use-roving-focus.js";
import { useRovingFocus } from "./use-roving-focus.js";
import type { TypeaheadItem } from "./use-typeahead.js";
import { useTypeahead } from "./use-typeahead.js";

interface InternalMenuItem {
  readonly id: string;
  readonly ref: RefObject<HTMLElement>;
  readonly controller: RovingFocusItemController;
  disabled: boolean;
  textValue: string;
}

function createTypeaheadItem(item: InternalMenuItem): TypeaheadItem {
  return {
    id: item.id,
    textValue: item.textValue,
    disabled: item.disabled
  };
}

export interface UseMenuOptions {
  /** 메뉴 id. 지정하지 않으면 자동 생성된다. */
  readonly id?: string;
  /** 제어 모드: 메뉴 열림 여부. */
  readonly open?: boolean;
  /** 비제어 모드: 초기 열림 여부. */
  readonly defaultOpen?: boolean;
  /** 열림 상태가 변경될 때 호출된다. */
  readonly onOpenChange?: (open: boolean) => void;
  /** 선택 시 메뉴를 닫을지 여부. 기본 true. */
  readonly closeOnSelect?: boolean;
  /** roving focus가 끝에서 다시 처음으로 순환할지 여부. 기본 true. */
  readonly loopFocus?: boolean;
  /** typeahead 버퍼 리셋까지의 시간(ms). 기본 700. */
  readonly typeaheadTimeout?: number;
}

export interface MenuItemRegistration {
  readonly id: string;
  readonly ref: RefObject<HTMLElement>;
  readonly disabled?: boolean;
  readonly textValue?: string;
}

export interface UseMenuResult {
  readonly isOpen: boolean;
  readonly activeId: string | null;
  readonly menuId: string;
  readonly menuProps: {
    readonly id: string;
    readonly role: "menu";
    readonly tabIndex: number;
    readonly "aria-activedescendant"?: string;
    readonly hidden?: boolean;
    readonly onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  };
  readonly setTriggerRef: (node: HTMLElement | null) => void;
  readonly openMenu: (focus?: "first" | "last") => void;
  readonly closeMenu: (focusTrigger?: boolean) => void;
  readonly toggleMenu: () => void;
  readonly registerItem: (registration: MenuItemRegistration) => () => void;
  readonly updateItem: (id: string, payload: Pick<MenuItemRegistration, "disabled" | "textValue">) => void;
  readonly handleItemKeyDown: (id: string, event: ReactKeyboardEvent<HTMLElement>) => void;
  readonly handleItemSelect: (event: Event | React.SyntheticEvent, shouldClose?: boolean) => void;
  readonly handleItemPointerMove: (id: string) => void;
}

export function useMenu(options: UseMenuOptions = {}): UseMenuResult {
  const {
    id,
    open,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    loopFocus = true,
    typeaheadTimeout
  } = options;

  const menuId = id ?? useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [typeaheadItems, setTypeaheadItems] = useState<TypeaheadItem[]>([]);
  const itemsRef = useRef<InternalMenuItem[]>([]);

  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  const { activeId, registerItem, setActiveId, handleKeyDown, updateTabStops } = useRovingFocus({
    orientation: "vertical",
    loop: loopFocus
  });

  const focusItem = useCallback((id: string | null) => {
    if (!id) return;
    const record = itemsRef.current.find((item) => item.id === id);
    record?.ref.current?.focus();
  }, []);

  const updateTypeaheadItems = useCallback(() => {
    setTypeaheadItems(itemsRef.current.map(createTypeaheadItem));
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const closeMenu = useCallback(
    (focusTrigger = false) => {
      setOpen(false);
      if (focusTrigger) {
        queueMicrotask(() => {
          triggerRef.current?.focus();
        });
      }
    },
    [setOpen]
  );

  const openMenu = useCallback(
    (focus?: "first" | "last") => {
      setOpen(true);
      if (focus) {
        const enabledItems = itemsRef.current.filter((item) => !item.disabled);
        const target = focus === "first" ? enabledItems[0] : enabledItems[enabledItems.length - 1];
        if (target) {
          setActiveId(target.id);
          focusItem(target.id);
          updateTabStops();
        }
      }
    },
    [focusItem, setActiveId, setOpen, updateTabStops]
  );

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu(true);
    } else {
      openMenu("first");
    }
  }, [closeMenu, isOpen, openMenu]);

  const typeahead = useTypeahead({
    items: typeaheadItems,
    activeId,
    loop: true,
    timeout: typeaheadTimeout,
    onMatch: (match) => {
      setActiveId(match.id);
      focusItem(match.id);
      updateTabStops();
    }
  });

  const registerMenuItem = useCallback(
    (registration: MenuItemRegistration) => {
      const disabled = Boolean(registration.disabled);
      const textValue = registration.textValue ?? registration.id;

      const controller: RovingFocusItemController = {
        id: registration.id,
        isDisabled: () => itemsRef.current.some((item) => item.id === registration.id && item.disabled),
        setTabIndex: (tabIndex) => {
          const element = registration.ref.current;
          if (element) element.tabIndex = tabIndex;
        },
        focus: () => registration.ref.current?.focus()
      };

      const unregister = registerItem(controller);

      const record: InternalMenuItem = { id: registration.id, ref: registration.ref, controller, disabled, textValue };
      itemsRef.current.push(record);
      updateTypeaheadItems();

      return () => {
        itemsRef.current = itemsRef.current.filter((item) => item !== record);
        unregister();
        updateTypeaheadItems();
        updateTabStops();
      };
    },
    [registerItem, updateTabStops, updateTypeaheadItems]
  );

  const updateItem = useCallback(
    (id: string, payload: Pick<MenuItemRegistration, "disabled" | "textValue">) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target) return;

      if (payload.disabled !== undefined) target.disabled = Boolean(payload.disabled);
      if (payload.textValue !== undefined) target.textValue = payload.textValue;

      updateTypeaheadItems();
      updateTabStops();
    },
    [updateTabStops, updateTypeaheadItems]
  );

  const handleItemSelect = useCallback(
    (event: Event | React.SyntheticEvent, shouldClose = closeOnSelect) => {
      if (shouldClose) {
        event.preventDefault();
        closeMenu(true);
      }
    },
    [closeMenu, closeOnSelect]
  );

  const handleItemPointerMove = useCallback(
    (id: string) => {
      if (!isOpen) return;
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target || target.disabled) return;

      setActiveId(id);
      updateTabStops();
    },
    [isOpen, setActiveId, updateTabStops]
  );

  const handleItemKeyDown = useCallback(
    (id: string, event: ReactKeyboardEvent<HTMLElement>) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target || target.disabled) return;

      if (event.key === "Escape" || event.key === "ArrowLeft") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleItemSelect(event);
        return;
      }

      handleKeyDown(id, event.nativeEvent);
      const match = typeahead.handleTypeahead(event.nativeEvent);
      if (match) {
        setActiveId(match.id);
        focusItem(match.id);
        updateTabStops();
      }
    },
    [closeMenu, focusItem, handleItemSelect, handleKeyDown, setActiveId, typeahead, updateTabStops]
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveId(null);
      updateTabStops();
    }
  }, [isOpen, setActiveId, updateTabStops]);

  const menuProps = useMemo(
    () => ({
      id: menuId,
      role: "menu" as const,
      tabIndex: -1,
      "aria-activedescendant": activeId ?? undefined,
      hidden: !isOpen,
      onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu(true);
        }
      }
    }),
    [activeId, closeMenu, isOpen, menuId]
  );

  return useMemo(
    () => ({
      isOpen,
      activeId,
      menuId,
      menuProps,
      setTriggerRef: (node: HTMLElement | null) => {
        triggerRef.current = node;
      },
      openMenu,
      closeMenu,
      toggleMenu,
      registerItem: registerMenuItem,
      updateItem,
      handleItemKeyDown,
      handleItemSelect,
      handleItemPointerMove
    }),
    [activeId, closeMenu, handleItemKeyDown, handleItemPointerMove, handleItemSelect, isOpen, menuId, menuProps, openMenu, registerMenuItem, toggleMenu, updateItem]
  );
}
