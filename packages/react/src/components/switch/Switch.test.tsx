import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Switch } from "./Switch.js";

describe("Switch", () => {
  it("트랙/썸 UI와 aria/data 속성을 동기화하며 토글된다", () => {
    render(<Switch label="전원" defaultChecked={false} />);

    const switchControl = screen.getByRole("switch");
    const input = document.querySelector("input[type='checkbox']") as HTMLInputElement;

    expect(switchControl).toHaveAttribute("aria-checked", "false");
    expect(switchControl).toHaveAttribute("data-state", "unchecked");
    expect(input.checked).toBe(false);

    fireEvent.click(switchControl);

    expect(switchControl).toHaveAttribute("aria-checked", "true");
    expect(switchControl).toHaveAttribute("data-state", "checked");
    expect(input.checked).toBe(true);

    fireEvent.keyDown(switchControl, { key: " " });

    expect(switchControl).toHaveAttribute("aria-checked", "false");
    expect(switchControl).toHaveAttribute("data-state", "unchecked");
    expect(input.checked).toBe(false);
  });

  it("레이블 클릭으로 토글되고 aria 연결을 유지한다", () => {
    render(<Switch label="라벨" description="설명" />);

    const switchControl = screen.getByRole("switch");
    const label = screen.getByText("라벨");
    const description = screen.getByText("설명");

    expect(switchControl.getAttribute("aria-labelledby")).toContain(label.getAttribute("id"));
    expect(switchControl.getAttribute("aria-describedby")).toContain(description.getAttribute("id"));

    fireEvent.click(label);

    expect(switchControl).toHaveAttribute("data-state", "checked");
  });

  it("disabled/readOnly 상태에서는 토글되지 않는다", () => {
    render(<Switch label="비활성" disabled defaultChecked={false} />);

    const disabledSwitch = screen.getByRole("switch");

    fireEvent.click(disabledSwitch);

    expect(disabledSwitch).toHaveAttribute("data-state", "unchecked");

    render(<Switch label="읽기전용" readOnly defaultChecked />);

    const readOnlySwitch = screen.getAllByRole("switch")[1];

    fireEvent.keyDown(readOnlySwitch, { key: "Enter" });

    expect(readOnlySwitch).toHaveAttribute("data-state", "checked");
  });
});
