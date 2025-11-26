import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("required 옵션일 때 빨간색 표시를 렌더링한다", () => {
    render(<Checkbox label="필수" required />);

    const requiredMark = screen.getByTestId("checkbox-required-indicator");

    expect(requiredMark).toHaveTextContent("*");
    expect(requiredMark).toHaveStyle({ color: "var(--ara-checkbox-required, #d93025)" });
  });

  it("disabled 시 상호작용을 차단한다", () => {
    render(<Checkbox label="비활성" disabled defaultChecked={false} />);

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("네이티브 폼 제출/리셋 흐름과 동일하게 동작한다", async () => {
    const submissions: Array<FormDataEntryValue[]> = [];

    const { container } = render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget as HTMLFormElement);
          submissions.push(formData.getAll("agree"));
        }}
      >
        <Checkbox name="agree" value="yes" label="동의" defaultChecked />
        <button type="submit">제출</button>
        <button type="reset">리셋</button>
      </form>
    );

    const form = container.querySelector("form") as HTMLFormElement;
    const checkbox = screen.getByRole("checkbox");

    fireEvent.submit(form);
    expect(submissions.at(-1)).toEqual(["yes"]);

    fireEvent.click(checkbox);
    fireEvent.submit(form);
    expect(submissions.at(-1)).toEqual([]);

    form.reset();
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });
  });

  it("키보드 입력으로 상태를 전환하고 onCheckedChange 콜백을 호출한다", () => {
    const handleChange = vi.fn();

    render(
      <Checkbox
        label="스페이스/엔터"
        defaultChecked="indeterminate"
        onCheckedChange={handleChange}
      />
    );

    const checkbox = screen.getByRole("checkbox");

    fireEvent.keyDown(checkbox, { key: " " });

    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(handleChange).toHaveBeenLastCalledWith(true);

    fireEvent.keyDown(checkbox, { key: "Enter" });

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    expect(handleChange).toHaveBeenLastCalledWith(false);
  });

  it("스택 레이아웃에서 라벨과 설명을 컨트롤 위로 배치한다", () => {
    render(<Checkbox layout="stacked" label="레이블" description="세부설명" />);

    const checkbox = screen.getByRole("checkbox");
    const label = screen.getByText("레이블");
    const description = screen.getByText("세부설명");
    const root = checkbox.parentElement as HTMLElement;
    const textBlock = label.parentElement as HTMLElement;

    expect(root.style.flexDirection).toBe("column");
    expect(root.contains(textBlock)).toBe(true);
    expect(textBlock.compareDocumentPosition(checkbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(description.compareDocumentPosition(checkbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
