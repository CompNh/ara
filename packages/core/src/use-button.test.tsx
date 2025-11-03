import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { forwardRef, type PropsWithChildren } from "react";
import { useButton, type UseButtonOptions } from "./use-button.js";

describe("useButton", () => {
  afterEach(() => {
    cleanup();
  });

  function TestButton({
    options,
    children = "button"
  }: PropsWithChildren<{ options?: UseButtonOptions }>) {
    const { buttonProps, isPressed } = useButton<HTMLButtonElement>(options);

    return (
      <button data-pressed={isPressed} {...buttonProps}>
        {children}
      </button>
    );
  }

  it("fires press lifecycle for pointer interactions", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const { getByRole } = render(
      <TestButton
        options={{
          onPressStart,
          onPressEnd,
          onPress
        }}
      />
    );

    const button = getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "pressstart", pointerType: "mouse" })
    );
    expect(button).toHaveAttribute("data-pressed", "true");

    fireEvent.pointerUp(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "pressend", pointerType: "mouse" })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "press", pointerType: "mouse" })
    );
    expect(button).toHaveAttribute("data-pressed", "false");
  });

  it("cancels pointer press on leave", () => {
    const onPress = vi.fn();
    const onPressEnd = vi.fn();
    const { getByRole } = render(<TestButton options={{ onPress, onPressEnd }} />);

    const button = getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 5, pointerType: "mouse", button: 0 });
    fireEvent.pointerLeave(button, { pointerId: 5, pointerType: "mouse" });
    fireEvent.pointerUp(button, { pointerId: 5, pointerType: "mouse", button: 0 });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("data-pressed", "false");
  });

  it("handles keyboard space press for links", () => {
    const clickSpy = vi.fn();
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();

    const LinkButton = forwardRef<HTMLAnchorElement, PropsWithChildren<{ options?: UseButtonOptions }>>(
      function LinkButton({ options, children = "link" }, ref) {
        const { buttonProps, isPressed } = useButton<HTMLAnchorElement>({
          ...options,
          elementType: "link"
        });

        return (
          <a ref={ref} data-pressed={isPressed} {...buttonProps} onClick={clickSpy}>
            {children}
          </a>
        );
      }
    );

    const { getByText } = render(
      <LinkButton
        options={{
          onPress,
          onPressStart,
          onPressEnd
        }}
      >
        label
      </LinkButton>
    );

    const anchor = getByText("label");

    fireEvent.keyDown(anchor, { key: " ", code: "Space" });
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(anchor).toHaveAttribute("data-pressed", "true");

    fireEvent.keyUp(anchor, { key: " ", code: "Space" });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(anchor).toHaveAttribute("data-pressed", "false");
  });

  it("blocks interactions when disabled or loading", () => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const { getByRole, rerender } = render(
      <TestButton options={{ onPress, onPressStart, disabled: true }} />
    );

    const button = getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 3, pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(button, { pointerId: 3, pointerType: "mouse", button: 0 });
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: "Enter" });

    expect(onPressStart).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("data-pressed", "false");

    rerender(
      <TestButton options={{ onPress, onPressStart, loading: true }} />
    );

    fireEvent.pointerDown(button, { pointerId: 4, pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(button, { pointerId: 4, pointerType: "mouse", button: 0 });

    expect(onPressStart).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
