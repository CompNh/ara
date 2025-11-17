import { defaultTheme } from "@ara/core";
import type { IconProps as IconSourceProps } from "@ara/icons/types";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Icon } from "./index.js";

const FilledIcon = ({ title, ...props }: IconSourceProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    {title ? <title>{title}</title> : null}
    <path d="M4 12h16" fill="currentColor" />
  </svg>
);

const StrokeIcon = ({ title, ...props }: IconSourceProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    {title ? <title>{title}</title> : null}
    <path d="M4 12h16" stroke="currentColor" strokeWidth="2" />
    <path d="M12 4v16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

describe("Icon", () => {
  it("토큰 기본값으로 크기와 클래스를 적용한다", () => {
    const { getByTestId } = render(<Icon icon={FilledIcon} data-testid="icon" />);
    const element = getByTestId("icon");

    expect(element).toHaveClass("ara-icon");
    expect(element).toHaveAttribute("width", defaultTheme.component.icon.size.md);
    expect(element).toHaveAttribute("height", defaultTheme.component.icon.size.md);
  });

  it("tone을 currentColor 스타일로 반영한다", () => {
    const { getByTestId } = render(<Icon icon={FilledIcon} tone="danger" data-testid="icon" />);

    expect(getByTestId("icon")).toHaveStyle({ color: defaultTheme.component.icon.tone.danger });
  });

  it("제목이나 라벨이 없으면 장식용으로 aria-hidden을 설정한다", () => {
    const { getByTestId } = render(<Icon icon={FilledIcon} data-testid="icon" />);

    expect(getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
    expect(getByTestId("icon")).not.toHaveAttribute("role");
  });

  it("title을 제공하면 role과 aria-labelledby를 연결한다", () => {
    const { getByTestId } = render(<Icon icon={FilledIcon} title="확인" data-testid="icon" />);

    const icon = getByTestId("icon");
    const title = icon.querySelector("title");

    expect(icon).toHaveAttribute("role", "img");
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon.getAttribute("aria-labelledby")).toBe(title?.id);
  });

  it("aria-label을 제공하면 스크린리더가 읽을 수 있도록 노출한다", () => {
    const { getByTestId } = render(<Icon icon={FilledIcon} aria-label="삭제" data-testid="icon" />);

    const icon = getByTestId("icon");

    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("aria-label", "삭제");
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("aria-labelledby를 제공하면 라벨 참조를 존중하고 role을 img로 노출한다", () => {
    const labelledbyId = "custom-title";
    const { getByTestId } = render(
      <Icon icon={FilledIcon} aria-labelledby={labelledbyId} data-testid="icon" />
    );

    const icon = getByTestId("icon");

    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("aria-labelledby", labelledbyId);
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("strokeWidth와 filled 옵션을 아이콘 노드에 덮어쓴다", () => {
    const { container } = render(
      <Icon icon={StrokeIcon} strokeWidth={1.25} filled aria-label="완료" />
    );

    const paths = container.querySelectorAll("path");
    const strokeValues = Array.from(paths).map((path) => path.getAttribute("stroke-width"));
    const fillValues = Array.from(paths).map((path) => path.getAttribute("fill"));

    expect(strokeValues.every((value) => value === "1.25" || value === null)).toBe(true);
    expect(fillValues.some((value) => value === "currentColor")).toBe(true);
  });

  it("ref를 최종 SVG 엘리먼트로 포워딩한다", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon icon={FilledIcon} ref={ref} aria-label="더하기" />);

    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it("사용자 className을 기본 클래스와 병합한다", () => {
    const { getByTestId } = render(
      <Icon icon={FilledIcon} className="custom-class" data-testid="icon" />
    );

    expect(getByTestId("icon")).toHaveClass("ara-icon");
    expect(getByTestId("icon")).toHaveClass("custom-class");
  });
});
