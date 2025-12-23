import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  it("클릭으로 열리고 ESC 및 외부 클릭으로 닫힌다", async () => {
    render(
      <Menu>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="기본 메뉴">
          <MenuItem>첫번째</MenuItem>
        </MenuContent>
      </Menu>
    );

    const trigger = screen.getByRole("button", { name: "열기" });

    await user.click(trigger);

    expect(await screen.findByRole("menu", { name: "기본 메뉴" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu", { name: "기본 메뉴" })).not.toBeInTheDocument();
    });

    await user.click(trigger);

    expect(await screen.findByRole("menu", { name: "기본 메뉴" })).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("menu", { name: "기본 메뉴" })).not.toBeInTheDocument();
    });
  });

  it("closeOnSelect=false이면 항목 선택 후에도 닫히지 않는다", async () => {
    const handleSelect = vi.fn();

    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="닫힘 방지 메뉴">
          <MenuItem onSelect={handleSelect}>유지</MenuItem>
          <MenuCheckboxItem checked onCheckedChange={() => {}}>
            체크
          </MenuCheckboxItem>
          <MenuRadioGroup defaultValue="a">
            <MenuRadioItem value="a">라디오</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );

    await user.click(screen.getByRole("button", { name: "열기" }));
    await user.click(screen.getByRole("menuitem", { name: "유지" }));

    expect(handleSelect).toHaveBeenCalled();
    expect(screen.getByRole("menu", { name: "닫힘 방지 메뉴" })).toBeInTheDocument();
  });

  it("서브메뉴에서 선택하면 전체 메뉴가 닫힌다", async () => {
    const handleSubSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent aria-label="루트 메뉴">
          <MenuItem>첫번째</MenuItem>
          <MenuSub>
            <MenuSubTrigger>더보기</MenuSubTrigger>
            <MenuSubContent aria-label="서브 메뉴">
              <MenuItem onSelect={handleSubSelect}>서브 항목</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    );

    const trigger = screen.getByRole("button", { name: "열기" });
    await user.click(trigger);

    await user.keyboard("{ArrowDown}");
    const subTrigger = screen.getByRole("menuitem", { name: "더보기" });
    expect(subTrigger).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("menu", { name: "서브 메뉴" })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "서브 항목" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu", { name: "루트 메뉴" })).not.toBeInTheDocument();
    });
    expect(handleSubSelect).toHaveBeenCalled();
  });
});
