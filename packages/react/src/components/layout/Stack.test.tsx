import { defaultTheme } from "@ara/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./Stack.js";

describe("Stack", () => {
  it("기본 column 스택으로 gap과 정렬을 설정한다", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack">
        <span>첫째</span>
        <span>둘째</span>
      </Stack>
    );

    const element = getByTestId("stack");
    const style = getComputedStyle(element);

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    expect(style.gap).toBe("0px");
    expect(style.alignItems).toBe("stretch");
    expect(style.justifyContent).toBe("start");
    expect(style.flexWrap).toBe("nowrap");
  });

  it("간격과 정렬 토큰을 CSS 값으로 매핑한다", () => {
    const { getByTestId } = render(
      <Stack gap="lg" align="center" justify="between" data-testid="stack">
        <span>왼쪽</span>
        <span>오른쪽</span>
      </Stack>
    );

    const style = getComputedStyle(getByTestId("stack"));

    expect(style.gap).toBe(defaultTheme.layout.space.lg);
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
  });

  it("divider를 자식 사이에 삽입한다", () => {
    const { getAllByTestId } = render(
      <Stack divider={<span data-testid="divider" />}>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </Stack>
    );

    const dividers = getAllByTestId("divider");

    expect(dividers).toHaveLength(2);
    dividers.forEach((element) => {
      expect(element).toHaveAttribute("aria-hidden", "true");
      expect(element).toHaveAttribute("role", "presentation");
      expect(element).toHaveAttribute("tabindex", "-1");
    });
  });

  it("RTL 방향에서도 논리적 정렬과 간격을 유지한다", () => {
    const { getByTestId } = render(
      <Stack direction="row" gap="md" justify="start" align="end" dir="rtl" data-testid="stack">
        <span>왼쪽</span>
        <span>오른쪽</span>
      </Stack>
    );

    const element = getByTestId("stack");
    const style = getComputedStyle(element);

    expect(element.getAttribute("dir")).toBe("rtl");
    expect(style.flexDirection).toBe("row");
    expect(style.gap).toBe(defaultTheme.layout.space.md);
    expect(style.justifyContent).toBe("start");
    expect(style.alignItems).toBe("end");
  });

  it("반응형 프롭을 media query 규칙으로 출력한다", () => {
    const { container } = render(
      <Stack
        direction={{ base: "column", md: "row-reverse" }}
        gap={{ base: "sm", lg: 10 }}
        align={{ md: "center" }}
        justify={{ lg: "evenly" }}
        wrap={{ md: "wrap" }}
      >
        <span>하나</span>
        <span>둘</span>
      </Stack>
    );

    const styleTag = container.querySelector("style");
    const cssText = styleTag?.textContent ?? "";

    expect(cssText).toContain("@media (min-width: 768px)");
    expect(cssText).toContain("flex-direction:row-reverse");
    expect(cssText).toContain("gap:10px");
    expect(cssText).toContain("justify-content:space-evenly");
    expect(cssText).toContain("flex-wrap:wrap");
  });

  it("as prop과 inline 옵션을 지원한다", () => {
    const { getByTestId } = render(
      <Stack as="section" inline data-testid="stack">
        <span>본문</span>
      </Stack>
    );

    const element = getByTestId("stack");

    expect(element.tagName).toBe("SECTION");
    expect(getComputedStyle(element).display).toBe("inline-flex");
  });
});
