import type { Meta, StoryObj } from "@storybook/react";
import { icons as iconSet, type IconName } from "@ara/icons";
import { AraProvider, AraThemeBoundary, Icon } from "@ara/react";

const iconOptions = Object.keys(iconSet) as IconName[];

const meta = {
  title: "Components/Icon",
  component: Icon,
  decorators: [
    (Story) => (
      <AraProvider>
        <AraThemeBoundary>
          <Story />
        </AraThemeBoundary>
      </AraProvider>
    )
  ],
  args: {
    icon: iconSet.Plus,
    size: "md",
    tone: null,
    strokeWidth: undefined,
    filled: false
  },
  argTypes: {
    icon: {
      control: { type: "select" },
      options: iconOptions,
      mapping: iconSet,
      description: "@ara/icons 에서 export 된 아이콘 컴포넌트"
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "24px", "32px"],
      description: "토큰 스케일 또는 커스텀 크기"
    },
    tone: {
      control: { type: "radio" },
      options: ["none", "primary", "neutral", "danger"],
      mapping: { none: null },
      description: "토큰 색상(currentColor) 적용 여부"
    },
    strokeWidth: {
      control: { type: "number", min: 0, step: 0.25 },
      description: "스트로크 기반 아이콘의 두께 (기본값: 토큰)"
    },
    filled: {
      control: { type: "boolean" },
      description: "fill 값이 비어 있거나 none 인 노드에 currentColor 적용"
    },
    className: { control: false },
    style: { control: false },
    color: { control: false },
    role: { control: false },
    title: { control: "text" }
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  parameters: {
    controls: {
      exclude: ["icon"]
    }
  },
  render: ({ icon: _icon, ...args }) => (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem" }}>
        워크스페이스에 포함된 아이콘을 토큰 기반 스타일로 렌더링합니다. size/tone/strokeWidth 컨트롤로 공통 값을 조정하고, filled
        로 컬러 영역을 채웁니다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "1rem",
          alignItems: "center"
        }}
      >
        {iconOptions.map((name) => {
          const IconComponent = iconSet[name];

          return (
            <figure
              key={name}
              style={{
                display: "grid",
                gap: "0.5rem",
                justifyItems: "center",
                padding: "0.75rem",
                border: "1px solid #E2E8F0",
                borderRadius: "0.75rem",
                background: "#FFFFFF"
              }}
            >
              <Icon icon={IconComponent} aria-hidden {...args} />
              <figcaption
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "#475569",
                  textAlign: "center",
                  wordBreak: "keep-all"
                }}
              >
                {name}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  )
};

export const Accessibility: Story = {
  parameters: {
    controls: {
      exclude: ["icon"]
    }
  },
  args: {
    tone: "primary",
    filled: true,
    size: "md",
    strokeWidth: 1.5,
    title: "성공"
  },
  render: ({ icon: _icon, ...args }) => {
    const labelId = "icon-title-sample";

    return (
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          maxWidth: 420,
          fontSize: "0.9375rem",
          color: "#334155"
        }}
      >
        <p style={{ margin: 0 }}>
          `title` 을 전달하면 내부 `title` 요소와 `role="img"` 이 생성되고, `aria-labelledby` 로 연결되어 스크린 리더가 읽을 수
          있습니다. 추가 라벨이 필요하면 `aria-label` 또는 `aria-labelledby` 를 넘겨주세요.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Icon {...args} aria-labelledby={labelId} />
          <span id={labelId}>성공 상태 아이콘</span>
        </div>
      </div>
    );
  }
};
