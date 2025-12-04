import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";

import { usePortal } from "./use-portal.js";

const PORTAL_SELECTOR = "[data-ara-portal-container]";

describe("usePortal", () => {
  afterEach(() => {
    cleanup();
    document.querySelectorAll(PORTAL_SELECTOR).forEach((node) => node.remove());
  });

  it("creates a default portal container when none is provided", async () => {
    const { result } = renderHook(() => usePortal());

    await waitFor(() => expect(result.current.container).not.toBeNull());

    const container = result.current.container;
    expect(container).not.toBeNull();
    expect(container).toHaveAttribute("data-ara-portal-container", "");
    expect(document.body.contains(container!)).toBe(true);
  });

  it("cleans up the default portal container on unmount", async () => {
    const { result, unmount } = renderHook(() => usePortal());

    await waitFor(() => expect(result.current.container).not.toBeNull());
    const container = result.current.container!;

    unmount();

    expect(document.body.contains(container)).toBe(false);
  });

  it("prefers a user-provided container and avoids creating a default one", async () => {
    const customContainer = document.createElement("div");
    document.body.appendChild(customContainer);

    const { result, unmount } = renderHook(() => usePortal({ container: customContainer }));

    await waitFor(() => expect(result.current.container).toBe(customContainer));
    expect(document.body.querySelector(PORTAL_SELECTOR)).toBeNull();

    unmount();

    expect(document.body.contains(customContainer)).toBe(true);
  });

  it("skips portal creation when disabled", async () => {
    const { result } = renderHook(() => usePortal({ disabled: true }));

    await waitFor(() => expect(result.current.container).toBeNull());
    expect(document.body.querySelector(PORTAL_SELECTOR)).toBeNull();
  });

  it("notifies once when the container becomes available", async () => {
    const onContainerChange = vi.fn();
    const { result } = renderHook(() => usePortal({ onContainerChange }));

    await waitFor(() => expect(result.current.container).not.toBeNull());
    const container = result.current.container!;

    expect(onContainerChange).toHaveBeenCalledTimes(1);
    expect(onContainerChange).toHaveBeenCalledWith(container);
  });
});
