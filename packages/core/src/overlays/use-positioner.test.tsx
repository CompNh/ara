import "@testing-library/jest-dom/vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePositioner, type Placement } from "./use-positioner.js";

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

function setupElements(anchorRect: DOMRect, floatingRect: DOMRect) {
  const anchor = document.createElement("div");
  const floating = document.createElement("div");

  anchor.getBoundingClientRect = vi.fn(() => anchorRect);
  floating.getBoundingClientRect = vi.fn(() => floatingRect);

  document.body.appendChild(anchor);
  document.body.appendChild(floating);

  return { anchor, floating };
}

describe("usePositioner", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", { value: 1024, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 768, configurable: true });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("기본 배치를 anchor 기준 하단 시작점으로 계산한다", async () => {
    const anchorRect = createRect({ x: 100, y: 100, width: 50, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 80, height: 30 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner());

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(100);
      expect(result.current.floatingProps.style.top).toBeCloseTo(140);
    });
  });

  it("placement 옵션을 반영해 원하는 정렬에 배치한다", async () => {
    const anchorRect = createRect({ x: 100, y: 100, width: 50, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 80, height: 30 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner({ placement: "top-end" } satisfies { placement: Placement }));

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(70);
      expect(result.current.floatingProps.style.top).toBeCloseTo(70);
      expect(result.current.placement).toBe("top-end");
    });
  });

  it("offset 값만큼 주축 방향으로 간격을 둔다", async () => {
    const anchorRect = createRect({ x: 200, y: 200, width: 80, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 60, height: 20 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner({ offset: 8 }));

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(200);
      expect(result.current.floatingProps.style.top).toBeCloseTo(248);
    });
  });

  it("strategy가 fixed이면 스크롤 보정 없이 뷰포트 기준 좌표를 사용한다", async () => {
    Object.defineProperty(window, "scrollX", { value: 120, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });

    const anchorRect = createRect({ x: 20, y: 30, width: 40, height: 20 });
    const floatingRect = createRect({ x: 0, y: 0, width: 10, height: 10 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner({ strategy: "fixed" }));

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(20);
      expect(result.current.floatingProps.style.top).toBeCloseTo(50);
      expect(result.current.floatingProps.style.position).toBe("fixed");
    });

    Object.defineProperty(window, "scrollX", { value: 0, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("뷰포트 밖으로 나갈 경우 반대편으로 뒤집는다", async () => {
    const anchorRect = createRect({ x: 300, y: 700, width: 60, height: 50 });
    const floatingRect = createRect({ x: 0, y: 0, width: 80, height: 40 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner({ placement: "bottom-start" }));

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.top).toBeCloseTo(660);
      expect(result.current.placement).toBe("top-start");
    });
  });

  it("교차 축으로 시프트해 뷰포트 안에 유지한다", async () => {
    const anchorRect = createRect({ x: -20, y: 100, width: 20, height: 40 });
    const floatingRect = createRect({ x: 0, y: 0, width: 100, height: 20 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner());

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingProps.style.left).toBeCloseTo(0);
      expect(result.current.floatingProps.style.top).toBeCloseTo(140);
    });
  });

  it("스크롤/리사이즈 시 위치를 다시 계산한다", async () => {
    let anchorRect = createRect({ x: 10, y: 10, width: 40, height: 30 });
    const floatingRect = createRect({ x: 0, y: 0, width: 50, height: 20 });
    const { anchor, floating } = setupElements(anchorRect, floatingRect);

    const { result } = renderHook(() => usePositioner());

    act(() => {
      result.current.anchorProps.ref(anchor);
      result.current.floatingProps.ref(floating);
    });

    await waitFor(() => expect(result.current.floatingProps.style.left).toBeCloseTo(10));

    anchor.getBoundingClientRect = vi.fn(() => anchorRect);

    act(() => {
      anchorRect = createRect({ x: 200, y: 10, width: 40, height: 30 });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => expect(result.current.floatingProps.style.left).toBeCloseTo(200));
  });
});
