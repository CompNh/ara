import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { type PropsWithChildren, useState } from "react";
import { useRadio } from "./use-radio.js";
import { useRadioGroup, type UseRadioGroupOptions } from "./use-radio-group.js";

interface RadioItemOptions {
  readonly value: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly hasDescription?: boolean;
}

function RadioGroupField({
  groupOptions,
  items
}: PropsWithChildren<{
  groupOptions?: UseRadioGroupOptions;
  items: readonly RadioItemOptions[];
}>) {
  const group = useRadioGroup(groupOptions);

  return (
    <div data-testid="group" {...group.rootProps}>
      <label data-testid="group-label" {...group.labelProps}>
        group label
      </label>
      {groupOptions?.hasDescription ? (
        <p data-testid="group-description" {...group.descriptionProps}>
          group description
        </p>
      ) : null}
      {items.map((item) => {
        const { rootProps, inputProps, labelProps, descriptionProps, isChecked } = useRadio({
          value: item.value,
          disabled: item.disabled,
          readOnly: item.readOnly,
          hasDescription: item.hasDescription,
          group
        });

        return (
          <div data-testid={`radio-${item.value}-root`} key={item.value} {...rootProps} data-checked={isChecked}>
            <input data-testid={`radio-${item.value}-input`} {...inputProps} />
            <label data-testid={`radio-${item.value}-label`} {...labelProps}>
              {item.value}
            </label>
            {item.hasDescription ? (
              <p data-testid={`radio-${item.value}-description`} {...descriptionProps}>
                desc {item.value}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

describe("useRadio & useRadioGroup", () => {
  afterEach(() => {
    cleanup();
  });

  it("generates ids, names, and aria attributes for group and radios", async () => {
    const { getByTestId } = render(
      <RadioGroupField
        groupOptions={{ id: "radio-group", hasDescription: true, required: true, invalid: true }}
        items={[
          { value: "a", hasDescription: true },
          { value: "b" }
        ]}
      />
    );

    const group = getByTestId("group");
    const groupLabel = getByTestId("group-label");
    const groupDescription = getByTestId("group-description");

    expect(group).toHaveAttribute("id", "radio-group");
    expect(group).toHaveAttribute("role", "radiogroup");
    expect(group.getAttribute("aria-labelledby")).toBe("radio-group-label");
    expect(group.getAttribute("aria-describedby")).toBe("radio-group-description");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(groupLabel).toHaveAttribute("for", "radio-group");
    expect(groupDescription).toHaveAttribute("id", "radio-group-description");

    const radioAInput = getByTestId("radio-a-input");
    const radioALabel = getByTestId("radio-a-label");
    const radioADescription = getByTestId("radio-a-description");

    const radioAId = radioAInput.getAttribute("id");
    const radioALabelId = radioALabel.getAttribute("id");
    const radioADescriptionId = radioADescription.getAttribute("id");

    expect(radioAInput).toHaveAttribute("name", "radio-group");
    expect(radioALabel).toHaveAttribute("for", radioAId);
    expect(radioALabelId).toBe(`${radioAId}-label`);
    expect(radioADescriptionId).toBe(`${radioAId}-description`);
    expect(radioAInput.getAttribute("aria-labelledby")).toBe(radioALabelId);
    expect(radioAInput.getAttribute("aria-describedby")).toBe(radioADescriptionId);
  });

  it("manages roving tab index and arrow navigation while skipping disabled items", async () => {
    const { getByTestId } = render(
      <RadioGroupField
        items={[
          { value: "a" },
          { value: "b", disabled: true },
          { value: "c" }
        ]}
      />
    );

    const radioARoot = getByTestId("radio-a-root");
    const radioBRoot = getByTestId("radio-b-root");
    const radioCRoot = getByTestId("radio-c-root");

    await waitFor(() => {
      expect(radioARoot).toHaveAttribute("tabindex", "0");
    });
    expect(radioBRoot).toHaveAttribute("tabindex", "-1");
    expect(radioCRoot).toHaveAttribute("tabindex", "-1");

    radioARoot.focus();
    fireEvent.keyDown(radioARoot, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(radioCRoot);
    });
    expect(radioARoot).toHaveAttribute("tabindex", "-1");
    expect(radioCRoot).toHaveAttribute("tabindex", "0");
  });

  it("selects the focused radio with space and reports value changes", async () => {
    const onValueChange = vi.fn();
    const { getByTestId } = render(
      <RadioGroupField
        groupOptions={{ onValueChange }}
        items={[
          { value: "a" },
          { value: "b" }
        ]}
      />
    );

    const radioARoot = getByTestId("radio-a-root");
    const radioBRoot = getByTestId("radio-b-root");
    const radioBInput = getByTestId("radio-b-input");

    radioARoot.focus();
    fireEvent.keyDown(radioARoot, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(radioBRoot));

    fireEvent.keyDown(radioBRoot, { key: " " });
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(radioBRoot).toHaveAttribute("data-state", "checked");
    expect((radioBInput as HTMLInputElement).checked).toBe(true);
  });

  it("respects controlled value", async () => {
    function ControlledRadioGroup() {
      const [value, setValue] = useState("a");
      const handleChange = (next: string) => setValue(next);
      const group = useRadioGroup({ value, onValueChange: handleChange });
      const radioA = useRadio({ value: "a", group });
      const radioB = useRadio({ value: "b", group });

      return (
        <div>
          <div data-testid="radio-a-root" {...radioA.rootProps}>
            <input data-testid="radio-a-input" {...radioA.inputProps} />
          </div>
          <div data-testid="radio-b-root" {...radioB.rootProps}>
            <input data-testid="radio-b-input" {...radioB.inputProps} />
          </div>
          <span data-testid="value">{value}</span>
        </div>
      );
    }

    const { getByTestId } = render(<ControlledRadioGroup />);
    const radioARoot = getByTestId("radio-a-root");
    const radioBRoot = getByTestId("radio-b-root");
    const valueDisplay = getByTestId("value");

    expect(valueDisplay.textContent).toBe("a");
    fireEvent.click(radioARoot);
    expect(valueDisplay.textContent).toBe("a");

    fireEvent.keyDown(radioARoot, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(radioBRoot));
    fireEvent.keyDown(radioBRoot, { key: " " });
    expect(valueDisplay.textContent).toBe("b");
  });

  it("blocks selection when disabled or readOnly", () => {
    const { getByTestId: getDisabled } = render(
      <RadioGroupField
        groupOptions={{ disabled: true }}
        items={[
          { value: "a" }
        ]}
      />
    );

    const disabledRoot = getDisabled("radio-a-root");
    fireEvent.click(disabledRoot);
    expect(disabledRoot).toHaveAttribute("data-state", "unchecked");

    cleanup();

    const { getByTestId: getReadOnly } = render(
      <RadioGroupField
        groupOptions={{ readOnly: true }}
        items={[
          { value: "a" }
        ]}
      />
    );

    const readOnlyRoot = getReadOnly("radio-a-root");
    fireEvent.keyDown(readOnlyRoot, { key: " " });
    expect(readOnlyRoot).toHaveAttribute("data-state", "unchecked");
  });
});
