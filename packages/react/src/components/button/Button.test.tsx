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
});
