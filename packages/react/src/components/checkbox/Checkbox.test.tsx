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

  it("disabled 시 상호작용을 차단한다", () => {
    render(<Checkbox label="비활성" disabled defaultChecked={false} />);

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });
});
