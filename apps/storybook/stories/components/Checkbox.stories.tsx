import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { CheckboxState } from "@ara/core";
import { AraProvider, AraThemeBoundary, Checkbox, Flex, Stack } from "@ara/react";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  decorators: [
    (Story) => (
      <AraProvider>
        <AraThemeBoundary>
          <Story />
        </AraThemeBoundary>
      </AraProvider>
    )
  ],
  parameters: {
    layout: "padded"
  },
  args: {
    label: "이용 약관 동의",
    description: "기본 체크박스입니다.",
    required: false,
    disabled: false
  },
  argTypes: {
    onCheckedChange: { control: false },
    describedBy: { control: false },
    labelledBy: { control: false },
    inputRef: { control: false },
    controlClassName: { control: false }
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const spacingProps = { gap: "md", style: { maxWidth: "760px" } } as const;

export const Playground: Story = {};

export const States: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <Checkbox label="기본" description="라벨과 설명을 모두 포함합니다." />
      <Checkbox label="선택됨" defaultChecked />
      <Checkbox label="필수 + 오류" required invalid description="aria-invalid로 표시됩니다." />
      <Checkbox label="읽기 전용" defaultChecked readOnly description="값을 바꿀 수 없습니다." />
      <Checkbox label="비활성화" disabled description="포커스와 입력이 차단됩니다." />
    </Stack>
  )
};

const IndeterminateExample = () => {
  const [state, setState] = useState<CheckboxState>("indeterminate");

  const label = useMemo(() => {
    if (state === "indeterminate") return "일부 선택됨";
    return state === "checked" ? "전체 선택됨" : "선택 없음";
  }, [state]);

  return (
    <Stack {...spacingProps}>
      <Checkbox
        label={label}
        description="상태를 순환하며 indeterminate를 표시합니다."
        checked={state}
        onCheckedChange={setState}
      />
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
        현재 상태: {state}
      </div>
    </Stack>
  );
};

export const Indeterminate: Story = {
  name: "Indeterminate 상태",
  parameters: {
    controls: { disable: true }
  },
  render: () => <IndeterminateExample />
};

const CheckboxGroupExample = () => {
  const [selected, setSelected] = useState<string[]>(["email"]);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  return (
    <Stack {...spacingProps}>
      <div style={{ fontWeight: 600 }}>알림 채널 선택</div>
      <Flex orientation="vertical" gap="sm">
        <Checkbox
          name="channel"
          value="email"
          label="이메일"
          description="프로모션/보안 알림을 메일로 받습니다."
          checked={selected.includes("email")}
          onCheckedChange={() => toggle("email")}
        />
        <Checkbox
          name="channel"
          value="sms"
          label="SMS"
          description="휴대폰 문자로 긴급 알림을 전달합니다."
          checked={selected.includes("sms")}
          onCheckedChange={() => toggle("sms")}
        />
        <Checkbox
          name="channel"
          value="push"
          label="푸시"
          description="앱 알림 배너로 메시지를 표시합니다."
          checked={selected.includes("push")}
          onCheckedChange={() => toggle("push")}
        />
      </Flex>
    </Stack>
  );
};

export const Group: Story = {
  name: "그룹 선택",
  parameters: {
    controls: { disable: true }
  },
  render: () => <CheckboxGroupExample />
};
