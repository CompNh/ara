import { describe, expect, it } from "vitest";
import { ThemeProvider as ComponentsThemeProvider } from "./index.js";
import { ThemeProvider as CoreThemeProvider } from "../../theme/ThemeProvider.js";

describe("components/theme-provider re-export", () => {
  it("ThemeProvider 참조를 theme 모듈에서 그대로 내보낸다", () => {
    expect(ComponentsThemeProvider).toBe(CoreThemeProvider);
  });
});
