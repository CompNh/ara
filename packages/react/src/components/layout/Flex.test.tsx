import { defaultTheme } from "@ara/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flex } from "./Flex.js";

describe("Flex", () => {
  it("기본 row 플렉스로 gap과 정렬을 설정한다", () => {
    const { getByTestId } = render(
      <Flex data-testid="flex">
        <span>첫째</span>
        <span>둘째</span>
      </Flex>
    );

    const element = getByTestId("flex");
    const style = getComputedStyle(element);

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("row");
    expect(style.gap).toBe("0px");
    expect(style.alignItems).toBe("stretch");
    expect(style.justifyContent).toBe("flex-start");
    expect(style.flexWrap).toBe("nowrap");
  });

  it("간격과 정렬 토큰을 CSS 값으로 매핑한다", () => {
    const { getByTestId } = render(
      <Flex gap="lg" align="center" justify="between" data-testid="flex">
        <span>왼쪽</span>
        <span>오른쪽</span>
      </Flex>
    );

    const style = getComputedStyle(getByTestId("flex"));

    expect(style.gap).toBe(`var(--ara-space-lg, ${defaultTheme.layout.space.lg})`);
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
  });

  it("반응형 프롭을 media query 규칙으로 출력한다", () => {
    const { container } = render(
      <Flex
        direction={{ base: "row", md: "column-reverse" }}
        gap={{ base: "sm", lg: 10 }}
        align={{ md: "center" }}
        justify={{ lg: "evenly" }}
        wrap={{ md: "wrap" }}
      >
        <span>하나</span>
        <span>둘</span>
      </Flex>
    );

    const styleTag = container.querySelector("style");
    const cssText = styleTag?.textContent ?? "";

    expect(cssText).toContain("@media (min-width: 768px)");
    expect(cssText).toContain("flex-direction:column-reverse");
    expect(cssText).toContain("gap:10px");
    expect(cssText).toContain("justify-content:space-evenly");
    expect(cssText).toContain("flex-wrap:wrap");
  });

  it("as prop과 inline 옵션을 지원한다", () => {
    const { getByTestId } = render(
      <Flex as="section" inline data-testid="flex">
        <span>본문</span>
      </Flex>
    );

    const element = getByTestId("flex");

    expect(element.tagName).toBe("SECTION");
    expect(getComputedStyle(element).display).toBe("inline-flex");
  });

  it("RTL 방향에서도 논리적 정렬과 간격을 유지한다", () => {
    const { getByTestId } = render(
      <Flex direction="row" gap="md" justify="end" align="start" dir="rtl" data-testid="flex">
        <span>왼쪽</span>
        <span>오른쪽</span>
      </Flex>
    );

    const element = getByTestId("flex");
    const style = getComputedStyle(element);

    expect(element.getAttribute("dir")).toBe("rtl");
    expect(style.flexDirection).toBe("row");
    expect(style.gap).toBe(`var(--ara-space-md, ${defaultTheme.layout.space.md})`);
    expect(style.justifyContent).toBe("flex-end");
    expect(style.alignItems).toBe("start");
  });

  it("역방향 축에서도 플렉스 시작/끝 정렬을 유지한다", () => {
    const { getByTestId } = render(
      <Flex direction="row-reverse" justify="start" gap="sm" data-testid="flex">
        <span>첫째</span>
        <span>둘째</span>
      </Flex>
    );

    const style = getComputedStyle(getByTestId("flex"));

    expect(style.flexDirection).toBe("row-reverse");
    expect(style.justifyContent).toBe("flex-start");
    expect(style.gap).toBe(`var(--ara-space-sm, ${defaultTheme.layout.space.sm})`);
  });

  it("사용자 className과 인라인 스타일이 기본 규칙보다 우선한다", () => {
    const { getByTestId } = render(
      <Flex
        data-testid="flex"
        className="custom-flex"
        style={{ gap: "12px", flexDirection: "column" }}
      >
        <span>첫째</span>
        <span>둘째</span>
      </Flex>
    );

    const element = getByTestId("flex");
    const style = getComputedStyle(element);
    const classNames = element.className.split(" ");

    expect(classNames).toEqual(expect.arrayContaining(["ara-flex", "custom-flex"]));
    expect(classNames.some((name) => /^ara-flex-[\w-]+$/.test(name))).toBe(true);
    expect(style.gap).toBe("12px");
    expect(style.flexDirection).toBe("column");
  });
});
