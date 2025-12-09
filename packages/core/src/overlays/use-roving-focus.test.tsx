import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";

import {
  useRovingFocus,
  type UseRovingFocusOptions,
  type UseRovingFocusResult
} from "./use-roving-focus.js";

interface TestItem {
  readonly id: string;
  readonly disabled?: boolean;
}

interface RovingListProps {
  readonly items: readonly TestItem[];
  readonly loop?: boolean;
  readonly orientation?: UseRovingFocusOptions["orientation"];
}

function RovingList({ items, loop, orientation }: RovingListProps) {
  const { registerItem, handleKeyDown, setActiveId }: UseRovingFocusResult = useRovingFocus({
    loop,
    orientation
  });

  return (
    <div>
      {items.map((item) => (
        <RovingItem
          key={item.id}
          item={item}
          registerItem={registerItem}
          handleKeyDown={handleKeyDown}
          setActiveId={setActiveId}
        />
      ))}
    </div>
  );
}

interface RovingItemProps {
  readonly item: TestItem;
  readonly registerItem: UseRovingFocusResult["registerItem"];
  readonly handleKeyDown: UseRovingFocusResult["handleKeyDown"];
  readonly setActiveId: UseRovingFocusResult["setActiveId"];
}

function RovingItem({ item, registerItem, handleKeyDown, setActiveId }: RovingItemProps) {
  const [tabIndex, setTabIndex] = useState(-1);
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const unregister = registerItem({
      id: item.id,
      isDisabled: () => !!item.disabled,
      setTabIndex,
      focus: () => {
        ref.current?.focus();
      }
    });
    return unregister;
  }, [item.disabled, item.id, registerItem]);

  return (
    <button
      data-testid={item.id}
      ref={ref}
      tabIndex={item.disabled ? -1 : tabIndex}
      disabled={item.disabled}
      onFocus={() => setActiveId(item.id)}
      onKeyDown={(event) => handleKeyDown(item.id, event)}
    >
      {item.id}
    </button>
  );
}

describe("useRovingFocus", () => {
  afterEach(() => {
    cleanup();
  });

  it("첫 활성 항목만 tabIndex=0으로 만들고 disabled는 건너뛴다", async () => {
    const { getByTestId } = render(
      <RovingList
        items={[
          { id: "a" },
          { id: "b", disabled: true },
          { id: "c" }
        ]}
      />
    );

    const itemA = getByTestId("a");
    const itemB = getByTestId("b");
    const itemC = getByTestId("c");

    await waitFor(() => {
      expect(itemA).toHaveAttribute("tabindex", "0");
    });
    expect(itemB).toHaveAttribute("tabindex", "-1");
    expect(itemC).toHaveAttribute("tabindex", "-1");
  });

  it("Arrow 키 내비게이션으로 포커스를 이동할 때 disabled를 건너뛴다", async () => {
    const { getByTestId } = render(
      <RovingList
        items={[
          { id: "a" },
          { id: "b", disabled: true },
          { id: "c" }
        ]}
      />
    );

    const itemA = getByTestId("a");
    const itemC = getByTestId("c");

    itemA.focus();
    fireEvent.keyDown(itemA, { key: "ArrowDown" });

    await waitFor(() => {
      expect(document.activeElement).toBe(itemC);
    });
    expect(itemA).toHaveAttribute("tabindex", "-1");
    expect(itemC).toHaveAttribute("tabindex", "0");
  });

  it("Home/End 키로 처음과 끝 활성 항목을 바로 포커스한다", async () => {
    const { getByTestId } = render(
      <RovingList
        loop={false}
        items={[
          { id: "a", disabled: true },
          { id: "b" },
          { id: "c" }
        ]}
      />
    );

    const itemB = getByTestId("b");
    const itemC = getByTestId("c");

    itemB.focus();
    fireEvent.keyDown(itemB, { key: "End" });

    await waitFor(() => {
      expect(document.activeElement).toBe(itemC);
    });

    fireEvent.keyDown(itemC, { key: "Home" });

    await waitFor(() => {
      expect(document.activeElement).toBe(itemB);
    });
  });
});
