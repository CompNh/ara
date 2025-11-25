import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    const optionA = screen.getByRole("radio", { name: /옵션 A/ });
    const optionB = screen.getByRole("radio", { name: /옵션 B/ });

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

  it("그룹 레이블/설명 및 상태 aria 속성을 연결한다", () => {
    render(
      <RadioGroup label="색상" description="색상 설명" required invalid readOnly>
        <Radio value="red" label="빨강" />
        <Radio value="blue" label="파랑" />
      </RadioGroup>
    );

    const group = screen.getByRole("radiogroup");
    const label = screen.getByText("색상");
    const description = screen.getByText("색상 설명");
    const red = screen.getByRole("radio", { name: /빨강/ });
    const redLabel = screen.getByText("빨강");

    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(group.getAttribute("aria-describedby")).toBe(description.id);
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-readonly", "true");

    expect(red.getAttribute("aria-labelledby")).toBe(redLabel.id);
    expect(red.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("폼 제출 시 그룹 name으로 단일 값을 제출하고 reset으로 초기 상태를 복원한다", async () => {
    const submissions: Array<FormDataEntryValue | null> = [];

    const { container } = render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget as HTMLFormElement);
          submissions.push(formData.get("color"));
        }}
      >
        <RadioGroup name="color" defaultValue="blue">
          <Radio value="red" label="빨강" />
          <Radio value="blue" label="파랑" />
        </RadioGroup>
        <button type="submit">제출</button>
        <button type="reset">리셋</button>
      </form>
    );

    const form = container.querySelector("form") as HTMLFormElement;
    const radioInputs = Array.from(form.querySelectorAll("input[type='radio']"));
    const uniqueNames = new Set(radioInputs.map((input) => input.getAttribute("name")));

    expect(uniqueNames.size).toBe(1);
    expect(uniqueNames.values().next().value).toBe("color");

    fireEvent.submit(form);
    expect(submissions.at(-1)).toBe("blue");

    const redOption = screen.getByRole("radio", { name: "빨강" });
    fireEvent.click(redOption);
    fireEvent.submit(form);
    expect(submissions.at(-1)).toBe("red");

    form.reset();
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "파랑" })).toHaveAttribute("aria-checked", "true");
    });
  });

  it("세로 방향에서 화살표 이동으로 disabled 항목을 건너뛰고 순환한다", () => {
    render(
      <RadioGroup defaultValue="first" orientation="vertical">
        <Radio value="first" label="첫 번째" />
        <Radio value="second" label="두 번째" disabled />
        <Radio value="third" label="세 번째" />
      </RadioGroup>
    );

    const first = screen.getByRole("radio", { name: "첫 번째" });
    const third = screen.getByRole("radio", { name: "세 번째" });

    fireEvent.keyDown(first, { key: "ArrowDown" });

    expect(third).toHaveAttribute("aria-checked", "true");
    expect(first).toHaveAttribute("aria-checked", "false");

    fireEvent.keyDown(third, { key: "ArrowUp" });

    expect(first).toHaveAttribute("aria-checked", "true");
    expect(third).toHaveAttribute("aria-checked", "false");
  });
});
