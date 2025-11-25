import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { type PropsWithChildren, useState } from "react";
import { useSwitch, type UseSwitchOptions } from "./use-switch.js";

describe("useSwitch", () => {
  afterEach(() => {
    cleanup();
  });

  function SwitchField({
    options,
    withLabel = true,
    withDescription = false
  }: PropsWithChildren<{
    options?: UseSwitchOptions;
    withLabel?: boolean;
    withDescription?: boolean;
  }>) {
    const { rootProps, inputProps, labelProps, descriptionProps, isChecked } = useSwitch({
      ...options,
      hasLabel: withLabel,
      hasDescription: withDescription
    });

    return (
      <div data-testid="root" {...rootProps} data-checked={isChecked}>
        <input data-testid="input" {...inputProps} />
        {withLabel ? (
          <label data-testid="label" {...labelProps}>
            label
          </label>
        ) : null}
        {withDescription ? (
          <p data-testid="description" {...descriptionProps}>
            description
          </p>
        ) : null}
        <span data-testid="state">{String(isChecked)}</span>
      </div>
    );
  }

  it("generates ids and aria attributes for label/description", () => {
    const { getByTestId } = render(
      <SwitchField
        withDescription
        options={{
          id: "switch-id",
          required: true,
          invalid: true
        }}
      />
    );

    const root = getByTestId("root");
    const input = getByTestId("input");
    const label = getByTestId("label");
    const description = getByTestId("description");

    expect(label).toHaveAttribute("id", "switch-id-label");
    expect(label).toHaveAttribute("for", "switch-id");
    expect(description).toHaveAttribute("id", "switch-id-description");

    expect(root).toHaveAttribute("aria-labelledby", "switch-id-label");
    expect(root.getAttribute("aria-describedby")).toBe("switch-id-description");
    expect(root).toHaveAttribute("aria-required", "true");
    expect(root).toHaveAttribute("aria-invalid", "true");

    expect(input).toHaveAttribute("id", "switch-id");
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveAttribute("aria-labelledby", "switch-id-label");
    expect(input.getAttribute("aria-describedby")).toBe("switch-id-description");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("merges external labelling and description ids", () => {
    const { getByTestId } = render(
      <SwitchField
        withDescription
        options={{
          id: "merge-id",
          describedByIds: ["external-description"],
          labelledByIds: ["external-label"]
        }}
      />
    );

    const root = getByTestId("root");
    const input = getByTestId("input");

    expect(root.getAttribute("aria-labelledby")).toBe("merge-id-label external-label");
    expect(input.getAttribute("aria-labelledby")).toBe("merge-id-label external-label");
    expect(root.getAttribute("aria-describedby")).toBe("merge-id-description external-description");
    expect(input.getAttribute("aria-describedby")).toBe("merge-id-description external-description");
  });

  it("toggles checked state on interactions", () => {
    const onCheckedChange = vi.fn();
    const { getByTestId } = render(
      <SwitchField
        options={{
          defaultChecked: false,
          onCheckedChange
        }}
      />
    );

    const root = getByTestId("root");
    const input = getByTestId("input") as HTMLInputElement;
    const state = getByTestId("state");

    expect(root).toHaveAttribute("data-state", "unchecked");
    expect(input.checked).toBe(false);

    fireEvent.click(root);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(state.textContent).toBe("true");
    expect(root).toHaveAttribute("data-state", "checked");
    expect(input.checked).toBe(true);

    fireEvent.keyDown(root, { key: " " });
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(state.textContent).toBe("false");
    expect(root).toHaveAttribute("data-state", "unchecked");
    expect(input.checked).toBe(false);
  });

  it("respects controlled checked state", () => {
    function ControlledSwitch() {
      const [value, setValue] = useState<UseSwitchOptions["checked"]>(true);
      const handleChange = (next: UseSwitchOptions["checked"]) => setValue(next);
      const { rootProps, inputProps, isChecked } = useSwitch({ checked: value, onCheckedChange: handleChange });

      return (
        <div data-testid="root" {...rootProps}>
          <input data-testid="input" {...inputProps} />
          <span data-testid="state">{String(isChecked)}</span>
        </div>
      );
    }

    const { getByTestId } = render(<ControlledSwitch />);
    const root = getByTestId("root");
    const input = getByTestId("input") as HTMLInputElement;
    const state = getByTestId("state");

    expect(input.checked).toBe(true);

    fireEvent.click(root);
    expect(state.textContent).toBe("false");
    fireEvent.keyDown(root, { key: "Enter" });
    expect(state.textContent).toBe("true");
  });

  it("blocks toggling when disabled or readOnly", () => {
    const { getByTestId: getDisabled, unmount } = render(
      <SwitchField
        options={{
          defaultChecked: true,
          disabled: true
        }}
      />
    );

    const disabledRoot = getDisabled("root");
    const disabledInput = getDisabled("input") as HTMLInputElement;

    fireEvent.click(disabledRoot);
    expect(disabledInput.checked).toBe(true);

    unmount();

    const { getByTestId: getReadOnly } = render(
      <SwitchField
        options={{
          defaultChecked: false,
          readOnly: true
        }}
      />
    );

    const readOnlyRoot = getReadOnly("root");
    const readOnlyInput = getReadOnly("input") as HTMLInputElement;

    fireEvent.keyDown(readOnlyRoot, { key: " " });
    expect(readOnlyInput.checked).toBe(false);
  });
});
