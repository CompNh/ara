import { tokens } from "@ara/tokens";
import { describe, expect, it } from "vitest";

import { createTheme, defaultTheme } from "./theme.js";

describe("createTheme", () => {
  it("기본 토큰을 그대로 반환한다", () => {
    const theme = createTheme();

    expect(theme).toEqual(tokens);
    expect(theme).not.toBe(tokens);
  });

  it("중첩된 토큰만 선택적으로 오버라이드한다", () => {
    const theme = createTheme({
      color: {
        brand: {
          500: "#123456"
        }
      }
    });

    expect(theme.color.brand["500"]).toBe("#123456");
    expect(theme.typography.fontFamily.sans).toBe(tokens.typography.fontFamily.sans);
    expect(theme.color).not.toBe(tokens.color);
    expect(theme.color.brand).not.toBe(tokens.color.brand);
  });

  it("오버라이드 객체와 테마가 참조를 공유하지 않는다", () => {
    const overrides = {
      color: {
        brand: {
          600: "#abcdef"
        }
      }
    } as const;

    const theme = createTheme(overrides);

    expect(theme.color).not.toBe(overrides.color);
    expect(theme.color.brand).not.toBe(overrides.color.brand);
    expect(overrides.color.brand["600"]).toBe("#abcdef");
  });

  it("기본 토큰 객체를 변형하지 않는다", () => {
    const original = tokens.color.brand["500"];

    createTheme({
      color: {
        brand: {
          500: "#654321"
        }
      }
    });

    expect(tokens.color.brand["500"]).toBe(original);
  });
});

describe("defaultTheme", () => {
  it("createTheme으로 생성된 불변 객체를 제공한다", () => {
    expect(defaultTheme).toEqual(tokens);
    expect(Object.isFrozen(defaultTheme)).toBe(true);
    expect(Object.isFrozen(defaultTheme.color.brand)).toBe(true);
  });
});
