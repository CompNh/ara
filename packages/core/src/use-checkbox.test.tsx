import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { type PropsWithChildren, useState } from "react";
import { useCheckbox, type UseCheckboxOptions } from "./use-checkbox.js";

describe("useCheckbox", () => {
  afterEach(() => {
    cleanup();
  });

  function CheckboxField({
    options,
    withLabel = true,
    withDescription = false
  }: PropsWithChildren<{
    options?: UseCheckboxOptions;
    withLabel?: boolean;
    withDescription?: boolean;
  }>) {
    const { rootProps, inputProps, labelProps, descriptionProps, checkedState, isChecked, isIndeterminate } =
      useCheckbox({
        ...options,
        hasLabel: withLabel,
        hasDescription: withDescription
      });

    return (
      <div data-testid="root" {...rootProps} data-checked={isChecked} data-indeterminate={isIndeterminate}>
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
        <span data-testid="state">{String(checkedState)}</span>
      </div>
    );
  }

  it("generates ids and aria attributes for label/description", () => {
    const { getByTestId } = render(
      <CheckboxField
        withDescription
        options={{
          id: "checkbox-id",
          required: true,
          invalid: true
        }}
      />
    );

    const root = getByTestId("root");
    const input = getByTestId("input");
    const label = getByTestId("label");
    const description = getByTestId("description");

    expect(label).toHaveAttribute("id", "checkbox-id-label");
    expect(label).toHaveAttribute("for", "checkbox-id");
    expect(description).toHaveAttribute("id", "checkbox-id-description");

    expect(root).toHaveAttribute("aria-labelledby", "checkbox-id-label");
    expect(root.getAttribute("aria-describedby")).toBe("checkbox-id-description");
    expect(root).toHaveAttribute("aria-required", "true");
    expect(root).toHaveAttribute("aria-invalid", "true");

    expect(input).toHaveAttribute("id", "checkbox-id");
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveAttribute("aria-labelledby", "checkbox-id-label");
    expect(input.getAttribute("aria-describedby")).toBe("checkbox-id-description");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("merges external labelling and description ids", () => {
    const { getByTestId } = render(
      <CheckboxField
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

  it("cycles indeterminate → checked → unchecked on interactions", () => {
    const onCheckedChange = vi.fn();
    const { getByTestId } = render(
      <CheckboxField
        withDescription
        options={{
          defaultChecked: "indeterminate",
          onCheckedChange
        }}
      />
    );

    const root = getByTestId("root");
    const input = getByTestId("input") as HTMLInputElement;
    const state = getByTestId("state");

    expect(root).toHaveAttribute("data-state", "indeterminate");
    expect(input.indeterminate).toBe(true);

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
    function ControlledCheckbox() {
      const [value, setValue] = useState<UseCheckboxOptions["checked"]>("indeterminate");
      const handleChange = (next: UseCheckboxOptions["checked"]) => setValue(next);
      const { rootProps, inputProps, checkedState } = useCheckbox({ checked: value, onCheckedChange: handleChange });

      return (
        <div data-testid="root" {...rootProps}>
          <input data-testid="input" {...inputProps} />
          <span data-testid="state">{String(checkedState)}</span>
        </div>
      );
    }

    const { getByTestId } = render(<ControlledCheckbox />);
    const root = getByTestId("root");
    const input = getByTestId("input") as HTMLInputElement;
    const state = getByTestId("state");

    expect(input.indeterminate).toBe(true);

    fireEvent.click(root);
    expect(state.textContent).toBe("true");
    fireEvent.keyDown(root, { key: "Enter" });
    expect(state.textContent).toBe("false");
  });

  it("blocks toggling when disabled or readOnly", () => {
    const { getByTestId: getDisabled, unmount } = render(
      <CheckboxField
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
      <CheckboxField
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
