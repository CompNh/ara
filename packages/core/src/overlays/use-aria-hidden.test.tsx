import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { useAriaHidden } from "./use-aria-hidden.js";

describe("useAriaHidden", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  it("hides siblings with aria-hidden and inert by default", async () => {
    function Modal() {
      const { containerProps } = useAriaHidden();

      return (
        <div>
          <div data-testid="background">background</div>
          <div data-testid="overlay" {...containerProps}>
            overlay
          </div>
        </div>
      );
    }

    const { getByTestId } = render(<Modal />);

    await act(async () => {
      await user.tab();
    });

    const background = getByTestId("background");
    const overlay = getByTestId("overlay");

    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background).toHaveAttribute("inert", "");
    expect(overlay).not.toHaveAttribute("aria-hidden");
  });

  it("restores previous attributes when deactivated", async () => {
    function Modal() {
      const [open, setOpen] = useState(true);
      const { containerProps } = useAriaHidden({ active: open });

      return (
        <div>
          <div data-testid="background" aria-hidden="false" inert="">
            background
          </div>
          {open ? (
            <div data-testid="overlay" {...containerProps}>
              overlay
              <button onClick={() => setOpen(false)}>close</button>
            </div>
          ) : null}
        </div>
      );
    }

    const { getByText, getByTestId } = render(<Modal />);

    expect(getByTestId("background")).toHaveAttribute("aria-hidden", "true");

    await act(async () => {
      await user.click(getByText("close"));
    });

    expect(getByTestId("background")).toHaveAttribute("aria-hidden", "false");
    expect(getByTestId("background")).toHaveAttribute("inert", "");
  });

  it("keeps background hidden until the last overlay is removed", async () => {
    function Modal({ label }: { label: string }) {
      const { containerProps } = useAriaHidden();

      return (
        <div data-testid={`overlay-${label}`} {...containerProps}>
          overlay-{label}
        </div>
      );
    }

    function Scene() {
      const [showSecond, setShowSecond] = useState(true);

      return (
        <div>
          <div data-testid="background">background</div>
          <Modal label="one" />
          {showSecond ? <Modal label="two" /> : null}
          <button onClick={() => setShowSecond(false)}>remove</button>
        </div>
      );
    }

    const { getByTestId, getByText } = render(<Scene />);

    const background = getByTestId("background");
    expect(background).toHaveAttribute("aria-hidden", "true");

    await act(async () => {
      await user.click(getByText("remove"));
    });

    expect(background).toHaveAttribute("aria-hidden", "true");
  });

  it("can disable inert while keeping aria-hidden", () => {
    function Modal() {
      const { containerProps } = useAriaHidden({ inert: false });

      return (
        <div>
          <div data-testid="background">background</div>
          <div data-testid="overlay" {...containerProps}>
            overlay
          </div>
        </div>
      );
    }

    const { getByTestId } = render(<Modal />);
    const background = getByTestId("background");

    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background).not.toHaveAttribute("inert");
  });
});
