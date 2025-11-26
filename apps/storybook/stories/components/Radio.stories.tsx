import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AraProvider, AraThemeBoundary, Flex, Radio, RadioGroup, Stack } from "@ara/react";
import type { RadioGroupProps, RadioProps } from "@ara/react";

type RadioPlaygroundArgs = RadioGroupProps &
  Pick<RadioProps, "layout" | "disabled" | "controlClassName" | "inputRef"> & {
    optionCount: number;
    optionLabels: string[];
  };

const meta = {
  title: "Components/Radio",
  component: RadioGroup,
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
    children: null,
    label: "옵션 선택",
    description:
      "Your password must be 8-20 characters long, contain letters and numbers and must not contain spaces, special characters or emoji.",
    required: true,
    orientation: "vertical",
    optionCount: 3,
    optionLabels: ["옵션 A", "옵션 B", "옵션 C"],
    disabled: false,
    layout: "inline"
  },
  argTypes: {
    label: { name: "group label", control: "text" },
    description: { name: "group description", control: "text" },
    required: { name: "required", control: "boolean" },
    optionCount: { name: "optionCount", control: { type: "number", min: 1, max: 12, step: 1 } },
    optionLabels: { name: "optionLabels", control: "object" },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    value: { control: "text" },
    onValueChange: { control: false },
    describedBy: { control: false },
    labelledBy: { control: false },
    controlClassName: { name: "controlClassName", control: "text" },
    inputRef: { control: false },
    layout: { control: "inline-radio", options: ["inline", "stacked"] }
  },
  tags: ["autodocs"],
  render: ({
    optionCount = 3,
    optionLabels = [],
    layout,
    disabled,
    controlClassName,
    inputRef,
    ...groupProps
  }) => {
    const count = Math.max(1, Math.min(Number(optionCount) || 0, 12));
    const labels = Array.isArray(optionLabels) ? optionLabels : [];
    const options = Array.from({ length: count }, (_, index) => {
      const fallbackLabel = `옵션 ${String.fromCharCode(65 + index)}`;
      return {
        value: `option-${index + 1}`,
        label: labels[index] || fallbackLabel
      };
    });

    return (
      <RadioGroup name="sample" {...groupProps}>
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            label={option.label}
            layout={layout}
            disabled={disabled}
            controlClassName={controlClassName}
            inputRef={inputRef}
          />
        ))}
      </RadioGroup>
    );
  }
} satisfies Meta<RadioPlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const spacingProps = { gap: "md", style: { maxWidth: "760px" } } as const;

export const Playground: Story = { args: { ...meta.args } };

export const Layouts: Story = {
  name: "레이아웃 예시",
  parameters: {
    controls: { disable: true }
  },
  args: { ...meta.args },
  render: () => (
    <Stack {...spacingProps}>
      <RadioGroup name="layout-inline" label="인라인 텍스트" description="control 뒤에 텍스트">
        <Radio value="inline" label="Option" description="inline" layout="inline" />
      </RadioGroup>
      <RadioGroup name="layout-stacked" label="스택 정렬" description="텍스트 위 정렬">
        <Radio value="stacked" label="Option" description="stacked" layout="stacked" />
      </RadioGroup>
    </Stack>
  )
};

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
