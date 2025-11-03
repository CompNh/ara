import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
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
    expect(button).toHaveAttribute("data-variant", "primary");
  });

  it("secondary 변형 스타일을 적용한다", () => {
    render(
      <AraProvider>
        <Button variant="secondary">보조</Button>
      </AraProvider>
    );

    const button = screen.getByRole("button", { name: "보조" });

    expect(button).toHaveStyle({
      backgroundColor: defaultTheme.color.neutral["100"],
      color: defaultTheme.color.brand["600"]
    });
    expect(button).toHaveAttribute("data-variant", "secondary");
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

  it("href가 존재하면 앵커 요소로 렌더링한다", () => {
    render(<Button href="/docs">문서</Button>);

    const link = screen.getByRole("link", { name: "문서" });

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-variant", "primary");
  });

  it("loading 상태에서 aria 속성을 적용한다", () => {
    render(<Button loading>로딩</Button>);

    const button = screen.getByRole("button", { name: "로딩" });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toBeDisabled();
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
    expect(child).toHaveAttribute("data-variant", "primary");
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
});
