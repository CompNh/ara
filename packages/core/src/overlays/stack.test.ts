import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { overlayStack } from "./stack.js";

describe("overlayStack", () => {
  afterEach(() => {
    overlayStack.clear();
  });

  it("identifies the top-most entry based on DOM nesting", () => {
    const outer = document.createElement("div");
    const inner = document.createElement("div");

    outer.appendChild(inner);

    const outerId = Symbol("outer");
    const innerId = Symbol("inner");

    overlayStack.register(outerId, outer);
    overlayStack.register(innerId, inner);

    expect(overlayStack.isTop(outerId)).toBe(false);
    expect(overlayStack.isTop(innerId)).toBe(true);

    overlayStack.unregister(innerId);

    expect(overlayStack.isTop(outerId)).toBe(true);
  });

  it("notifies subscribers when the stack changes", () => {
    const subscriber = vi.fn();
    const unsubscribe = overlayStack.subscribe(subscriber);
    subscriber.mockClear();

    const target = document.createElement("div");
    const id = Symbol("target");

    overlayStack.register(id, target);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        topId: id,
        topNode: target
      })
    );

    overlayStack.updateNode(id, null);

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenLastCalledWith(
      expect.objectContaining({
        topId: undefined,
        topNode: null
      })
    );

    unsubscribe();
  });
});
