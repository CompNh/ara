import { render, screen } from "@testing-library/react";
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
  });

  it("테마 덮어쓰기를 반영한다", () => {
    render(
      <AraProvider theme={{ color: { brand: { "500": "#FF6B00" } } }}>
        <Button>경고</Button>
      </AraProvider>
    );

    const button = screen.getByRole("button", { name: "경고" });

    expect(button).toHaveStyle({
      backgroundColor: "#FF6B00"
    });
  });
});
