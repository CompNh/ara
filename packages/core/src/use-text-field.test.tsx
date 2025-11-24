import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { type PropsWithChildren, useState } from "react";
import { useTextField, type UseTextFieldOptions } from "./use-text-field.js";

describe("useTextField", () => {
  afterEach(() => {
    cleanup();
  });

  function Field({
    options,
    withLabel = true,
    withHelper = false,
    withError = false
  }: PropsWithChildren<{
    options?: UseTextFieldOptions;
    withLabel?: boolean;
    withHelper?: boolean;
    withError?: boolean;
  }>) {
    const { inputProps, labelProps, descriptionProps, errorProps, value, isComposing } =
      useTextField({
        ...options,
        hasLabel: withLabel,
        hasHelperText: withHelper,
        hasErrorText: withError
      });

    return (
      <div data-value={value} data-composing={isComposing}>
        {withLabel ? (
          <label data-testid="label" {...labelProps}>
            label
          </label>
        ) : null}
        <input data-testid="input" {...inputProps} />
        {withHelper ? (
          <p data-testid="helper" {...descriptionProps}>
            helper
          </p>
        ) : null}
        {withError ? (
          <p data-testid="error" {...errorProps}>
            error
          </p>
        ) : null}
      </div>
    );
  }

  it("generates ids and aria connections", () => {
    const { getByTestId } = render(
      <Field
        withHelper
        withError
        options={{
          required: true,
          id: "custom-id"
        }}
      />
    );

    const input = getByTestId("input");
    const label = getByTestId("label");
    const helper = getByTestId("helper");
    const error = getByTestId("error");

    expect(label).toHaveAttribute("id", "custom-id-label");
    expect(label).toHaveAttribute("for", "custom-id");
    expect(helper).toHaveAttribute("id", "custom-id-description");
    expect(error).toHaveAttribute("id", "custom-id-error");

    expect(input).toHaveAttribute("id", "custom-id");
    expect(input).toHaveAttribute("aria-labelledby", "custom-id-label");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBe("custom-id-error custom-id-description");
  });

  it("merges external labelled/description ids into aria attributes", () => {
    const { getByTestId } = render(
      <Field
        withHelper
        options={{
          id: "merge-id",
          labelledByIds: ["external-label"],
          describedByIds: ["external-description"]
        }}
      />
    );

    const input = getByTestId("input");
    const helper = getByTestId("helper");

    expect(input).toHaveAttribute("aria-labelledby", "merge-id-label external-label");
    expect(input.getAttribute("aria-describedby")).toBe("merge-id-description external-description");
  });

  it("handles uncontrolled value updates", () => {
    const onValueChange = vi.fn();
    const { getByTestId, container } = render(
      <Field
        options={{
          defaultValue: "hello",
          onValueChange
        }}
      />
    );

    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toBe("hello");
    expect(container.firstChild).toHaveAttribute("data-value", "hello");

    fireEvent.change(input, { target: { value: "world" } });

    expect(onValueChange).toHaveBeenCalledWith("world");
    expect(input.value).toBe("world");
    expect(container.firstChild).toHaveAttribute("data-value", "world");
  });

  it("respects controlled values", () => {
    function ControlledField() {
      const [val, setVal] = useState("init");
      const handleValueChange = (next: string) => setVal(next);

      const { inputProps } = useTextField({
        value: val,
        onValueChange: handleValueChange
      });

      return <input data-testid="input" {...inputProps} />;
    }

    const { getByTestId } = render(<ControlledField />);
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "next" } });

    expect(input.value).toBe("next");
  });

  it("fires onCommit on Enter when not composing", () => {
    const onCommit = vi.fn();
    const { getByTestId } = render(
      <Field
        options={{
          onCommit,
          defaultValue: "value"
        }}
      />
    );

    const input = getByTestId("input");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("value");
  });

  it("ignores Enter commits during composition", () => {
    const onCommit = vi.fn();
    const { getByTestId, container } = render(
      <Field
        options={{
          onCommit,
          defaultValue: "start"
        }}
      />
    );

    const input = getByTestId("input");

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "가" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).not.toHaveBeenCalled();
    expect(container.firstChild).toHaveAttribute("data-composing", "true");

    fireEvent.compositionEnd(input, { data: "가" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("가");
  });
});
