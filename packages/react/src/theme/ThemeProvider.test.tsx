import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultTheme, type ThemeOverrides } from "@ara/core";
import { ThemeProvider } from "./ThemeProvider.js";
import { useAraTheme, useAraThemeVariables } from "./AraProvider.js";
import { useColorMode } from "./color-mode.js";

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

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function getBoundary(container: HTMLElement): HTMLElement | null {
  const script = container.querySelector("script");

  if (script?.nextElementSibling instanceof HTMLElement) {
    return script.nextElementSibling;
  }

  return container.querySelector("[data-ara-theme]");
}

function createMatchMediaMock(initial = false) {
  let matches = initial;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const notify = () => {
    const event = { matches, media: COLOR_SCHEME_QUERY } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };

  const mediaQueryList: MediaQueryList = {
    matches,
    media: COLOR_SCHEME_QUERY,
    onchange: null,
    addEventListener: vi.fn((_, listener) => {
      if (typeof listener === "function") {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    }),
    removeEventListener: vi.fn((_, listener) => {
      if (typeof listener === "function") {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    }),
    addListener: vi.fn((listener) => {
      if (typeof listener === "function") {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    }),
    removeListener: vi.fn((listener) => {
      if (typeof listener === "function") {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    }),
    dispatchEvent: vi.fn((event) => {
      listeners.forEach((listener) => listener(event as MediaQueryListEvent));
      return true;
    })
  } as MediaQueryList;

  const setMatches = (value: boolean) => {
    matches = value;

    if (typeof mediaQueryList.onchange === "function") {
      mediaQueryList.onchange({ matches: value, media: COLOR_SCHEME_QUERY } as MediaQueryListEvent);
    }

    notify();
  };

  return { mediaQueryList, setMatches };
}

let matchMediaControl: ReturnType<typeof createMatchMediaMock>;

beforeEach(() => {
  localStorage.clear();
  matchMediaControl = createMatchMediaMock(false);
  const stub = vi.fn(() => matchMediaControl.mediaQueryList);
  vi.stubGlobal("matchMedia", stub);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: stub
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  // Vitest는 stubGlobal을 복원하지만 window.matchMedia 프로퍼티는 직접 제거한다.
  // @ts-expect-error - jsdom 환경에서 matchMedia는 선택적이다.
  delete window.matchMedia;
});

describe("ThemeProvider", () => {
  it("기본적으로 div 경계에 data-ara-theme를 부여한다", () => {
    const { container } = render(
      <ThemeProvider>
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = getBoundary(container);
    const host = screen.getByTestId("host");

    expect(boundary?.tagName).toBe("DIV");
    expect(boundary).toHaveAttribute("data-ara-theme", "light");
    expect(boundary?.style.getPropertyValue("--ara-space-md")).toBe(
      defaultTheme.layout.space.md
    );
    expect(boundary?.style.colorScheme).toBe("light");
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
    expect(host.style.colorScheme).toBe("light");
  });

  it("mode prop으로 지정한 테마 변수를 적용한다", () => {
    const { container } = render(
      <ThemeProvider mode="dark">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = getBoundary(container);

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");
    expect(boundary?.style.getPropertyValue("--ara-color-role-dark-surface-canvas")).toBe(
      defaultTheme.color.role.dark.surface.canvas
    );
    expect(boundary?.style.colorScheme).toBe("dark");
  });

  it("direction prop으로 경계 요소의 dir 속성을 지정한다", () => {
    const { container } = render(
      <ThemeProvider direction="rtl">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = getBoundary(container);

    expect(boundary).toHaveAttribute("dir", "rtl");
  });

  it("시스템 선호도에 따라 모드를 결정한다", () => {
    matchMediaControl = createMatchMediaMock(true);
    const stub = vi.fn(() => matchMediaControl.mediaQueryList);
    vi.stubGlobal("matchMedia", stub);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: stub
    });

    const { container } = render(
      <ThemeProvider mode="system">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = getBoundary(container);

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");
    expect(boundary?.style.colorScheme).toBe("dark");
  });

  it("direction prop은 asChild 요소로 전달된다", () => {
    render(
      <ThemeProvider asChild direction="rtl">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const host = screen.getByTestId("host");

    expect(host).toHaveAttribute("dir", "rtl");
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

  it("localStorage에 저장된 사용자 선호도를 우선한다", () => {
    localStorage.setItem("ara:color-mode", "dark");

    const { container } = render(
      <ThemeProvider mode="system">
        <section data-testid="host">content</section>
      </ThemeProvider>
    );

    const boundary = getBoundary(container);

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");
    expect(boundary?.style.colorScheme).toBe("dark");
  });

  it("useColorMode 훅으로 모드를 변경할 수 있다", () => {
    function ModeSwitcher() {
      const { mode, setMode } = useColorMode();

      return (
        <button type="button" onClick={() => setMode(mode === "light" ? "dark" : "light")}>toggle</button>
      );
    }

    const { container } = render(
      <ThemeProvider mode="system">
        <ModeSwitcher />
      </ThemeProvider>
    );

    const boundary = getBoundary(container);
    const button = screen.getByRole("button", { name: "toggle" });

    expect(boundary).toHaveAttribute("data-ara-theme", "light");

    act(() => {
      button.click();
    });

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");
    expect(localStorage.getItem("ara:color-mode")).toBe("dark");

    act(() => {
      button.click();
    });

    expect(boundary).toHaveAttribute("data-ara-theme", "light");
    expect(localStorage.getItem("ara:color-mode")).toBe("light");
  });

  it("system 모드로 재설정하면 matchMedia 값이 반영된다", () => {
    matchMediaControl.setMatches(true);

    function ModeSwitcher() {
      const { setMode } = useColorMode();

      return (
        <>
          <button type="button" onClick={() => setMode("dark")}>
            dark
          </button>
          <button type="button" onClick={() => setMode("system")}>
            system
          </button>
        </>
      );
    }

    const { container } = render(
      <ThemeProvider mode="system">
        <ModeSwitcher />
      </ThemeProvider>
    );

    const boundary = getBoundary(container);
    const darkButton = screen.getByRole("button", { name: "dark" });
    const systemButton = screen.getByRole("button", { name: "system" });

    act(() => {
      darkButton.click();
    });

    expect(boundary).toHaveAttribute("data-ara-theme", "dark");

    act(() => {
      matchMediaControl.setMatches(false);
      systemButton.click();
    });

    expect(boundary).toHaveAttribute("data-ara-theme", "light");
    expect(localStorage.getItem("ara:color-mode")).toBeNull();
  });
});
