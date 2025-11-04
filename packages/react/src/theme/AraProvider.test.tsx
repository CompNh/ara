import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultTheme } from "@ara/core";
import { AraProvider } from "./AraProvider.js";

describe("AraProvider", () => {
  it("기본적으로 div 컨테이너를 렌더링한다", () => {
    const { container } = render(
      <AraProvider>
        <span>child</span>
      </AraProvider>
    );

    const wrapper = container.firstElementChild;

    expect(wrapper?.tagName).toBe("DIV");
    expect(wrapper).toHaveAttribute("data-ara-theme");
    expect(wrapper?.querySelector("span")).toHaveTextContent("child");
  });

  it("asChild prop으로 기존 요소를 재사용한다", () => {
    const { container } = render(
      <AraProvider asChild>
        <section data-testid="host">content</section>
      </AraProvider>
    );

    const host = screen.getByTestId("host");

    expect(container.firstElementChild).toBe(host);
    expect(host).toHaveAttribute("data-ara-theme");
    expect(host.style.getPropertyValue("--ara-btn-radius")).toBe(
      defaultTheme.component.button.radius
    );
  });
});
