import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DismissableLayer } from "./index.js";

describe("DismissableLayer", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  it("외부 포인터 다운 시 dismiss를 발생시킨다", async () => {
    const onDismiss = vi.fn();

    const { getByTestId } = render(
      <>
        <DismissableLayer onDismiss={onDismiss}>
          <button data-testid="inside">
            안쪽
          </button>
        </DismissableLayer>

        <button data-testid="outside">바깥</button>
      </>
    );

    await act(async () => {
      getByTestId("inside").focus();
    });

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("pointer");
  });

  it("Escape 키로 dismiss를 발생시킨다", async () => {
    const onDismiss = vi.fn();

    render(
      <DismissableLayer onDismiss={onDismiss}>
        <button>안쪽</button>
      </DismissableLayer>
    );

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("포커스가 바깥으로 이동하면 dismiss를 발생시킨다", async () => {
    const onDismiss = vi.fn();

    const { getByTestId } = render(
      <>
        <DismissableLayer onDismiss={onDismiss}>
          <button data-testid="inside">
            안쪽
          </button>
        </DismissableLayer>

        <button data-testid="outside">바깥</button>
      </>
    );

    await act(async () => {
      getByTestId("inside").focus();
    });

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("inside") });
      await user.tab();
    });

    expect(onDismiss).toHaveBeenCalledWith("focus");
  });

  it("disableOutsidePointerEvents가 true면 바깥 포인터 이벤트를 막고 dismiss를 중단한다", async () => {
    const onDismiss = vi.fn();
    const outsidePointerDown = vi.fn();

    const { getByTestId } = render(
      <>
        <DismissableLayer disableOutsidePointerEvents onDismiss={onDismiss}>
          <button data-testid="inside">
            안쪽
          </button>
        </DismissableLayer>

        <button data-testid="outside" onPointerDown={(event) => outsidePointerDown(event.defaultPrevented)}>
          바깥
        </button>
      </>
    );

    await act(async () => {
      getByTestId("inside").focus();
    });

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
    });

    expect(outsidePointerDown).toHaveBeenCalledWith(true);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("active=false이면 스택에 참여하지 않아 dismiss가 발생하지 않는다", async () => {
    const onDismiss = vi.fn();

    const { getByTestId } = render(
      <>
        <DismissableLayer active={false} onDismiss={onDismiss}>
          <button data-testid="inside">안쪽</button>
        </DismissableLayer>

        <button data-testid="outside">바깥</button>
      </>
    );

    await act(async () => {
      getByTestId("inside").focus();
    });

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: getByTestId("outside") });
      await user.keyboard("{Escape}");
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("스택 최상단 레이어만 dismiss 이벤트를 처리하고 해제 후 다음 레이어가 이어받는다", async () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();

    function Layers() {
      return (
        <>
          <DismissableLayer onDismiss={outerDismiss}>
            <button data-testid="outer-button">바깥</button>
            <DismissableLayer onDismiss={innerDismiss}>
              <button data-testid="inner-button">안쪽</button>
            </DismissableLayer>
          </DismissableLayer>

          <button data-testid="outside">외부</button>
        </>
      );
    }

    const { getByTestId } = render(<Layers />);

    // useDismissableLayer가 document 리스너를 등록할 시간을 확보한다.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      fireEvent.pointerDown(getByTestId("outside"));
    });

    await waitFor(() => {
      expect(innerDismiss.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
    const dismissCountAfterOutside = innerDismiss.mock.calls.length;
    expect(outerDismiss).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.pointerDown(getByTestId("outer-button"));
    });

    await waitFor(() => {
      expect(innerDismiss.mock.calls.length).toBe(dismissCountAfterOutside + 1);
    });
    const dismissCountAfterOuterClick = innerDismiss.mock.calls.length;
    expect(outerDismiss).not.toHaveBeenCalled();

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    await waitFor(() => {
      expect(innerDismiss).toHaveBeenCalledTimes(dismissCountAfterOuterClick + 1);
    });
    expect(outerDismiss).not.toHaveBeenCalled();
  });
});
