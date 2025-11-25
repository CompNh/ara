import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Radio } from "./Radio.js";
import { RadioGroup } from "./RadioGroup.js";

describe("RadioGroup/Radio", () => {
  it("그룹 내 단일 선택을 유지하고 변경 시 onValueChange를 호출한다", () => {
    const handleChange = vi.fn();

    render(
      <RadioGroup defaultValue="b" onValueChange={handleChange} label="색상">
        <Radio value="a" label="옵션 A" />
        <Radio value="b" label="옵션 B" />
      </RadioGroup>
    );

    const optionA = screen.getByRole("radio", { name: "옵션 A" });
    const optionB = screen.getByRole("radio", { name: "옵션 B" });

    expect(optionB).toHaveAttribute("aria-checked", "true");
    expect(optionA).toHaveAttribute("aria-checked", "false");

    fireEvent.click(optionA);

    expect(optionA).toHaveAttribute("aria-checked", "true");
    expect(optionB).toHaveAttribute("aria-checked", "false");
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("화살표 키로 다음/이전 항목으로 이동하며 선택을 갱신한다", () => {
    render(
      <RadioGroup defaultValue="first" orientation="horizontal">
        <Radio value="first" label="첫 번째" />
        <Radio value="second" label="두 번째" />
        <Radio value="third" label="세 번째" />
      </RadioGroup>
    );

    const first = screen.getByRole("radio", { name: "첫 번째" });
    const second = screen.getByRole("radio", { name: "두 번째" });

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(second).toHaveAttribute("aria-checked", "true");
    expect(first).toHaveAttribute("aria-checked", "false");
  });

  it("비활성화된 그룹에서는 상호작용이 동작하지 않는다", () => {
    render(
      <RadioGroup defaultValue="x" disabled>
        <Radio value="x" label="잠금" />
        <Radio value="y" label="잠김" />
      </RadioGroup>
    );

    const locked = screen.getByRole("radio", { name: "잠김" });

    fireEvent.click(locked);

    expect(locked).toHaveAttribute("aria-checked", "false");
    expect(locked).toHaveAttribute("aria-disabled", "true");
  });
});
