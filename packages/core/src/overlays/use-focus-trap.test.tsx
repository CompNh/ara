import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFocusTrap } from "./use-focus-trap.js";

describe("useFocusTrap", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  it("loops focus within the container using focus guards", async () => {
    function Trap() {
      const { containerProps, beforeFocusGuardProps, afterFocusGuardProps } = useFocusTrap();

      return (
        <div>
          <span data-testid="before" {...beforeFocusGuardProps} />
          <div data-testid="container" {...containerProps}>
            <button data-testid="first">first</button>
            <button data-testid="last">last</button>
          </div>
          <span data-testid="after" {...afterFocusGuardProps} />
        </div>
      );
    }

    const { getByTestId } = render(<Trap />);

    const first = getByTestId("first");
    const last = getByTestId("last");

    await act(async () => {});

    expect(first).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(last).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(first).toHaveFocus();
  });

  it("restores the previously focused element on cleanup", async () => {
    const outsideButton = document.createElement("button");
    document.body.appendChild(outsideButton);

    outsideButton.focus();

    function Trap() {
      const { containerProps, beforeFocusGuardProps, afterFocusGuardProps } = useFocusTrap();

      return (
        <div>
          <span data-testid="before" {...beforeFocusGuardProps} />
          <div data-testid="container" {...containerProps}>
            <button data-testid="inside">inside</button>
          </div>
          <span data-testid="after" {...afterFocusGuardProps} />
        </div>
      );
    }

    const { unmount, getByTestId } = render(<Trap />);

    await act(async () => {});

    expect(getByTestId("inside")).toHaveFocus();

    unmount();

    expect(outsideButton).toHaveFocus();

    outsideButton.remove();
  });

  it("only the top-most trap responds when multiple traps are active", async () => {
    function MultiTrap() {
      const outer = useFocusTrap();
      const inner = useFocusTrap();

      return (
        <div>
          <span data-testid="outer-before" {...outer.beforeFocusGuardProps} />
          <div data-testid="outer" {...outer.containerProps}>
            <button data-testid="outer-first">outer-first</button>
            <span data-testid="inner-before" {...inner.beforeFocusGuardProps} />
            <div data-testid="inner" {...inner.containerProps}>
              <button data-testid="inner-first">inner-first</button>
              <button data-testid="inner-last">inner-last</button>
            </div>
            <span data-testid="inner-after" {...inner.afterFocusGuardProps} />
            <button data-testid="outer-last">outer-last</button>
          </div>
          <span data-testid="outer-after" {...outer.afterFocusGuardProps} />
        </div>
      );
    }

    const { getByTestId } = render(<MultiTrap />);

    const innerFirst = getByTestId("inner-first");
    const innerLast = getByTestId("inner-last");

    await act(async () => {});

    expect(innerFirst).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(innerLast).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(innerFirst).toHaveFocus();
  });
});
