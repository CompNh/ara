import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
  it("기본 상태에서 토글되고 aria/data 속성을 동기화한다", () => {
    render(<Checkbox label="옵션" defaultChecked={false} />);

    const checkbox = screen.getByRole("checkbox");
    const input = document.querySelector("input[type='checkbox']") as HTMLInputElement;

    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    expect((input as HTMLInputElement).checked).toBe(false);

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect((input as HTMLInputElement).checked).toBe(true);
  });

  it("indeterminate 초기 상태를 설정하고 다음 상호작용에서 해제한다", () => {
    render(<Checkbox label="중간" defaultChecked="indeterminate" />);

    const checkbox = screen.getByRole("checkbox");
    const input = document.querySelector("input[type='checkbox']") as HTMLInputElement;

    expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    expect(input.indeterminate).toBe(true);

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(input.indeterminate).toBe(false);
    expect(input.checked).toBe(true);
  });

  it("label 클릭으로 토글된다", () => {
    render(<Checkbox label="체크" />);

    const checkbox = screen.getByRole("checkbox");
    const label = screen.getByText("체크");

    fireEvent.click(label);

    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("aria 레이블/설명 및 상태 속성을 연결한다", () => {
    render(
      <Checkbox
        label="동의"
        description="설명"
        required
        invalid
        readOnly
        value="agree"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    const label = screen.getByText("동의");
    const description = screen.getByText("설명");
    const input = document.querySelector("input[type='checkbox']")!;

    expect(label).toBeInstanceOf(HTMLLabelElement);
    const labelElement = label as HTMLLabelElement;

    expect(checkbox.getAttribute("aria-labelledby")).toBe(label.id);
    expect(checkbox.getAttribute("aria-describedby")).toBe(description.id);
    expect(checkbox).toHaveAttribute("aria-required", "true");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-readonly", "true");

    expect(input).toHaveAttribute("id", labelElement.htmlFor);
    expect(input.getAttribute("aria-labelledby")).toBe(label.id);
    expect(input.getAttribute("aria-describedby")).toBe(description.id);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-readonly", "true");
  });

  it("disabled 시 상호작용을 차단한다", () => {
    render(<Checkbox label="비활성" disabled defaultChecked={false} />);

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });
});
