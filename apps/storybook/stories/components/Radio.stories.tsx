import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AraProvider, AraThemeBoundary, Flex, Radio, RadioGroup, Stack } from "@ara/react";

const meta = {
  title: "Components/Radio",
  component: Radio,
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
    label: "옵션",
    description: "라디오 옵션입니다.",
    disabled: false,
    value: ""
  },
  argTypes: {
    value: { control: "text" },
    onChange: { control: false },
    describedBy: { control: false },
    labelledBy: { control: false },
    inputRef: { control: false },
    controlClassName: { control: false }
  },
  tags: ["autodocs"],
  render: (args) => (
    <RadioGroup name="sample" label="라디오 옵션" description="기본 Radio 컴포넌트입니다.">
      <Radio {...args} value="a" />
      <Radio {...args} value="b" label="옵션 B" />
      <Radio {...args} value="c" label="옵션 C" description="보조 설명 포함" />
    </RadioGroup>
  )
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

const spacingProps = { gap: "md", style: { maxWidth: "760px" } } as const;

export const Playground: Story = { args: { ...meta.args } };

export const Orientation: Story = {
  name: "가로/세로 그룹",
  parameters: {
    controls: { disable: true }
  },
  args: { ...meta.args },
  render: () => (
    <Stack {...spacingProps}>
      <RadioGroup
          name="direction-horizontal"
          label="가로 정렬"
          description={"orientation=\"horizontal\" 로 나란히 배치"}
          orientation="horizontal"
        >
          <Radio value="left" label="왼쪽" />
          <Radio value="center" label="가운데" />
          <Radio value="right" label="오른쪽" />
        </RadioGroup>
        <RadioGroup
          name="direction-vertical"
          label="세로 정렬"
          description={"orientation=\"vertical\" 기본 방향"}
        >
          <Radio value="top" label="위" />
          <Radio value="middle" label="중간" />
          <Radio value="bottom" label="아래" />
      </RadioGroup>
    </Stack>
  )
};

const RadioGroupStateExample = () => {
  const [value, setValue] = useState("apple");

  return (
    <Stack {...spacingProps}>
      <RadioGroup
        name="fruits"
        label="선호 과일"
        description="방향키로 이동하며 단일 선택만 허용합니다."
        value={value}
        onValueChange={setValue}
      >
        <Radio value="apple" label="사과" />
        <Radio value="banana" label="바나나" description="노란색 과일" />
        <Radio value="grape" label="포도" />
      </RadioGroup>
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>현재 선택: {value}</div>
    </Stack>
  );
};

export const ControlledGroup: Story = {
  name: "제어 모드 그룹",
  parameters: {
    controls: { disable: true }
  },
  args: { ...meta.args },
  render: () => <RadioGroupStateExample />
};

export const DisabledAndInvalid: Story = {
  name: "상태 사례",
  parameters: {
    controls: { disable: true }
  },
  args: { ...meta.args },
  render: () => (
    <Stack {...spacingProps}>
      <RadioGroup name="disabled" label="비활성 그룹" description="전체 disabled">
        <Radio value="off" label="선택 불가" disabled />
        <Radio value="off2" label="두 번째 옵션" disabled />
      </RadioGroup>
      <RadioGroup name="invalid" label="검증 오류" description="aria-invalid=true 를 표시합니다." invalid required>
        <Radio value="x" label="옵션 X" />
        <Radio value="y" label="옵션 Y" />
      </RadioGroup>
    </Stack>
  )
};

export const HorizontalWrap: Story = {
  name: "여러 줄 가로 나열",
  parameters: {
    controls: { disable: true }
  },
  args: { ...meta.args },
  render: () => (
    <RadioGroup
      name="layout"
      label="여러 항목"
      description="Flex 기반으로 줄바꿈됩니다."
      orientation="horizontal"
      style={{ maxWidth: "820px" }}
    >
      <Flex orientation="horizontal" gap="md" wrap="wrap">
        {["서울", "부산", "대구", "광주", "대전", "수원"].map((city) => (
          <Radio key={city} value={city} label={city} />
        ))}
      </Flex>
    </RadioGroup>
  )
};
