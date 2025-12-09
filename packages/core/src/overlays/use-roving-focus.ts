import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NavigationDirection = "next" | "previous" | "first" | "last";

export type RovingFocusOrientation = "horizontal" | "vertical" | "both";

export interface RovingFocusItemController {
  readonly id: string;
  readonly isDisabled: () => boolean;
  readonly setTabIndex: (tabIndex: number) => void;
  readonly focus: () => void;
}

export interface UseRovingFocusOptions {
  /**
   * Arrow 키 응답 축을 결정한다. horizontal이면 좌/우, vertical이면 상/하, both이면 네 방향 모두 허용한다.
   */
  readonly orientation?: RovingFocusOrientation;
  /** true이면 끝에서 다시 처음으로 순환한다. */
  readonly loop?: boolean;
  /** 제어 모드 활성 id. */
  readonly activeId?: string | null;
  /** 비제어 초기 활성 id. */
  readonly defaultActiveId?: string | null;
  /** 활성 항목 변경 시 호출된다. */
  readonly onActiveIdChange?: (id: string | null) => void;
}

export interface UseRovingFocusResult {
  /** 현재 활성 항목 id. */
  readonly activeId: string | null;
  /** roving tabIndex를 관리하기 위해 각 항목을 등록한다. */
  readonly registerItem: (controller: RovingFocusItemController) => () => void;
  /** 활성 id를 직접 업데이트하고 tabIndex를 재계산한다. */
  readonly setActiveId: (id: string | null) => void;
  /** Arrow/Home/End 키 입력을 처리해 포커스를 이동한다. */
  readonly handleKeyDown: (
    currentId: string,
    event: Pick<KeyboardEvent, "key" | "preventDefault" | "defaultPrevented">
  ) => void;
  /** 내부 항목 목록이 변했을 때 tabIndex를 다시 계산한다. */
  readonly updateTabStops: () => void;
}

function shouldHandleKey(key: string, orientation: RovingFocusOrientation): boolean {
  if (key === "ArrowUp" || key === "ArrowDown") {
    return orientation === "vertical" || orientation === "both";
  }

  if (key === "ArrowLeft" || key === "ArrowRight") {
    return orientation === "horizontal" || orientation === "both";
  }

  return key === "Home" || key === "End";
}

export function useRovingFocus(options: UseRovingFocusOptions = {}): UseRovingFocusResult {
  const {
    orientation = "vertical",
    loop = true,
    activeId: controlledActiveId,
    defaultActiveId = null,
    onActiveIdChange
  } = options;

  const isControlled = controlledActiveId !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | null>(defaultActiveId);
  const activeId = isControlled ? controlledActiveId ?? null : uncontrolledActiveId;

  const activeIdRef = useRef<string | null>(activeId);
  const itemsRef = useRef<RovingFocusItemController[]>([]);

  const setActiveId = useCallback(
    (id: string | null) => {
      activeIdRef.current = id;
      if (!isControlled) {
        setUncontrolledActiveId(id);
      }
      onActiveIdChange?.(id);
    },
    [isControlled, onActiveIdChange]
  );

  const updateTabStops = useCallback(() => {
    const items = itemsRef.current;
    const currentActiveId = activeIdRef.current;

    let activeIndex = currentActiveId
      ? items.findIndex((item) => item.id === currentActiveId && !item.isDisabled())
      : -1;

    if (activeIndex === -1) {
      activeIndex = items.findIndex((item) => !item.isDisabled());
    }

    items.forEach((item, index) => {
      item.setTabIndex(index === activeIndex ? 0 : -1);
    });
  }, []);

  const registerItem = useCallback(
    (controller: RovingFocusItemController) => {
      itemsRef.current.push(controller);
      updateTabStops();

      return () => {
        itemsRef.current = itemsRef.current.filter((item) => item !== controller);
        updateTabStops();
      };
    },
    [updateTabStops]
  );

  const moveFocus = useCallback(
    (currentId: string, direction: NavigationDirection) => {
      const items = itemsRef.current;
      const currentIndex = items.findIndex((item) => item.id === currentId);
      if (currentIndex === -1 || items.length === 0) return;

      const total = items.length;
      const startIndex = direction === "first" ? 0 : direction === "last" ? total - 1 : currentIndex;

      const getOffset = () => {
        if (direction === "next") return 1;
        if (direction === "previous") return -1;
        return 0;
      };

      if (direction === "first" || direction === "last") {
        for (let step = 0; step < total; step += 1) {
          const candidateIndex = direction === "first" ? step : total - 1 - step;
          const candidate = items[candidateIndex];
          if (!candidate || candidate.isDisabled()) continue;

          setActiveId(candidate.id);
          candidate.focus();
          updateTabStops();
          return;
        }
        return;
      }

      for (let step = 1; step <= total; step += 1) {
        const offset = getOffset();
        const candidateIndex = startIndex + offset * step;
        if (!loop && (candidateIndex < 0 || candidateIndex >= total)) return;

        const normalizedIndex = (candidateIndex + total) % total;
        const candidate = items[normalizedIndex];
        if (!candidate || candidate.isDisabled()) continue;

        setActiveId(candidate.id);
        candidate.focus();
        updateTabStops();
        return;
      }
    },
    [loop, setActiveId, updateTabStops]
  );

  const handleKeyDown = useCallback(
    (
      currentId: string,
      event: Pick<KeyboardEvent, "key" | "preventDefault" | "defaultPrevented">
    ) => {
      if (event.defaultPrevented) return;
      if (!shouldHandleKey(event.key, orientation)) return;

      event.preventDefault();

      if (event.key === "Home") {
        moveFocus(currentId, "first");
        return;
      }
      if (event.key === "End") {
        moveFocus(currentId, "last");
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        moveFocus(currentId, "next");
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        moveFocus(currentId, "previous");
      }
    },
    [moveFocus, orientation]
  );

  useEffect(() => {
    activeIdRef.current = activeId;
    updateTabStops();
  }, [activeId, updateTabStops]);

  return useMemo(
    () => ({ activeId, registerItem, setActiveId, handleKeyDown, updateTabStops }),
    [activeId, handleKeyDown, registerItem, setActiveId, updateTabStops]
  );
}
