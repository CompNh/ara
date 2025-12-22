import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger
} from "./index.js";

describe("Popover", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("트리거 클릭/키보드로 열고 닫는다", async () => {
    render(
      <Popover>
        <PopoverTrigger>열기</PopoverTrigger>
        <PopoverContent>내용</PopoverContent>
      </Popover>
    );

    const trigger = screen.getByRole("button", { name: "열기" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await act(async () => {
      await user.click(trigger);
    });

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await act(async () => {
      await user.click(trigger);
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await act(async () => {
      trigger.focus();
      await user.keyboard("{Enter}");
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("ESC 또는 외부 포인터로 닫힌다", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>열기</PopoverTrigger>
        <PopoverContent>내용</PopoverContent>
      </Popover>
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "열기" }));
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      fireEvent.pointerDown(document.body);
      fireEvent.pointerUp(document.body);
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closeOnInteractOutside=false이면 포인터 이벤트를 막고 닫지 않는다", async () => {
    const outsidePointerDown = vi.fn();

    render(
      <>
        <Popover defaultOpen closeOnInteractOutside={false}>
          <PopoverTrigger>열기</PopoverTrigger>
          <PopoverContent>내용</PopoverContent>
        </Popover>
        <button type="button" onPointerDown={(event) => outsidePointerDown(event.defaultPrevented)}>
          바깥
        </button>
      </>
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      fireEvent.pointerDown(screen.getByRole("button", { name: "바깥" }));
    });

    expect(outsidePointerDown).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("modal 모드에서 포커스를 가두고 닫힐 때 트리거로 포커스를 돌려준다", async () => {
    render(
      <>
        <Popover defaultOpen modal>
          <PopoverTrigger>열기</PopoverTrigger>
          <PopoverContent>
            <button type="button">확인</button>
            <button type="button">취소</button>
            <PopoverClose>닫기</PopoverClose>
          </PopoverContent>
        </Popover>
        <button type="button">외부</button>
      </>
    );

    const trigger = document.querySelector<HTMLButtonElement>(".ara-popover__trigger");
    expect(trigger).not.toBeNull();
    if (!trigger) {
      throw new Error("trigger not found");
    }

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(dialog.querySelector("button")));

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    const activeText = document.activeElement?.textContent;
    expect(activeText === "확인" || activeText === "취소" || activeText === "닫기").toBe(true);
    expect(screen.queryByRole("button", { name: "외부" })).toBeNull();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "닫기" }));
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  it("Header/Body로 aria-labelledby/aria-describedby를 연결한다", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>열기</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>제목</PopoverHeader>
          <PopoverBody>본문</PopoverBody>
          <PopoverFooter>푸터</PopoverFooter>
        </PopoverContent>
      </Popover>
    );

    const dialog = await screen.findByRole("dialog");
    const header = screen.getByText("제목");
    const body = screen.getByText("본문");

    expect(dialog).toHaveAttribute("aria-labelledby", header.id);
    expect(dialog).toHaveAttribute("aria-describedby", body.id);
  });

  it("withArrow 옵션일 때 화살표 데이터를 노출한다", async () => {
    render(
      <Popover defaultOpen withArrow>
        <PopoverTrigger>열기</PopoverTrigger>
        <PopoverContent>내용</PopoverContent>
      </Popover>
    );

    const arrow = await screen.findByTestId("popover-arrow");
    expect(arrow).toHaveAttribute("data-side");
    expect(arrow).toHaveAttribute("data-align");
  });
});
