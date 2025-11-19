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
    orientation: "vertical",
    gap: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
    inline: false
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "horizontal-reverse", "vertical", "vertical-reverse"]
    },
    direction: { control: false },
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

const axisCardStyle: CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px dashed var(--ara-color-border-weak, #e5e7eb)",
  background: "var(--ara-color-surface-weak, #f8fafc)",
  padding: "0.75rem 1rem",
  width: "100%",
  minWidth: "220px"
};

export const Playground: Story = {
  render: (args) => <Stack {...args}>{renderBoxes()}</Stack>
};

export const DirectionShowcase: Story = {
  name: "Orientation (직관 이름)",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack gap="lg">
      <Stack gap="xs">
        <div style={{ fontWeight: 600 }}>orientation="horizontal"</div>
        <Stack orientation="horizontal" gap="sm" align="center">
          {renderBoxes()}
        </Stack>
      </Stack>
      <Stack gap="xs">
        <div style={{ fontWeight: 600 }}>orientation="vertical"</div>
        <Stack orientation="vertical" gap="sm">
          {renderBoxes()}
        </Stack>
      </Stack>
    </Stack>
  )
};

export const LogicalAxisLegend: Story = {
  name: "Inline / Block 축 설명",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack gap="md">
      <div style={{ fontWeight: 600 }}>
        Flexbox naming은 논리 축(inline/block) 기준입니다. 글쓰기 방향이 바뀌면 축의 화살표도 함께 바뀝니다. 직관적인 `orientation`
        prop으로도 같은 축을 설정할 수 있습니다.
      </div>
      <Stack direction="row" gap="md" wrap>
        <Stack gap="xs" style={axisCardStyle}>
          <div style={{ fontWeight: 600 }}>row = inline axis</div>
          <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
            LTR: 좌 → 우 · RTL: 우 → 좌. 인라인 축을 따라 콘텐츠가 이어집니다.
          </div>
        </Stack>
        <Stack gap="xs" style={axisCardStyle}>
          <div style={{ fontWeight: 600 }}>column = block axis</div>
          <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
            `horizontal-tb`에서는 위 → 아래. 세로쓰기(`vertical-rl` 등)에서는 글 흐름을 따라 오른쪽 → 왼쪽으로 내려갑니다.
          </div>
        </Stack>
      </Stack>
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
        컬럼이 가로를 의미하는 표/그리드 용어와 달리, Flexbox에서는 inline/block 논리 축을 기준으로 이름이 붙었습니다.
      </div>
    </Stack>
  )
};

export const ResponsiveStack: Story = {
  name: "Responsive Stack",
  parameters: {
    controls: { exclude: ["orientation", "gap", "align", "justify", "wrap", "inline"] }
  },
  render: () => (
    <Stack
      orientation={{ base: "vertical", md: "horizontal" }}
      gap={{ base: "md", md: "xl" }}
      align={{ base: "stretch", md: "center" }}
      justify={{ base: "start", md: "between" }}
      wrap={{ base: true, md: false }}
    >
      {renderBoxes(3)}
    </Stack>
  )
};

export const FlexPlayground: Story = {
  name: "Playground (Flex)",
  args: {
    orientation: "horizontal",
    gap: "md",
    align: "center",
    justify: "start",
    wrap: false,
    inline: false
  },
  parameters: {
    controls: {
      include: ["orientation", "gap", "align", "justify", "wrap", "inline"]
    }
  },
  argTypes: {
    orientation: meta.argTypes?.orientation,
    direction: meta.argTypes?.direction,
    gap: meta.argTypes?.gap,
    align: meta.argTypes?.align,
    justify: meta.argTypes?.justify,
    wrap: meta.argTypes?.wrap,
    inline: meta.argTypes?.inline,
    as: meta.argTypes?.as
  },
  render: (args) => <Flex {...args}>{renderBoxes()}</Flex>
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
      <Stack orientation={{ base: "vertical", sm: "horizontal" }} gap="sm" align={{ base: "start", sm: "center" }}>
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

export const GridPlayground: Story = {
  name: "Playground (Grid)",
  args: {
    columns: 3,
    rows: "auto",
    gap: "md",
    columnGap: undefined,
    rowGap: undefined,
    align: "stretch",
    justify: "stretch",
    autoFlow: "row",
    inline: false
  },
  parameters: {
    controls: {
      include: ["columns", "rows", "areas", "gap", "columnGap", "rowGap", "align", "justify", "autoFlow", "inline"]
    }
  },
  argTypes: {
    columns: { control: "object" },
    rows: { control: "object" },
    areas: { control: "object" },
    gap: meta.argTypes?.gap,
    columnGap: meta.argTypes?.gap,
    rowGap: meta.argTypes?.gap,
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"]
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "stretch"]
    },
    autoFlow: {
      control: "select",
      options: ["row", "column", "dense", "row dense", "column dense"]
    },
    inline: meta.argTypes?.inline,
    as: meta.argTypes?.as
  },
  render: (args) => (
    <Grid {...args} style={{ minWidth: "280px" }}>
      {renderBoxes(6)}
    </Grid>
  )
};

export const SpacerPatterns: Story = {
  name: "Spacer Patterns",
  args: {
    orientation: "horizontal",
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

export const SpacerPlayground: Story = {
  name: "Playground (Spacer)",
  args: {
    size: "md",
    direction: "block",
    inline: false,
    shrink: true,
    grow: false
  },
  parameters: {
    controls: {
      include: ["size", "direction", "inline", "shrink", "grow"]
    }
  },
  argTypes: {
    size: { control: "text" },
    direction: {
      control: "select",
      options: ["block", "inline"]
    },
    inline: { control: "boolean" },
    shrink: { control: "boolean" },
    grow: { control: "boolean" },
    as: { control: false }
  },
  render: (args) => (
    <Flex gap="md" align="center">
      <Button variant="outline" tone="neutral">
        이전
      </Button>
      <Spacer {...args} data-testid="spacer-preview" />
      <Button tone="neutral" variant="ghost" trailingIcon={<ArrowRight aria-hidden />}>
        다음
      </Button>
    </Flex>
  )
};
