import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultTheme, type ThemeOverrides } from "@ara/core";
import { ThemeProvider } from "./index.js";
import { useAraTheme, useAraThemeVariables } from "../../theme/AraProvider.js";

function createOverride(): ThemeOverrides {
  return {
    component: {
      button: {
        radius: "999px",
        variant: {
          solid: {
            primary: {
              background: "#123456",
              foreground: "#ffffff",
              border: "#123456",
              backgroundHover: "#234567",
              foregroundHover: "#ffffff",
              borderHover: "#234567",
              backgroundActive: "#345678",
              foregroundActive: "#ffffff",
              borderActive: "#345678",
              shadow: "none"
            }
          }
        }
      }
    }
  };
}

describe("ThemeProvider", () => {
  it("기본적으로 div 경계에 data-ara-theme를 부여한다", () => {
    const { container } = render(
      <ThemeProvider>
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = container.firstElementChild as HTMLElement | null;
    const host = screen.getByTestId("host");

    expect(boundary?.tagName).toBe("DIV");
    expect(boundary).toHaveAttribute("data-ara-theme", "light");
    expect(boundary?.style.getPropertyValue("--ara-space-md")).toBe(
      defaultTheme.layout.space.md
    );
    expect(host).toHaveTextContent("content");
  });

  it("asChild로 전달된 요소에 CSS 변수를 주입한다", () => {
    render(
      <ThemeProvider asChild>
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const host = screen.getByTestId("host");

    expect(host).toHaveAttribute("data-ara-theme", "light");
    expect(host.style.getPropertyValue("--ara-btn-radius")).toBe(
      defaultTheme.component.button.radius
    );
  });

  it("mode prop으로 지정한 테마 변수를 적용한다", () => {
    const { container } = render(
      <ThemeProvider mode="dark">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = container.firstElementChild as HTMLElement | null;

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");
    expect(boundary?.style.getPropertyValue("--ara-color-role-dark-surface-canvas")).toBe(
      defaultTheme.color.role.dark.surface.canvas
    );
  });

  it("theme 오버라이드를 컨텍스트와 CSS 변수에 반영한다", () => {
    function Reader() {
      const theme = useAraTheme();
      const variables = useAraThemeVariables();

      return (
        <output
          data-testid="reader"
          data-radius={theme.component.button.radius}
          data-bg={variables["--ara-btn-variant-solid-primary-bg"]}
        />
      );
    }

    const override = createOverride();

    render(
      <ThemeProvider theme={override} asChild>
        <section>
          <Reader />
        </section>
      </ThemeProvider>
    );

    const reader = screen.getByTestId("reader");

    expect(reader.dataset.radius).toBe("999px");
    expect(reader.dataset.bg).toBe("#123456");
  });
});
