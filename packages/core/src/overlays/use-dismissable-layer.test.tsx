import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useDismissableLayer } from "./use-dismissable-layer.js";

describe("useDismissableLayer", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  it("dismisses on pointer down outside", async () => {
    const onDismiss = vi.fn();

    function Layer() {
      const { containerProps } = useDismissableLayer({ onDismiss });
      return (
        <div>
          <div data-testid="container" {...containerProps}>
            <button data-testid="inside">inside</button>
          </div>
          <button data-testid="outside">outside</button>
        </div>
      );
    }

    const { getByTestId } = render(<Layer />);

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("inside") });
    });

    expect(onDismiss).not.toHaveBeenCalled();

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pointer-down-outside" })
    );
  });

  it("dismisses on escape key press", async () => {
    const onDismiss = vi.fn();

    function Layer() {
      const { containerProps } = useDismissableLayer({ onDismiss });
      return (
        <div>
          <div data-testid="container" {...containerProps}>
            <button data-testid="inside">inside</button>
          </div>
        </div>
      );
    }

    render(<Layer />);

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(
      expect.objectContaining({ type: "escape-key" })
    );
  });

  it("dismisses on focus moving outside", async () => {
    const onDismiss = vi.fn();

    function Layer() {
      const { containerProps } = useDismissableLayer({ onDismiss });
      return (
        <div>
          <div data-testid="container" {...containerProps}>
            <button data-testid="inside">inside</button>
          </div>
          <button data-testid="outside">outside</button>
        </div>
      );
    }

    const { getByTestId } = render(<Layer />);

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("inside") });
      await user.tab();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(expect.objectContaining({ type: "focus-outside" }));
  });

  it("only the top-most layer responds to dismissal triggers", async () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();

    function Layers() {
      const outer = useDismissableLayer({ onDismiss: outerDismiss });
      const inner = useDismissableLayer({ onDismiss: innerDismiss });

      return (
        <div>
          <div data-testid="outer" {...outer.containerProps}>
            <button data-testid="outer-button">outer</button>
            <div data-testid="inner" {...inner.containerProps}>
              <button data-testid="inner-button">inner</button>
            </div>
          </div>
          <button data-testid="outside">outside</button>
        </div>
      );
    }

    const { getByTestId } = render(<Layers />);

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
    });

    const dismissCountAfterOutside = innerDismiss.mock.calls.length;
    expect(dismissCountAfterOutside).toBeGreaterThanOrEqual(1);
    expect(outerDismiss).not.toHaveBeenCalled();

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outer-button") });
    });

    const dismissCountAfterOuterClick = innerDismiss.mock.calls.length;
    expect(dismissCountAfterOuterClick).toBe(dismissCountAfterOutside + 1);
    expect(outerDismiss).not.toHaveBeenCalled();

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    expect(innerDismiss).toHaveBeenCalledTimes(dismissCountAfterOuterClick + 1);
    expect(outerDismiss).not.toHaveBeenCalled();
  });

  it("respects defaultPrevented on outside handlers", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn((event: PointerEvent) => event.preventDefault());

    function Layer() {
      const { containerProps } = useDismissableLayer({ onDismiss, onPointerDownOutside });
      return (
        <div>
          <div data-testid="container" {...containerProps}>
            <button data-testid="inside">inside</button>
          </div>
          <button data-testid="outside">outside</button>
        </div>
      );
    }

    const { getByTestId } = render(<Layer />);

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
    });

    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
