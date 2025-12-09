import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { useTypeahead, type TypeaheadItem } from "./use-typeahead.js";

const baseItems: TypeaheadItem[] = [
  { id: "apple", textValue: "Apple" },
  { id: "banana", textValue: "Banana" },
  { id: "cherry", textValue: "Cherry" },
  { id: "date", textValue: "Date" }
];

describe("useTypeahead", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("매칭된 항목을 반환하고 콜백을 호출한다", () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({
        items: baseItems,
        onMatch
      })
    );

    const match = result.current.handleTypeahead({ key: "b", altKey: false, ctrlKey: false, metaKey: false });

    expect(match?.id).toBe("banana");
    expect(onMatch).toHaveBeenCalledWith(baseItems[1]);
  });

  it("연속 타이핑을 버퍼링하여 접두 매칭한다", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useTypeahead({
        items: baseItems,
        activeId: "apple"
      })
    );

    act(() => {
      const first = result.current.handleTypeahead({ key: "c", altKey: false, ctrlKey: false, metaKey: false });
      expect(first?.id).toBe("cherry");
    });

    act(() => {
      const buffered = result.current.handleTypeahead({ key: "h", altKey: false, ctrlKey: false, metaKey: false });
      expect(buffered?.id).toBe("cherry");
    });
  });

  it("타임아웃 이후에는 버퍼를 초기화한다", () => {
    vi.useFakeTimers();
    const items: TypeaheadItem[] = [
      { id: "citrus", textValue: "Citrus" },
      { id: "honey", textValue: "Honey" },
      { id: "mint", textValue: "Mint" }
    ];

    const { result } = renderHook(() => useTypeahead({ items, timeout: 700 }));

    act(() => {
      const first = result.current.handleTypeahead({ key: "c", altKey: false, ctrlKey: false, metaKey: false });
      expect(first?.id).toBe("citrus");
    });

    act(() => {
      vi.advanceTimersByTime(750);
      const afterTimeout = result.current.handleTypeahead({ key: "h", altKey: false, ctrlKey: false, metaKey: false });
      expect(afterTimeout?.id).toBe("honey");
    });
  });

  it("활성 항목 이후부터 순회하며 동일 키 입력으로 다음 항목을 찾는다", () => {
    vi.useFakeTimers();
    const items: TypeaheadItem[] = [
      { id: "alpha", textValue: "Alpha" },
      { id: "amber", textValue: "Amber" },
      { id: "amaranth", textValue: "Amaranth" }
    ];

    const { result, rerender } = renderHook(
      (props: Parameters<typeof useTypeahead>[0]) => useTypeahead(props),
      {
        initialProps: {
          items,
          activeId: "alpha",
          loop: true
        }
      }
    );

    act(() => {
      const first = result.current.handleTypeahead({ key: "a", altKey: false, ctrlKey: false, metaKey: false });
      expect(first?.id).toBe("amber");
    });

    rerender({ items, activeId: "amber", loop: true });

    act(() => {
      const second = result.current.handleTypeahead({ key: "a", altKey: false, ctrlKey: false, metaKey: false });
      expect(second?.id).toBe("amaranth");
    });

    rerender({ items, activeId: "amaranth", loop: true });

    act(() => {
      const looped = result.current.handleTypeahead({ key: "a", altKey: false, ctrlKey: false, metaKey: false });
      expect(looped?.id).toBe("alpha");
    });
  });

  it("비활성 항목은 건너뛰고 매칭한다", () => {
    const items: TypeaheadItem[] = [
      { id: "apple", textValue: "Apple", disabled: true },
      { id: "apricot", textValue: "Apricot" },
      { id: "banana", textValue: "Banana" }
    ];

    const { result } = renderHook(() => useTypeahead({ items }));

    const match = result.current.handleTypeahead({ key: "a", altKey: false, ctrlKey: false, metaKey: false });
    expect(match?.id).toBe("apricot");
  });

  it("modifier 키나 공백 입력은 무시한다", () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() => useTypeahead({ items: baseItems, onMatch }));

    const ignored = result.current.handleTypeahead({ key: " ", altKey: false, ctrlKey: false, metaKey: false });
    const withCtrl = result.current.handleTypeahead({ key: "a", altKey: false, ctrlKey: true, metaKey: false });

    expect(ignored).toBeNull();
    expect(withCtrl).toBeNull();
    expect(onMatch).not.toHaveBeenCalled();
  });
});
