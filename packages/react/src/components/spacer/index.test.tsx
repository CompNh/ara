import { defaultTheme } from "@ara/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spacer } from "./index.js";

describe("Spacer", () => {
  it("기본 block 방향으로 공간을 만든다", () => {
    const { getByTestId } = render(<Spacer size="md" data-testid="spacer" />);

    const element = getByTestId("spacer");
    const style = getComputedStyle(element);

    expect(style.display).toBe("block");
    expect(style.height).toBe(defaultTheme.layout.space.md);
    expect(style.flexShrink).toBe("1");
    expect(style.flexGrow).toBe("0");
    expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  it("inline 방향과 inline 렌더링을 지원한다", () => {
    const { getByTestId } = render(<Spacer size={10} direction="inline" inline data-testid="spacer" />);

    const element = getByTestId("spacer");
    const style = getComputedStyle(element);

    expect(style.display).toBe("inline-block");
    expect(style.width).toBe("10px");
    expect(style.flexShrink).toBe("1");
  });

  it("grow/shrink와 커스텀 태그를 제어한다", () => {
    const { getByTestId } = render(
      <Spacer as="span" size="sm" shrink={false} grow data-testid="spacer" style={{ background: "red" }} />
    );

    const element = getByTestId("spacer");
    const style = getComputedStyle(element);

    expect(element.tagName).toBe("SPAN");
    expect(style.flexShrink).toBe("0");
    expect(style.flexGrow).toBe("1");
    expect(style.height).toBe(defaultTheme.layout.space.sm);
    expect(style.backgroundColor).toBe("rgb(255, 0, 0)");
  });
});
