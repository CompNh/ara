import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AraProvider, AraThemeBoundary, Flex, Stack, Switch } from "@ara/react";

const meta = {
  title: "Components/Switch",
  component: Switch,
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
    label: "푸시 알림",
    description: "알림을 켜거나 끕니다.",
    disabled: false,
    required: false
  },
  argTypes: {
    onCheckedChange: { control: false },
    describedBy: { control: false },
    labelledBy: { control: false },
    inputRef: { control: false },
    trackClassName: { control: false },
    thumbClassName: { control: false }
  },
  tags: ["autodocs"],
  render: (args) => <Switch {...args} />
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const spacingProps = { gap: "md", style: { maxWidth: "760px" } } as const;

export const Playground: Story = {};

export const States: Story = {
  name: "상태",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <Switch label="기본" description="언제든 토글할 수 있습니다." />
      <Switch label="체크됨" defaultChecked description="초기 상태를 on으로 시작" />
      <Switch label="읽기 전용" defaultChecked readOnly description="포커스는 가능하지만 토글 불가" />
      <Switch label="필수 + 오류" required invalid description="aria-invalid 상태" />
      <Switch label="비활성화" disabled description="포커스와 입력이 차단됩니다." />
    </Stack>
  )
};

const SizeShowcase = () => {
  const sizePresets = [
    { label: "작은 크기", scale: 0.9 },
    { label: "기본 크기", scale: 1 },
    { label: "큰 크기", scale: 1.1 }
  ];

  return (
    <Stack {...spacingProps}>
      {sizePresets.map((preset) => (
        <div key={preset.label} style={{ transform: `scale(${preset.scale})`, transformOrigin: "left center" }}>
          <Switch label={preset.label} description={`scale=${preset.scale} 배율 예시`} defaultChecked />
        </div>
      ))}
    </Stack>
  );
};

export const Sizes: Story = {
  name: "크기 데모",
  parameters: {
    controls: { disable: true }
  },
  render: () => <SizeShowcase />
};

const SwitchControlExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Stack {...spacingProps}>
      <Switch
        label={checked ? "알림이 켜짐" : "알림이 꺼짐"}
        description="Space/Enter 또는 클릭으로 토글"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Flex orientation="horizontal" gap="sm" align="center">
        <Switch
          label="연동된 토글"
          description="상태 공유"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <span style={{ color: "var(--ara-color-text-muted, #475569)" }}>
          현재 상태: {checked ? "on" : "off"}
        </span>
      </Flex>
    </Stack>
  );
};

export const Controlled: Story = {
  name: "제어 모드",
  parameters: {
    controls: { disable: true }
  },
  render: () => <SwitchControlExample />
};
