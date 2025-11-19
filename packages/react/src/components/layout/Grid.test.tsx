import { defaultTheme } from "@ara/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./Grid.js";

describe("Grid", () => {
  it("기본 1열 그리드로 gap과 정렬을 설정한다", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid">
        <span>첫째</span>
        <span>둘째</span>
      </Grid>
    );

    const element = getByTestId("grid");
    const style = getComputedStyle(element);

    expect(style.display).toBe("grid");
    expect(style.gridTemplateColumns).toBe("repeat(1, minmax(0, 1fr))");
    expect(style.gridTemplateRows).toBe("auto");
    expect(style.gap).toBe("0px");
    expect(style.alignItems).toBe("stretch");
    expect(style.justifyItems).toBe("stretch");
    expect(style.gridAutoFlow).toBe("row");
  });

  it("간격과 행/열/정렬 프롭을 해석한다", () => {
    const { getByTestId } = render(
      <Grid
        columns={3}
        rows="auto auto"
        gap="md"
        columnGap="lg"
        rowGap={8}
        align="center"
        justify="end"
        autoFlow="row dense"
        data-testid="grid"
      >
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </Grid>
    );

    const style = getComputedStyle(getByTestId("grid"));

    expect(style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(style.gridTemplateRows).toBe("auto auto");
    expect(style.gap).toBe(`var(--ara-space-md, ${defaultTheme.layout.space.md})`);
    expect(style.columnGap).toBe(`var(--ara-space-lg, ${defaultTheme.layout.space.lg})`);
    expect(style.rowGap).toBe("8px");
    expect(style.alignItems).toBe("center");
    expect(style.justifyItems).toBe("end");
    expect(style.gridAutoFlow).toBe("row dense");
  });

  it("반응형 프롭을 media query 규칙으로 출력한다", () => {
    const { container } = render(
      <Grid
        columns={{ base: 2, md: "1fr 2fr" }}
        rows={{ lg: 3 }}
        gap={{ base: "sm", md: "md", lg: 24 }}
        columnGap={{ md: "lg" }}
        rowGap={{ lg: "xl" }}
        align={{ md: "start" }}
        justify={{ lg: "center" }}
        autoFlow={{ md: "column" }}
      >
        <span>1</span>
        <span>2</span>
      </Grid>
    );

    const styleTag = container.querySelector("style");
    const cssText = styleTag?.textContent ?? "";

    expect(cssText).toContain("@media (min-width: 768px)");
    expect(cssText).toContain("grid-template-columns:1fr 2fr");
    expect(cssText).toContain(`gap:var(--ara-space-md, ${defaultTheme.layout.space.md})`);
    expect(cssText).toContain(`column-gap:var(--ara-space-lg, ${defaultTheme.layout.space.lg})`);
    expect(cssText).toContain("grid-auto-flow:column");
    expect(cssText).toContain("align-items:start");
    expect(cssText).toContain("@media (min-width: 1024px)");
    expect(cssText).toContain("grid-template-rows:repeat(3, minmax(0, auto))");
    expect(cssText).toContain("justify-items:center");
    expect(cssText).toContain(`row-gap:var(--ara-space-xl, ${defaultTheme.layout.space.xl})`);
  });

  it("areas와 inline 옵션을 지원한다", () => {
    const { getByTestId } = render(
      <Grid
        as="section"
        inline
        areas={["header header", "main sidebar"]}
        columns={2}
        data-testid="grid"
      >
        <span style={{ gridArea: "header" }}>머리글</span>
        <span style={{ gridArea: "main" }}>본문</span>
        <span style={{ gridArea: "sidebar" }}>사이드</span>
      </Grid>
    );

    const element = getByTestId("grid");
    const style = getComputedStyle(element);

    expect(element.tagName).toBe("SECTION");
    expect(style.display).toBe("inline-grid");
    expect(style.gridTemplateAreas).toBe('"header header" "main sidebar"');
  });

  it("RTL 방향에서도 간격과 정렬을 유지한다", () => {
    const { getByTestId } = render(
      <Grid columns={2} gap="sm" justify="end" align="start" dir="rtl" data-testid="grid">
        <span>1</span>
        <span>2</span>
      </Grid>
    );

    const element = getByTestId("grid");
    const style = getComputedStyle(element);

    expect(element.getAttribute("dir")).toBe("rtl");
    expect(style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
    expect(style.gap).toBe(`var(--ara-space-sm, ${defaultTheme.layout.space.sm})`);
    expect(style.justifyItems).toBe("end");
    expect(style.alignItems).toBe("start");
  });

  it("className 병합과 인라인 style 우선순위를 보장한다", () => {
    const { getByTestId } = render(
      <Grid
        data-testid="grid"
        className="custom-grid"
        style={{ gridTemplateColumns: "auto 1fr", gap: "5px" }}
      >
        <span>1</span>
        <span>2</span>
      </Grid>
    );

    const element = getByTestId("grid");
    const style = getComputedStyle(element);
    const classNames = element.className.split(" ");

    expect(classNames).toEqual(expect.arrayContaining(["ara-grid", "custom-grid"]));
    expect(classNames.some((name) => /^ara-grid-[\w-]+$/.test(name))).toBe(true);
    expect(style.gridTemplateColumns).toBe("auto 1fr");
    expect(style.gap).toBe("5px");
  });
});
