import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultTheme } from "@ara/core";
import {
  AraProvider,
  AraThemeBoundary,
  useAraThemeVariables
} from "./AraProvider.js";

describe("AraProvider", () => {
  it("추가 래퍼 없이 자식을 렌더링한다", () => {
    const { container } = render(
      <AraProvider>
        <span>child</span>
      </AraProvider>
    );

    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(container.firstElementChild).toHaveTextContent("child");
  });
});

describe("AraThemeBoundary", () => {
  it("기본적으로 div 컨테이너에 변수를 주입한다", () => {
    const { container } = render(
      <AraProvider>
        <AraThemeBoundary>
          <section data-testid="host">content</section>
        </AraThemeBoundary>
      </AraProvider>
    );

    const host = screen.getByTestId("host");

    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild).toHaveAttribute("data-ara-theme");
    expect(host).toHaveTextContent("content");
  });

  it("asChild로 기존 요소를 재사용한다", () => {
    const { container } = render(
      <AraProvider>
        <AraThemeBoundary asChild>
          <section data-testid="host">content</section>
        </AraThemeBoundary>
      </AraProvider>
    );

    const host = screen.getByTestId("host");

    expect(container.firstElementChild).toBe(host);
    expect(host).toHaveAttribute("data-ara-theme");
    expect(host.style.getPropertyValue("--ara-btn-radius")).toBe(
      defaultTheme.component.button.radius
    );
    expect(host.style.getPropertyValue("--ara-color-brand-500")).toBe(
      defaultTheme.color.palette.brand["500"]
    );
    expect(host.style.getPropertyValue("--ara-space-md")).toBe(
      defaultTheme.layout.space.md
    );
    expect(
      host.style.getPropertyValue(
        "--ara-color-role-light-interactive-primary-default-bg"
      )
    ).toBe(defaultTheme.color.role.light.interactive.primary.default.background);
  });

  it("hook으로 CSS 변수를 노출한다", () => {
    function Reader() {
      const variables = useAraThemeVariables();
      return (
        <output
          data-testid="vars"
          data-radius={variables["--ara-btn-radius"]}
          data-space-lg={variables["--ara-space-lg"]}
          data-role-surface={
            variables["--ara-color-role-light-surface-canvas"]
          }
        />
      );
    }

    render(
      <AraProvider>
        <Reader />
      </AraProvider>
    );

    const vars = screen.getByTestId("vars");

    expect(vars.dataset.radius).toBe(defaultTheme.component.button.radius);
    expect(vars.dataset.spaceLg).toBe(defaultTheme.layout.space.lg);
    expect(vars.dataset.roleSurface).toBe(
      defaultTheme.color.role.light.surface.canvas
    );
  });
});
