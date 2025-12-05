import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";

import { Portal } from "./index.js";

const DEFAULT_PORTAL_SELECTOR = "[data-ara-portal-container]";

describe("Portal", () => {
  afterEach(() => {
    cleanup();
    document.querySelectorAll(DEFAULT_PORTAL_SELECTOR).forEach((node) => node.remove());
  });

  it("기본 컨테이너를 생성해 포털로 렌더링한다", async () => {
    render(
      <Portal>
        <span data-testid="portal-child">포털</span>
      </Portal>
    );

    await waitFor(() => expect(document.querySelector(DEFAULT_PORTAL_SELECTOR)).not.toBeNull());
    const container = document.querySelector(DEFAULT_PORTAL_SELECTOR)!;

    expect(container).toHaveAttribute("data-ara-portal-container", "");
    expect(container.className.split(" ")).toContain("ara-portal");
    expect(container.querySelector("[data-testid='portal-child']")).toBeInTheDocument();
  });

  it("사용자 컨테이너와 className을 병합하고 언마운트 시 원복한다", async () => {
    const customContainer = document.createElement("div");
    customContainer.className = "existing";
    document.body.appendChild(customContainer);

    const { unmount } = render(
      <Portal container={customContainer} className="custom">
        <span>포털</span>
      </Portal>
    );

    await waitFor(() => expect(customContainer.querySelector("span")).not.toBeNull());

    expect(customContainer.className.split(" ")).toEqual(expect.arrayContaining(["existing", "custom", "ara-portal"]));

    unmount();

    expect(customContainer.className).toBe("existing");
  });

  it("disablePortal=true일 때 자식이 제자리에서 렌더링된다", () => {
    const customContainer = document.createElement("div");
    document.body.appendChild(customContainer);

    const { getByTestId } = render(
      <Portal container={customContainer} disablePortal>
        <span data-testid="inline-child">인라인</span>
      </Portal>
    );

    const child = getByTestId("inline-child");

    expect(customContainer.contains(child)).toBe(false);
    expect(child.parentElement).not.toBeNull();
  });

  it("StrictMode에서도 컨테이너를 중복 생성하지 않는다", async () => {
    render(
      <StrictMode>
        <Portal>
          <span>포털</span>
        </Portal>
      </StrictMode>
    );

    await waitFor(() => expect(document.querySelectorAll(DEFAULT_PORTAL_SELECTOR).length).toBe(1));
  });
});
