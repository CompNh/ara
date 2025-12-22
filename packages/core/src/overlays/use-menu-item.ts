import { useEffect, useMemo, useRef } from "react";

import type { UseMenuResult } from "./use-menu.js";

export type MenuItemRole = "menuitem" | "menuitemcheckbox" | "menuitemradio";

export interface UseMenuItemOptions {
  readonly id?: string;
  readonly disabled?: boolean;
  readonly textValue?: string;
  readonly closeOnSelect?: boolean;
  readonly role?: MenuItemRole;
  readonly onSelect?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
}

export interface UseMenuItemResult<T extends HTMLElement = HTMLElement> {
  readonly itemProps: {
    readonly id: string;
    readonly ref: (node: T | null) => void;
    readonly role: MenuItemRole;
    readonly tabIndex: number;
    readonly "aria-disabled"?: boolean;
    readonly onClick: (event: React.MouseEvent<T>) => void;
    readonly onKeyDown: (event: React.KeyboardEvent<T>) => void;
    readonly onPointerMove: (event: React.PointerEvent<T>) => void;
    readonly onFocus: () => void;
  };
  readonly isHighlighted: boolean;
}

export function useMenuItem<T extends HTMLElement = HTMLElement>(
  menu: UseMenuResult,
  options: UseMenuItemOptions = {}
): UseMenuItemResult<T> {
  const {
    id: providedId,
    disabled = false,
    textValue,
    closeOnSelect = true,
    role = "menuitem",
    onSelect
  } = options;
  const ref = useRef<T | null>(null);
  const autoId = useMemo(() => providedId ?? `${menu.menuId}-item-${crypto.randomUUID()}`, [menu.menuId, providedId]);
  const itemId = providedId ?? autoId;

  useEffect(() => {
    const cleanup = menu.registerItem({ id: itemId, ref, disabled, textValue });
    return () => cleanup();
  }, [disabled, itemId, menu, textValue]);

  useEffect(() => {
    menu.updateItem(itemId, { disabled, textValue });
  }, [disabled, itemId, menu, textValue]);

  const handleSelect = (event: React.MouseEvent<T> | React.KeyboardEvent<T>) => {
    if (disabled) return;
    onSelect?.(event);
    menu.handleItemSelect(event, closeOnSelect);
  };

  const itemProps = useMemo(
    () => ({
      id: itemId,
      ref: (node: T | null) => {
        ref.current = node;
      },
      role,
      tabIndex: -1,
      "aria-disabled": disabled || undefined,
      onClick: handleSelect,
      onKeyDown: (event: React.KeyboardEvent<T>) => {
        if ((event.key === "Enter" || event.key === " ") && !disabled) {
          onSelect?.(event);
        }
        menu.handleItemKeyDown(itemId, event);
      },
      onPointerMove: () => menu.handleItemPointerMove(itemId),
      onFocus: () => menu.handleItemPointerMove(itemId)
    }),
    [disabled, handleSelect, itemId, menu, onSelect, role]
  );

  return useMemo(
    () => ({
      itemProps,
      isHighlighted: menu.activeId === itemId
    }),
    [itemId, itemProps, menu.activeId]
  );
}
