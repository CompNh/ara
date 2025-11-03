import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { AraProvider } from "../../theme/index.js";
import { defaultTheme } from "@ara/core";

describe("Button", () => {
  it("기본 테마에서 버튼을 렌더링한다", () => {
    render(<Button>확인</Button>);

    const button = screen.getByRole("button", { name: "확인" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      backgroundColor: defaultTheme.color.brand["500"],
      color: defaultTheme.color.neutral["50"]
    });
    expect(button).toHaveAttribute("data-variant", "solid");
    expect(button).toHaveAttribute("data-tone", "primary");
    expect(button).toHaveAttribute("data-size", "md");
  });

  it("outline 변형 스타일을 적용한다", () => {
    render(
      <AraProvider>
        <Button variant="outline">보조</Button>
      </AraProvider>
    );

    const button = screen.getByRole("button", { name: "보조" });

    expect(button.style.backgroundColor).toBe("transparent");
    expect(button.style.color).toBe("rgb(47, 107, 255)");
    expect(button.style.borderColor).toBe("rgb(47, 107, 255)");
    expect(button).toHaveAttribute("data-variant", "outline");
  });

  it("variant 변경 시 스타일을 다시 계산한다", () => {
    const { rerender } = render(<Button>토글</Button>);

    const button = screen.getByRole("button", { name: "토글" });

    expect(getComputedStyle(button).backgroundColor).toBe("rgb(47, 107, 255)");

    rerender(<Button variant="outline">토글</Button>);

    expect(getComputedStyle(button).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(button).borderColor).toBe("rgb(47, 107, 255)");
  });

  it("tone에 따라 색상을 조정한다", () => {
    render(
      <Button tone="danger">위험</Button>
    );

    const button = screen.getByRole("button", { name: "위험" });

    expect(button).toHaveStyle({
      backgroundColor: defaultTheme.color.accent["500"],
      color: defaultTheme.color.neutral["50"]
    });
    expect(button).toHaveAttribute("data-tone", "danger");
  });

  it("size prop에 따라 여백과 높이를 조정한다", () => {
    render(
      <Button size="sm">작은 버튼</Button>
    );

    const button = screen.getByRole("button", { name: "작은 버튼" });

    expect(button).toHaveAttribute("data-size", "sm");
    expect(button.style.minHeight).toBe("var(--ara-btn-min-height, 2.25rem)");
  });

  it("size에 따라 폰트 크기와 패딩이 달라진다", () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </>
    );

    const [small, large] = screen.getAllByRole("button");

    expect(small.style.fontSize).toBe("var(--ara-btn-font-size, 0.875rem)");
    expect(large.style.fontSize).toBe("var(--ara-btn-font-size, 1.25rem)");
    expect(small.style.paddingLeft).toBe(
      "var(--ara-btn-pl, var(--ara-btn-px, 0.75rem))"
    );
    expect(large.style.paddingLeft).toBe(
      "var(--ara-btn-pl, var(--ara-btn-px, 1.25rem))"
    );
    expect(small.style.paddingTop).toBe(
      "var(--ara-btn-pt, var(--ara-btn-py, 0.375rem))"
    );
    expect(large.style.paddingTop).toBe(
      "var(--ara-btn-pt, var(--ara-btn-py, 0.75rem))"
    );
  });

  it("nullish variant/tone/size는 기본값으로 보정된다", () => {
    render(
      <Button variant={null} tone={null} size={null}>
        기본값
      </Button>
    );

    const button = screen.getByRole("button", { name: "기본값" });

    expect(button).toHaveAttribute("data-variant", "solid");
    expect(button).toHaveAttribute("data-tone", "primary");
    expect(button).toHaveAttribute("data-size", "md");
    expect(button).toHaveStyle({
      backgroundColor: defaultTheme.color.brand["500"],
      color: defaultTheme.color.neutral["50"]
    });
  });

  it("사용자 정의 className과 data 속성을 병합한다", () => {
    render(
      <Button className="custom" disabled>
        병합
      </Button>
    );

    const button = screen.getByRole("button", { name: "병합" });

    expect(button).toHaveClass("ara-button");
    expect(button).toHaveClass("custom");
    expect(button).toHaveAttribute("data-disabled");
  });

  it("leading/trailing 아이콘과 레이블을 올바르게 렌더링한다", () => {
    render(
      <Button
        leadingIcon={<span data-testid="leading" />}
        trailingIcon={<span data-testid="trailing" />}
      >
        아이콘
      </Button>
    );

    expect(screen.getByTestId("leading")).toBeInTheDocument();
    expect(screen.getByTestId("trailing")).toBeInTheDocument();
    expect(screen.getByText("아이콘")).toBeInTheDocument();
  });

  it("fullWidth prop이 적용되면 너비를 확장한다", () => {
    render(<Button fullWidth>가득</Button>);

    const button = screen.getByRole("button", { name: "가득" });

    expect(button.style.width).toBe("100%");
  });

  it("href가 존재하면 앵커 요소로 렌더링한다", () => {
    render(<Button href="/docs">문서</Button>);

    const link = screen.getByRole("link", { name: "문서" });

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-variant", "solid");
  });

  it("loading 상태에서 aria 속성을 적용한다", () => {
    render(<Button loading>로딩</Button>);

    const button = screen.getByRole("button", { name: "로딩" });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toBeDisabled();
    expect(button.querySelector(".ara-button__spinner")).not.toBeNull();
    expect(button.querySelector('svg[role="presentation"]')).not.toBeNull();
  });

  it("비활성 링크 모드에서 aria-disabled와 tabIndex를 설정한다", () => {
    render(
      <Button href="/docs" disabled>
        문서
      </Button>
    );

    const link = screen.getByRole("link", { name: "문서" });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveProperty("tabIndex", -1);
  });

  it("asChild로 자식 요소에 속성을 전달한다", () => {
    render(
      <Button asChild href="/nested" className="custom-slot">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a data-testid="child">중첩</a>
      </Button>
    );

    const child = screen.getByTestId("child");

    expect(child).toHaveAttribute("href", "/nested");
    expect(child).toHaveClass("ara-button");
    expect(child).toHaveClass("custom-slot");
    expect(child).toHaveAttribute("data-variant", "solid");
  });

  it("asChild 커스텀 요소에 role과 tabIndex를 설정한다", () => {
    render(
      <Button asChild>
        <span>커스텀</span>
      </Button>
    );

    const element = screen.getByRole("button", { name: "커스텀" });

    expect(element).toHaveAttribute("role", "button");
    expect(element).toHaveProperty("tabIndex", 0);
    expect(element).not.toHaveAttribute("aria-disabled");
  });

  it("비활성 커스텀 요소에서 aria-disabled와 tabIndex를 조정한다", () => {
    render(
      <Button asChild disabled>
        <span>커스텀</span>
      </Button>
    );

    const element = screen.getByRole("button", { name: "커스텀" });

    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveProperty("tabIndex", -1);
  });

  it("ref를 실제 요소로 포워딩한다", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const linkRef = createRef<HTMLAnchorElement>();

    render(
      <>
        <Button ref={buttonRef}>버튼</Button>
        <Button ref={linkRef} href="/ref">
          링크
        </Button>
      </>
    );

    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(linkRef.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("press 상호작용 동안 data-state를 토글한다", () => {
    render(<Button>동작</Button>);

    const button = screen.getByRole("button", { name: "동작" });

    expect(button).not.toHaveAttribute("data-state");

    fireEvent.pointerDown(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(button).toHaveAttribute("data-state", "pressed");

    fireEvent.pointerUp(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(button).not.toHaveAttribute("data-state");
  });

  it("키보드 포커스에서 focus-visible 상태를 노출한다", () => {
    render(<Button>포커스</Button>);

    const button = screen.getByRole("button", { name: "포커스" });

    fireEvent.focus(button);

    expect(button).toHaveAttribute("data-focus-visible");
    expect(button).toHaveAttribute("data-state", "focus-visible");

    fireEvent.blur(button);

    expect(button).not.toHaveAttribute("data-focus-visible");
    expect(button).not.toHaveAttribute("data-state");
  });

  it("마우스 press 시퀀스에서 press 핸들러를 호출한다", () => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();

    render(
      <Button onPress={onPress} onPressStart={onPressStart} onPressEnd={onPressEnd}>
        상호작용
      </Button>
    );

    const button = screen.getByRole("button", { name: "상호작용" });

    fireEvent.pointerDown(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressStart).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pressstart", pointerType: "mouse" })
    );
    expect(button).toHaveAttribute("data-state", "pressed");

    fireEvent.pointerUp(button, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pressend", pointerType: "mouse" })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(
      expect.objectContaining({ type: "press", pointerType: "mouse" })
    );
    expect(button).not.toHaveAttribute("data-state");
  });

  it("pointercancel 이벤트에서 press를 취소한다", () => {
    const onPress = vi.fn();
    const onPressEnd = vi.fn();

    render(
      <Button onPress={onPress} onPressEnd={onPressEnd}>
        취소
      </Button>
    );

    const button = screen.getByRole("button", { name: "취소" });

    fireEvent.pointerDown(button, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.pointerCancel(button, { pointerId: 1, pointerType: "mouse" });

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pressend", pointerType: "mouse" })
    );
    expect(onPress).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute("data-state");
  });

  it("pointerleave 이벤트에서 press를 취소한다", () => {
    const onPress = vi.fn();

    render(<Button onPress={onPress}>이탈</Button>);

    const button = screen.getByRole("button", { name: "이탈" });

    fireEvent.pointerDown(button, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.pointerLeave(button, { pointerId: 1, pointerType: "mouse" });

    expect(onPress).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute("data-state");
  });

  it("키보드 Enter 입력을 press 이벤트로 처리한다", () => {
    const onPress = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();

    render(
      <Button onPress={onPress} onPressStart={onPressStart} onPressEnd={onPressEnd}>
        키보드
      </Button>
    );

    const button = screen.getByRole("button", { name: "키보드" });

    fireEvent.keyDown(button, { key: "Enter" });

    expect(onPressStart).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pressstart", pointerType: "keyboard" })
    );
    expect(button).toHaveAttribute("data-state", "pressed");

    fireEvent.keyUp(button, { key: "Enter" });

    expect(onPressEnd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pressend", pointerType: "keyboard" })
    );
    expect(onPress).toHaveBeenCalledWith(
      expect.objectContaining({ type: "press", pointerType: "keyboard" })
    );
    expect(button).not.toHaveAttribute("data-state");
  });

  it("링크 모드에서도 Space 입력을 press 이벤트로 처리한다", () => {
    const onPress = vi.fn();

    render(
      <Button href="/keyboard" onPress={onPress}>
        링크
      </Button>
    );

    const link = screen.getByRole("link", { name: "링크" });

    fireEvent.keyDown(link, { key: " " });
    fireEvent.keyUp(link, { key: " " });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(
      expect.objectContaining({ type: "press", pointerType: "keyboard" })
    );
    expect(link).not.toHaveAttribute("data-state");
  });

  it("disabled와 loading 상태에서 press 핸들러를 호출하지 않는다", () => {
    const onPress = vi.fn();

    const { rerender } = render(
      <Button disabled onPress={onPress}>
        비활성
      </Button>
    );

    const disabledButton = screen.getByRole("button", { name: "비활성" });

    fireEvent.pointerDown(disabledButton, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(disabledButton, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPress).not.toHaveBeenCalled();

    rerender(
      <Button loading onPress={onPress}>
        로딩
      </Button>
    );

    const loadingButton = screen.getByRole("button", { name: "로딩" });

    fireEvent.pointerDown(loadingButton, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(loadingButton, { pointerId: 1, pointerType: "mouse", button: 0 });

    expect(onPress).not.toHaveBeenCalled();
  });
});
