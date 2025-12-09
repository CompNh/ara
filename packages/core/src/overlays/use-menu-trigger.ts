import { useCallback, useEffect, useMemo, useRef } from "react";

import type { UseMenuResult } from "./use-menu.js";

export interface UseMenuTriggerOptions {
  readonly disabled?: boolean;
}

export interface UseMenuTriggerResult<T extends HTMLElement = HTMLElement> {
  readonly triggerProps: {
    readonly id: string;
    readonly ref: (node: T | null) => void;
    readonly role: "button";
    readonly tabIndex: number;
    readonly "aria-haspopup": "menu";
    readonly "aria-expanded": boolean;
    readonly "aria-controls": string;
    readonly onClick: (event: React.MouseEvent<T>) => void;
    readonly onKeyDown: (event: React.KeyboardEvent<T>) => void;
  };
}

export function useMenuTrigger<T extends HTMLElement = HTMLElement>(
  menu: UseMenuResult,
  options: UseMenuTriggerOptions = {}
): UseMenuTriggerResult<T> {
  const { disabled = false } = options;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    menu.setTriggerRef(ref.current);
    return () => menu.setTriggerRef(null);
  }, [menu]);

  const handleClick = useCallback(
    (event: React.MouseEvent<T>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      menu.toggleMenu();
    },
    [disabled, menu]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (disabled) return;

      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        menu.openMenu("first");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        menu.openMenu("last");
      } else if (event.key === "Escape") {
        event.preventDefault();
        menu.closeMenu(true);
      }
    },
    [disabled, menu]
  );

  const triggerProps = useMemo(
    () => ({
      id: `${menu.menuId}-trigger`,
      ref: (node: T | null) => {
        ref.current = node;
      },
      role: "button" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-haspopup": "menu" as const,
      "aria-expanded": menu.isOpen,
      "aria-controls": menu.menuId,
      onClick: handleClick,
      onKeyDown: handleKeyDown
    }),
    [disabled, handleClick, handleKeyDown, menu.isOpen, menu.menuId]
  );

  return useMemo(() => ({ triggerProps }), [triggerProps]);
}
