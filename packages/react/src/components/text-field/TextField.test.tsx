import "@testing-library/jest-dom/vitest";
import type { ChangeEvent } from "react";
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
    const label = getByText("이메일");
    const helper = getByText("helper");
    const error = getByText("error");

    expect(input).toHaveAttribute("aria-describedby", `${error.id} ${helper.id}`);
    expect(input).toHaveAttribute("aria-labelledby", label.id);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(helper.id).toContain(input.id);
    expect(error.id).toContain(input.id);
  });

  it("외부 aria-labelledby/aria-describedby와 병합한다", () => {
    const { getByLabelText, getByText } = render(
      <>
        <span id="external-label">외부 레이블</span>
        <span id="external-desc">외부 설명</span>
        <TextField
          label="이메일"
          helperText="helper"
          errorText="error"
          aria-labelledby="external-label"
          aria-describedby="external-desc"
        />
      </>
    );

    const input = getByLabelText(/이메일/) as HTMLInputElement;
    const label = getByText("이메일");
    const helper = getByText("helper");
    const error = getByText("error");

    expect(input).toHaveAttribute(
      "aria-labelledby",
      `${label.id} external-label`
    );
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${error.id} ${helper.id} external-desc`
    );
  });

  it("clearable과 Escape 키로 값을 초기화하고 onChange에 동일한 이벤트를 제공한다", () => {
    const onValueChange = vi.fn();
    const changeSnapshot: {
      target: EventTarget | null;
      currentTarget: EventTarget | null;
      name?: string;
      value?: string;
    } = {
      target: null,
      currentTarget: null
    };
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>((event) => {
      changeSnapshot.target = event.target;
      changeSnapshot.currentTarget = event.currentTarget;
      changeSnapshot.name = event.currentTarget.name;
      changeSnapshot.value = event.currentTarget.value;
    });
    const { getByRole, getByLabelText } = render(
      <TextField
        label="이름"
        name="nickname"
        clearable
        defaultValue="hello"
        onValueChange={onValueChange}
        onChange={onChange}
      />
    );

    const input = getByLabelText("이름") as HTMLInputElement;
    const clearButton = getByRole("button", { name: "입력 지우기" });

    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);

    expect(changeSnapshot.target).toBe(changeSnapshot.currentTarget);
    expect(changeSnapshot.value).toBe("");
    expect(changeSnapshot.name).toBe("nickname");

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
