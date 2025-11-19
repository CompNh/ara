import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Plus } from "@ara/icons";
import { AraProvider, AraThemeBoundary, Button, Flex, Grid, Spacer, Stack } from "@ara/react";

const boxStyle: CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid var(--ara-color-border-weak, #e5e7eb)",
  background: "var(--ara-color-surface-weak, #f9fafb)",
  color: "var(--ara-color-text-strong, #0f172a)",
  padding: "0.75rem 1rem",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)"
};

const meta = {
  title: "Components/Layout",
  component: Stack,
  subcomponents: { Flex, Grid, Spacer },
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
    direction: "column",
    gap: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
    inline: false
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["row", "row-reverse", "column", "column-reverse"]
    },
    gap: { control: "text" },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"]
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"]
    },
    wrap: {
      control: "select",
      options: [false, "wrap", "wrap-reverse"]
    },
    inline: { control: "boolean" },
    as: { control: false },
    divider: { control: false }
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderBoxes = (count = 4) =>
  Array.from({ length: count }, (_, index) => (
    <div key={index} style={boxStyle}>
      영역 {index + 1}
    </div>
  ));

export const Playground: Story = {
  render: (args) => <Stack {...args}>{renderBoxes()}</Stack>
};

export const ResponsiveStack: Story = {
  name: "Responsive Stack",
  parameters: {
    controls: { exclude: ["direction", "gap", "align", "justify", "wrap", "inline"] }
  },
  render: () => (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: "md", md: "xl" }}
      align={{ base: "stretch", md: "center" }}
      justify={{ base: "start", md: "between" }}
      wrap={{ base: true, md: false }}
    >
      {renderBoxes(3)}
    </Stack>
  )
};

export const FlexToolbar: Story = {
  name: "Toolbar (Flex)",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Flex
      align={{ base: "stretch", sm: "center" }}
      justify="between"
      gap="md"
      wrap
      style={{ border: "1px solid var(--ara-color-border-weak, #e5e7eb)", padding: "1rem", borderRadius: "0.75rem" }}
    >
      <Stack direction={{ base: "column", sm: "row" }} gap="sm" align={{ base: "start", sm: "center" }}>
        <div style={{ fontWeight: 600 }}>프로젝트</div>
        <Stack direction="row" gap="sm" align="center">
          <div style={boxStyle}>상태 필터</div>
          <div style={boxStyle}>정렬</div>
        </Stack>
      </Stack>
      <Flex gap="sm" align="center" wrap={{ base: true, sm: false }} justify="end">
        <Button variant="outline" tone="neutral">
          필터 저장
        </Button>
        <Button leadingIcon={<Plus aria-hidden />}>
          새 항목
        </Button>
      </Flex>
    </Flex>
  )
};

export const GridCards: Story = {
  name: "Card Grid",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="lg" align="stretch">
      {Array.from({ length: 6 }, (_, index) => (
        <Stack
          key={index}
          gap="sm"
          style={{
            ...boxStyle,
            height: "100%",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            background: "var(--ara-color-surface-strong, #fff)"
          }}
        >
          <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>카드 #{index + 1}</div>
          <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
            반응형 `columns`를 이용해 뷰포트 크기에 따라 열 수를 조절합니다. `gap`, `rowGap`, `columnGap`은
            레이아웃 토큰을 그대로 사용합니다.
          </div>
          <Flex gap="sm" align="center" wrap>
            <Button variant="ghost" size="sm" tone="neutral">
              자세히
            </Button>
            <Button size="sm" trailingIcon={<ArrowRight aria-hidden />}>
              이동
            </Button>
          </Flex>
        </Stack>
      ))}
    </Grid>
  )
};

export const SpacerPatterns: Story = {
  name: "Spacer Patterns",
  args: {
    direction: "row",
    gap: "sm",
    align: "center",
    justify: "start"
  },
  parameters: {
    controls: { exclude: ["wrap", "inline", "divider", "as"] }
  },
  render: (args) => (
    <Stack {...args} wrap>
      <Button variant="outline" tone="neutral">
        기본 액션
      </Button>
      <Spacer size="md" />
      <Button tone="neutral" variant="ghost">
        보조 액션
      </Button>
      <Spacer size={24} direction="inline" inline />
      <span style={{ color: "var(--ara-color-text-muted, #475569)" }}>텍스트 사이에도 인라인 Spacer를 넣을 수 있습니다.</span>
    </Stack>
  )
};
