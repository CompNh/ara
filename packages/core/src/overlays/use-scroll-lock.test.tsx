import { cleanup, render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useScrollLock } from "./use-scroll-lock.js";

function TestComponent({ active = true }: { active?: boolean }) {
  useScrollLock({ active });
  return null;
}

describe("useScrollLock", () => {
  beforeEach(() => {
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(980);
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1000);
  });

  afterEach(() => {
    cleanup();
    document.body.style.cssText = "";
    vi.restoreAllMocks();
  });

  it("락이 활성화되면 스크롤과 터치 이동을 차단하고 언마운트 시 복원한다", () => {
    const body = document.body;
    body.style.paddingRight = "8px";

    const { unmount } = render(<TestComponent />);

    expect(body.style.overflow).toBe("hidden");
    expect(body.style.overscrollBehavior).toBe("none");
    expect(body.style.paddingRight).toBe("28px");

    const touchEvent = new Event("touchmove", { cancelable: true, bubbles: true });
    body.dispatchEvent(touchEvent);
    expect(touchEvent.defaultPrevented).toBe(true);

    unmount();

    expect(body.style.overflow).toBe("");
    expect(body.style.overscrollBehavior).toBe("");
    expect(body.style.paddingRight).toBe("8px");
  });

  it("중첩된 락이 해제될 때 마지막까지 스타일을 유지한다", () => {
    const First = () => <TestComponent />;
    const Second = () => <TestComponent />;

    const first = render(<First />);
    const second = render(<Second />);

    expect(document.body.style.overflow).toBe("hidden");

    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    second.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("active=false이면 스타일을 적용하지 않고 토글 시 반영한다", () => {
    const { rerender, unmount } = render(<TestComponent active={false} />);

    expect(document.body.style.overflow).toBe("");

    rerender(<TestComponent active />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<TestComponent active={false} />);
    expect(document.body.style.overflow).toBe("");

    unmount();
  });

  it("body나 html에서 시작된 터치 이벤트만 차단하고 오버레이 요소는 허용한다", () => {
    render(<TestComponent />);

    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    const bodyEvent = new Event("touchmove", { cancelable: true, bubbles: true });
    document.body.dispatchEvent(bodyEvent);
    expect(bodyEvent.defaultPrevented).toBe(true);

    const overlayEvent = new Event("touchmove", { cancelable: true, bubbles: true });
    overlay.dispatchEvent(overlayEvent);
    expect(overlayEvent.defaultPrevented).toBe(false);

    overlay.remove();
  });
});
