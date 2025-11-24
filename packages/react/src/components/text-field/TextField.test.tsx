import "@testing-library/jest-dom/vitest";
import { useState, type ChangeEvent } from "react";
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

  it("제어 모드에서 onValueChange/onCommit 흐름과 렌더 값을 동기화한다", () => {
    const onCommit = vi.fn();
    const onValueChange = vi.fn();

    function ControlledField() {
      const [value, setValue] = useState("ara");

      return (
        <TextField
          label="닉네임"
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          onCommit={onCommit}
        />
      );
    }

    const { getByLabelText } = render(<ControlledField />);

    const input = getByLabelText("닉네임") as HTMLInputElement;

    expect(input.value).toBe("ara");

    fireEvent.change(input, { target: { value: "next" } });
    expect(onValueChange).toHaveBeenCalledWith("next");
    expect(input.value).toBe("next");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("next");
  });

  it("비제어 모드에서 defaultValue와 onValueChange/onCommit을 연결한다", () => {
    const onValueChange = vi.fn();
    const onCommit = vi.fn();

    const { getByLabelText } = render(
      <TextField
        label="소개"
        defaultValue="hello"
        onValueChange={onValueChange}
        onCommit={onCommit}
      />
    );

    const input = getByLabelText("소개") as HTMLInputElement;

    expect(input.value).toBe("hello");

    fireEvent.change(input, { target: { value: "welcome" } });
    expect(input.value).toBe("welcome");
    expect(onValueChange).toHaveBeenCalledWith("welcome");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("welcome");
  });

  it("조합 입력 중 clear 버튼이 값을 지우지 않고 종료 후에만 동작한다", () => {
    const onValueChange = vi.fn();

    const { getByLabelText, getByRole } = render(
      <TextField label="이름" defaultValue="가나다" clearable onValueChange={onValueChange} />
    );

    const input = getByLabelText("이름") as HTMLInputElement;
    const clearButton = getByRole("button", { name: "입력 지우기" });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "가나다라" } });
    expect(onValueChange).toHaveBeenCalledWith("가나다라");

    fireEvent.click(clearButton);

    expect(input.value).toBe("가나다라");
    expect(onValueChange).toHaveBeenCalledTimes(1);

    fireEvent.compositionEnd(input);
    fireEvent.click(clearButton);

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(input.value).toBe("");
  });

  it("disabled/readOnly 상태에서는 clear나 password 토글을 차단한다", () => {
    const { getByLabelText, queryByRole, rerender } = render(
      <TextField label="이메일" defaultValue="ara" clearable readOnly />
    );

    const input = getByLabelText("이메일") as HTMLInputElement;

    expect(queryByRole("button", { name: "입력 지우기" })).toBeNull();
    expect(input).toHaveAttribute("aria-readonly", "true");

    rerender(
      <TextField label="비밀번호" type="password" passwordToggle defaultValue="secret" disabled />
    );

    const passwordInput = getByLabelText("비밀번호") as HTMLInputElement;
    const toggle = queryByRole("button", { name: "비밀번호 보이기" });

    expect(toggle).toBeDisabled();

    fireEvent.click(toggle!);
    expect(passwordInput.type).toBe("password");
    expect(passwordInput).toHaveAttribute("aria-disabled", "true");
  });

  it("maxLengthCounter로 길이 카운터를 표기한다", () => {
    const { getByLabelText, getByText, getByRole } = render(
      <TextField
        label="소개"
        clearable
        defaultValue="ara"
        maxLength={10}
        maxLengthCounter
      />
    );

    const input = getByLabelText("소개") as HTMLInputElement;

    expect(getByText("3/10")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "hello" } });
    expect(getByText("5/10")).toBeInTheDocument();

    fireEvent.click(getByRole("button", { name: "입력 지우기" }));
    expect(getByText("0/10")).toBeInTheDocument();
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

  it("사이즈/상태 토큰을 CSS 변수로 노출하고 상태에 맞춰 적용한다", () => {
    const { container, getByLabelText } = render(<TextField label="이메일" size="sm" />);

    const root = container.firstChild as HTMLElement;
    const control = container.querySelector(
      ".ara-text-field__control"
    ) as HTMLElement;
    const input = getByLabelText("이메일");

    expect(root.style.getPropertyValue("--ara-tf-size-sm-height")).toBe("2.25rem");
    expect(root.style.getPropertyValue("--ara-tf-size-md-gap")).toBe("0.5rem");
    expect(root.style.getPropertyValue("--ara-tf-border-default")).toBe("#cdd4e0");

    expect(control.style.borderColor).toBe("var(--ara-tf-border-default, #cdd4e0)");

    fireEvent.pointerEnter(control);
    expect(control.style.borderColor).toBe("var(--ara-tf-border-hover, #cdd4e0)");

    fireEvent.pointerLeave(control);
    fireEvent.focus(input);
    expect(control.style.outline).toBe(
      "var(--ara-tf-outline, 2px solid var(--ara-color-role-light-interactive-primary-focus-border, #5b8def))"
    );
  });
});
