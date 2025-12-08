import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLayoutEffect, useRef } from "react";

import { Positioner, usePositioner } from "./index.js";

type RectInit = { x: number; y: number; width: number; height: number };

function createRect({ x, y, width, height }: RectInit): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({ x, y, width, height })
  } as DOMRect;
}

describe("usePositioner (React)", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", { value: 1024, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 768, configurable: true });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("anchorRef와 floatingRef를 사용해 위치를 계산하고 data-placement를 노출한다", async () => {
    const anchorRect = createRect({ x: 100, y: 100, width: 50, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 80, height: 30 });

    const anchor = document.createElement("div");
    anchor.getBoundingClientRect = () => anchorRect;
    const floating = document.createElement("div");
    floating.getBoundingClientRect = () => floatingRect;

    const anchorRef = { current: anchor } satisfies { current: HTMLDivElement | null };
    const floatingRef = { current: floating } satisfies { current: HTMLDivElement | null };

    const { result } = renderHook(() => usePositioner({ anchorRef, floatingRef, placement: "top-end" }));

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(70);
      expect(result.current.floatingProps.style.top).toBeCloseTo(70);
      expect(result.current.floatingProps["data-placement"]).toBe("top-end");
    });
  });

  it("withArrow 옵션 사용 시 화살표 좌표와 방향 속성을 제공한다", async () => {
    const anchorRect = createRect({ x: 100, y: 100, width: 50, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 80, height: 30 });

    const anchor = document.createElement("div");
    anchor.getBoundingClientRect = () => anchorRect;
    const floating = document.createElement("div");
    floating.getBoundingClientRect = () => floatingRect;

    const anchorRef = { current: anchor } satisfies { current: HTMLDivElement | null };
    const floatingRef = { current: floating } satisfies { current: HTMLDivElement | null };

    const { result } = renderHook(() => usePositioner({ anchorRef, floatingRef, withArrow: true }));

    const arrow = document.createElement("div");
    Object.defineProperty(arrow, "offsetWidth", { value: 10 });
    Object.defineProperty(arrow, "offsetHeight", { value: 10 });

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
      result.current.arrowProps?.ref(arrow);
    });

    await waitFor(() => {
      expect(result.current.arrowProps?.style.left).toBeCloseTo(20);
      expect(result.current.arrowProps?.style.top).toBeUndefined();
      expect(result.current.arrowProps?.["data-side"]).toBe("bottom");
      expect(result.current.arrowProps?.["data-align"]).toBe("start");
    });
  });

  it("스크롤/리사이즈 시 위치를 다시 계산해 최신 좌표를 반영한다", async () => {
    let anchorRect = createRect({ x: 20, y: 30, width: 40, height: 20 });
    const floatingRect = createRect({ x: 0, y: 0, width: 50, height: 20 });

    function Example() {
      const anchorRef = useRef<HTMLDivElement | null>(null);
      const floatingRef = useRef<HTMLElement | null>(null);

      useLayoutEffect(() => {
        if (anchorRef.current) {
          anchorRef.current.getBoundingClientRect = () => anchorRect;
        }

        if (floatingRef.current) {
          floatingRef.current.getBoundingClientRect = () => floatingRect;
        }
      });

      return (
        <>
          <div ref={anchorRef} data-testid="anchor" />
          <Positioner
            anchorRef={anchorRef}
            ref={(node) => {
              floatingRef.current = node;
              if (node) {
                node.getBoundingClientRect = () => floatingRect;
              }
            }}
          >
            <span data-testid="content">콘텐츠</span>
          </Positioner>
        </>
      );
    }

    const { getByTestId } = render(<Example />);

    await waitFor(() => {
      const container = getByTestId("content").parentElement as HTMLElement;
      expect(Number.parseFloat(container.style.left)).toBeCloseTo(20);
      expect(Number.parseFloat(container.style.top)).toBeCloseTo(50);
    });

    act(() => {
      anchorRect = createRect({ x: 120, y: 150, width: 40, height: 20 });
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      const container = getByTestId("content").parentElement as HTMLElement;
      expect(Number.parseFloat(container.style.left)).toBeCloseTo(120);
      expect(Number.parseFloat(container.style.top)).toBeCloseTo(170);
    });
  });
});

describe("Positioner 컴포넌트", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", { value: 1024, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 768, configurable: true });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("컨테이너에 ref, 클래스, data-placement를 적용한다", async () => {
    const anchorRect = createRect({ x: 40, y: 50, width: 60, height: 30 });
    const floatingRect = createRect({ x: 0, y: 0, width: 70, height: 20 });

    function Example() {
      const anchorRef = useRef<HTMLDivElement | null>(null);
      const floatingRef = useRef<HTMLElement | null>(null);

      useLayoutEffect(() => {
        if (anchorRef.current) {
          anchorRef.current.getBoundingClientRect = () => anchorRect;
        }

        if (floatingRef.current) {
          floatingRef.current.getBoundingClientRect = () => floatingRect;
        }
      });

      return (
        <>
          <div ref={anchorRef} data-testid="anchor">
            anchor
          </div>
          <Positioner
            anchorRef={anchorRef}
            className="custom"
            ref={(node) => {
              floatingRef.current = node;
              if (node) {
                node.getBoundingClientRect = () => floatingRect;
              }
            }}
          >
            <span data-testid="content">콘텐츠</span>
          </Positioner>
        </>
      );
    }

    const { getByTestId } = render(<Example />);

    await waitFor(() => {
      const container = getByTestId("content").parentElement as HTMLElement;

      expect(container).toHaveAttribute("data-placement", "bottom-start");
      expect(container).toHaveClass("ara-positioner", "custom");
      expect(Number.parseFloat(container.style.left)).toBeCloseTo(40);
      expect(Number.parseFloat(container.style.top)).toBeCloseTo(80);
    });
  });
});
