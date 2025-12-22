import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger
} from "./index.js";

describe("Menu", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("트리거를 클릭/키보드로 열고 ESC로 닫으며 포커스를 되돌린다", async () => {
    render(
      <Menu>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="루트 메뉴">
          <MenuItem>항목 1</MenuItem>
          <MenuItem>항목 2</MenuItem>
        </MenuContent>
      </Menu>
    );

    const trigger = screen.getByRole("button", { name: "열기" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await act(async () => {
      await user.click(trigger);
    });

    await screen.findByRole("menu", { name: "루트 메뉴" });
    const firstItem = screen.getByText("항목 1").closest("[role=\"menuitem\"]");
    expect(firstItem).not.toBeNull();
    expect(firstItem).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  it("closeOnSelect=false일 때 선택해도 열림 상태를 유지한다", async () => {
    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="루트 메뉴">
          <MenuItem>항목 1</MenuItem>
          <MenuItem>항목 2</MenuItem>
        </MenuContent>
      </Menu>
    );

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "열기" }));
    });

    const secondItem = screen.getByText("항목 2");
    await act(async () => {
      await user.click(secondItem);
    });

    expect(screen.getByRole("menu", { name: "루트 메뉴" })).toBeInTheDocument();
  });

  it("Arrow/Home/End/typeahead로 항목을 탐색한다", async () => {
    render(
      <Menu>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="루트 메뉴">
          <MenuItem>Alpha</MenuItem>
          <MenuItem>Beta</MenuItem>
          <MenuItem>Charlie</MenuItem>
        </MenuContent>
      </Menu>
    );

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "열기" }));
    });

    const items = screen.getAllByRole("menuitem");
    expect(items[0]).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{ArrowDown}");
    });
    expect(items[1]).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{End}");
    });
    expect(items[2]).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{Home}");
    });
    expect(items[0]).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("c");
    });
    expect(items[2]).toHaveAttribute("data-highlighted", "true");
  });

  it("체크박스/라디오 항목 상태와 aria 속성을 노출한다", async () => {
    function MenuWithState(): JSX.Element {
      const [checked, setChecked] = useState(false);
      const [direction, setDirection] = useState("left");

      return (
        <Menu>
          <MenuTrigger>열기</MenuTrigger>
          <MenuContent aria-label="루트 메뉴">
            <MenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
              체크
            </MenuCheckboxItem>
            <MenuRadioGroup value={direction} onValueChange={setDirection}>
              <MenuRadioItem value="left">왼쪽</MenuRadioItem>
              <MenuRadioItem value="right">오른쪽</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      );
    }

    render(<MenuWithState />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "열기" }));
    });

    const checkbox = screen.getByText("체크").closest("[role=\"menuitemcheckbox\"]");
    const radio = screen.getByText("왼쪽").closest("[role=\"menuitemradio\"]");
    expect(checkbox).not.toBeNull();
    expect(radio).not.toBeNull();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(radio).toHaveAttribute("aria-checked", "true");

    await act(async () => {
      await user.click(checkbox!);
      await user.click(screen.getByText("오른쪽"));
    });

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("오른쪽").closest("[role=\"menuitemradio\"]")).toHaveAttribute("aria-checked", "true");
  });

  it("서브메뉴를 ArrowRight/ArrowLeft로 열고 닫는다", async () => {
    render(
      <Menu>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="루트 메뉴">
          <MenuItem>단일</MenuItem>
          <MenuSub>
            <MenuSubTrigger>더보기</MenuSubTrigger>
            <MenuSubContent aria-label="서브 메뉴">
              <MenuItem>서브 1</MenuItem>
              <MenuItem>서브 2</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    );

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "열기" }));
    });

    await act(async () => {
      await user.keyboard("{ArrowDown}");
    });

    const subTrigger = screen.getByText("더보기").closest("[role=\"menuitem\"]");
    expect(subTrigger).not.toBeNull();
    expect(subTrigger).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{ArrowRight}");
    });

    const subMenu = await screen.findByRole("menu", { name: "서브 메뉴" });
    expect(subMenu).toBeInTheDocument();
    const firstSubItem = screen.getByText("서브 1").closest("[role=\"menuitem\"]");
    expect(firstSubItem).not.toBeNull();
    expect(firstSubItem).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await user.keyboard("{ArrowLeft}");
    });

    await waitFor(() => expect(screen.queryByRole("menu", { name: "서브 메뉴" })).not.toBeInTheDocument());
    expect(subTrigger).toHaveAttribute("data-highlighted", "true");
  });
});
