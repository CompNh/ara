import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";

import { useHoverIntent } from "./use-hover-intent.js";

describe("useHoverIntent", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("열림 지연과 포인터 안정 구간을 존중한다", async () => {
    vi.useFakeTimers();

    function Target() {
      const { anchorProps, isOpen } = useHoverIntent({ openDelay: 120, restMs: 50 });
      return (
        <button data-testid="anchor" {...anchorProps}>
          {isOpen ? "open" : "closed"}
        </button>
      );
    }

    const { getByTestId } = render(<Target />);
    const anchor = getByTestId("anchor");

    await act(async () => {
      fireEvent.pointerEnter(anchor, { clientX: 10, clientY: 10 });
    });

    expect(anchor).toHaveTextContent("closed");

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    expect(anchor).toHaveTextContent("open");
  });

  it("포인터 이동이 계속되면 안정 구간까지 열지 않는다", async () => {
    vi.useFakeTimers();

    function Target() {
      const { anchorProps, isOpen } = useHoverIntent({ openDelay: 30, restMs: 80 });
      return (
        <button data-testid="anchor" {...anchorProps}>
          {isOpen ? "open" : "closed"}
        </button>
      );
    }

    const { getByTestId } = render(<Target />);
    const anchor = getByTestId("anchor");

    await act(async () => {
      fireEvent.pointerEnter(anchor, { clientX: 0, clientY: 0 });
      vi.advanceTimersByTime(30);
      fireEvent.pointerMove(anchor, { clientX: 5, clientY: 5 });
    });

    await act(async () => {
      vi.advanceTimersByTime(60);
    });

    expect(anchor).toHaveTextContent("closed");

    await act(async () => {
      vi.advanceTimersByTime(80);
    });

    expect(anchor).toHaveTextContent("open");
  });

  it("세이프 폴리곤을 사용할 때 포인터가 경유 영역에 있으면 닫힘을 지연한다", async () => {
    vi.useFakeTimers();

    function Overlay() {
      const { anchorProps, floatingProps, isOpen } = useHoverIntent({
        defaultOpen: true,
        closeDelay: 150
      });

      return (
        <div>
          <button data-testid="anchor" {...anchorProps}>
            anchor
          </button>
          <div data-testid="floating" {...floatingProps}>
            {isOpen ? "open" : "closed"}
          </div>
        </div>
      );
    }

    const { getByTestId } = render(<Overlay />);
    const anchor = getByTestId("anchor");
    const floating = getByTestId("floating");

    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      top: 0,
      right: 100,
      bottom: 20,
      left: 0,
      toJSON: () => ({})
    });

    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue({
      x: 150,
      y: 0,
      width: 80,
      height: 40,
      top: 0,
      right: 230,
      bottom: 40,
      left: 150,
      toJSON: () => ({})
    });

    expect(floating).toHaveTextContent("open");

    await act(async () => {
      fireEvent.pointerLeave(anchor, { clientX: 120, clientY: 10 });
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(floating).toHaveTextContent("open");

    await act(async () => {
      fireEvent.pointerMove(document.body, { clientX: 400, clientY: 10 });
      vi.advanceTimersByTime(150);
    });

    expect(floating).toHaveTextContent("closed");
  });
});
