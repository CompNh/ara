import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TextField } from "./TextField.js";

describe("TextField", () => {
  afterEach(() => {
    cleanup();
  });

  it("연결된 label/helper/error를 렌더링하고 aria를 설정한다", () => {
    const { getByLabelText, getByText } = render(
      <TextField label="이메일" helperText="helper" errorText="error" required />
    );

    const input = getByLabelText(/이메일/) as HTMLInputElement;
    const helper = getByText("helper");
    const error = getByText("error");

    expect(input).toHaveAttribute("aria-describedby", `${error.id} ${helper.id}`);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(helper.id).toContain(input.id);
    expect(error.id).toContain(input.id);
  });

  it("clearable과 Escape 키로 값을 초기화한다", () => {
    const onValueChange = vi.fn();
    const { getByRole, getByLabelText } = render(
      <TextField label="이름" clearable defaultValue="hello" onValueChange={onValueChange} />
    );

    const input = getByLabelText("이름") as HTMLInputElement;
    const clearButton = getByRole("button", { name: "입력 지우기" });

    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: "next" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
  });

  it("passwordToggle로 입력 타입을 전환한다", () => {
    const { getByRole, getByLabelText } = render(
      <TextField label="비밀번호" type="password" passwordToggle />
    );

    const input = getByLabelText(/^비밀번호$/) as HTMLInputElement;
    const toggle = getByRole("button", { name: "비밀번호 보이기" });

    expect(input.type).toBe("password");

    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(document.activeElement).toBe(input);

    fireEvent.click(toggle);
    expect(input.type).toBe("password");
  });

  it("Enter 키로 onCommit을 발화하고 IME 조합 중에는 무시한다", () => {
    const onCommit = vi.fn();
    const { getByLabelText } = render(
      <TextField label="닉네임" defaultValue="ara" onCommit={onCommit} />
    );

    const input = getByLabelText("닉네임");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("ara");

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "가" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
