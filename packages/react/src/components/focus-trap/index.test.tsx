import "@testing-library/jest-dom/vitest";
import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, afterEach } from "vitest";

import { FocusTrap } from "./index.js";

describe("FocusTrap", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  it("컨테이너 내부에서 탭 포커스를 순환시킨다", async () => {
    const { getByTestId } = render(
      <FocusTrap>
        <button data-testid="first">첫 번째</button>
        <button data-testid="last">마지막</button>
      </FocusTrap>
    );

    const first = getByTestId("first");
    const last = getByTestId("last");

    await act(async () => {});

    expect(first).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(last).toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(first).toHaveFocus();
  });

  it("initialFocus가 주어지면 해당 요소에 우선 포커스한다", async () => {
    let preferred: HTMLButtonElement | null = null;

    const { getByTestId } = render(
      <FocusTrap initialFocus={() => preferred}>
        <button data-testid="first">첫 번째</button>
        <button
          data-testid="preferred"
          ref={(node) => {
            preferred = node;
          }}
        >
          선호 포커스
        </button>
      </FocusTrap>
    );

    await act(async () => {});

    expect(getByTestId("preferred")).toHaveFocus();
  });

  it("언마운트 시 이전 포커스를 복원한다", async () => {
    const outsideButton = document.createElement("button");
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { unmount, getByTestId } = render(
      <FocusTrap>
        <button data-testid="inside">안쪽</button>
      </FocusTrap>
    );

    await act(async () => {});

    expect(getByTestId("inside")).toHaveFocus();

    unmount();

    expect(outsideButton).toHaveFocus();
    outsideButton.remove();
  });

  it("asChild로 전달한 요소에 ref와 클래스명을 적용한다", async () => {
    let container: HTMLElement | null = null;

    const { getByTestId } = render(
      <FocusTrap asChild className="custom" ref={(node) => (container = node)}>
        <section data-testid="container">
          <button>안쪽</button>
        </section>
      </FocusTrap>
    );

    await act(async () => {});

    const element = getByTestId("container");

    expect(element).toHaveAttribute("data-ara-focus-trap", "");
    expect(element).toHaveClass("ara-focus-trap", "custom");
    expect(container).toBe(element);
  });
});
