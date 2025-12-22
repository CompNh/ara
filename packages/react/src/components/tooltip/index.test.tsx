import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./index.js";

describe("Tooltip", () => {
  afterEach(() => {
    cleanup();
  });

  it("포인터 진입 지연 후 열리고 이탈 후 closeDelay 뒤 닫힌다", async () => {
    const handleOpenChange = vi.fn();

    render(
      <Tooltip openDelay={0} closeDelay={0} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button type="button">트리거</button>
        </TooltipTrigger>
        <TooltipContent>내용</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "트리거" });

    await act(async () => {
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });
    });

    await waitFor(() => expect(handleOpenChange).toHaveBeenCalledWith(true));
    await waitFor(() => expect(trigger).toHaveAttribute("data-state", "open"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
    });

    fireEvent.pointerMove(document.body, { clientX: 0, clientY: 0, pointerType: "mouse" });

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("포커스 시 즉시 열리고 blur 시 닫힌다", async () => {
    render(
      <Tooltip openDelay={0} closeDelay={0}>
        <TooltipTrigger asChild>
          <button type="button">트리거</button>
        </TooltipTrigger>
        <TooltipContent>내용</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "트리거" });

    await act(async () => {
      trigger.focus();
    });

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      trigger.blur();
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("ESC 및 외부 클릭으로 닫힌다", async () => {
    function Wrapper() {
      const [open, setOpen] = useState(true);

      return (
        <Tooltip open={open} onOpenChange={setOpen} openDelay={0} closeDelay={0}>
          <TooltipTrigger asChild>
            <button type="button">트리거</button>
          </TooltipTrigger>
          <TooltipContent>내용</TooltipContent>
        </Tooltip>
      );
    }

    render(<Wrapper />);

    const trigger = screen.getByRole("button", { name: "트리거" });

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

    await act(async () => {
      trigger.focus();
    });

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      fireEvent.pointerDown(document.body, { pointerType: "mouse" });
      fireEvent.pointerUp(document.body, { pointerType: "mouse" });
    });

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("트리거에 aria-describedby를 연결한다", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">트리거</button>
        </TooltipTrigger>
        <TooltipContent id="tooltip-test">내용</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "트리거" });
    expect(trigger).toHaveAttribute("aria-describedby", "tooltip-test");
  });

  it("withArrow 옵션일 때 화살표 데이터를 노출한다", async () => {
    render(
      <Tooltip withArrow>
        <TooltipTrigger>트리거</TooltipTrigger>
        <TooltipContent>내용</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByText("트리거");

    await act(async () => {
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    });

    const arrow = await screen.findByTestId("tooltip-arrow");
    expect(arrow).toHaveAttribute("data-side");
    expect(arrow).toHaveAttribute("data-align");
  });
});
