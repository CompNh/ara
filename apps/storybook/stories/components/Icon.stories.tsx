import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { icons as iconSet, type IconName } from "@ara/icons";
import { AraProvider, AraThemeBoundary, Button, Icon } from "@ara/react";

const iconOptions = Object.keys(iconSet) as IconName[];
const { Plus, ArrowRight, CheckCircle } = iconSet;

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
  render: (args) => {
    const { icon: _icon, ...rest } = args;
    void _icon;

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            color: "#475569",
            fontSize: "0.875rem"
          }}
        >
          <p style={{ margin: 0 }}>
            워크스페이스 아이콘을 토큰 규칙(size/tone/strokeWidth)으로 미리보기합니다. filled 토글로 채움 여부를 확인하세요.
          </p>
          <p style={{ margin: 0 }}>
            카드 안의 미리보기는 중앙 정렬된 48px 박스 안에 표시되어 실제 UI 배치와 비슷하게 확인할 수 있습니다.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "1rem",
            alignItems: "stretch"
          }}
        >
          {iconOptions.map((name) => {
            const IconComponent = iconSet[name];

            return (
              <figure
                key={name}
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  justifyItems: "center",
                  padding: "1rem 0.75rem",
                  border: "1px solid #E2E8F0",
                  borderRadius: "0.75rem",
                  background: "#FFFFFF",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.03)"
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    background: "#F8FAFC",
                    color: "#0F172A"
                  }}
                >
                  <Icon icon={IconComponent} aria-hidden {...rest} />
                </span>
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
    );
  }
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
  render: (args) => {
    const { icon, ...rest } = args;
    const labelId = "icon-title-sample";

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            color: "#475569",
            fontSize: "0.875rem"
          }}
        >
          <p style={{ margin: 0 }}>
            `title` 을 전달하면 내부 `title` 요소와 `role=&quot;img&quot;` 이 생성되고, `aria-labelledby` 로 연결되어 스크린 리더가 읽을 수
            있습니다. 추가 라벨이 필요하면 `aria-label` 또는 `aria-labelledby` 를 넘겨주세요.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Icon icon={icon} {...rest} aria-labelledby={labelId} />
            <span id={labelId}>성공 상태 아이콘</span>
          </div>
        </div>
      </div>
    );
  }
};

export const ComponentIntegration: Story = {
  parameters: {
    controls: {
      exclude: ["icon", "strokeWidth"]
    }
  },
  render: () => {
    const buttonIconSize = "sm";
    const fieldStyle = {
      display: "grid",
      gap: "0.35rem",
      maxWidth: "400px"
    } satisfies CSSProperties;
    const inputShellStyle = {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 0.75rem",
      border: "1px solid #E2E8F0",
      borderRadius: "0.75rem",
      background: "#FFFFFF",
      boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05)",
      color: "#0F172A"
    } satisfies CSSProperties;
    const inputStyle = {
      width: "100%",
      border: "none",
      outline: "none",
      font: "inherit",
      color: "inherit",
      background: "transparent"
    } satisfies CSSProperties;
    const helperStyle = {
      margin: 0,
      fontSize: "0.8125rem",
      color: "#64748B"
    } satisfies CSSProperties;

    return (
      <div style={{ display: "grid", gap: "1.5rem", maxWidth: "720px" }}>
        <section style={{ display: "grid", gap: "0.5rem" }}>
          <h4 style={{ margin: 0, color: "#0F172A" }}>Button 슬롯 연동</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
            `leadingIcon` / `trailingIcon` 슬롯에 `Icon`을 직접 넣어 토큰 크기와 currentColor 규칙을 공유합니다.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button leadingIcon={<Icon icon={Plus} size={buttonIconSize} aria-hidden />}>새 항목</Button>
            <Button
              variant="outline"
              trailingIcon={<Icon icon={ArrowRight} size={buttonIconSize} aria-hidden />}
            >
              다음 단계
            </Button>
            <Button
              tone="neutral"
              variant="ghost"
              trailingIcon={<Icon icon={CheckCircle} size={buttonIconSize} aria-hidden />}
            >
              검토 완료
            </Button>
          </div>
        </section>

        <section style={{ display: "grid", gap: "0.5rem" }}>
          <h4 style={{ margin: 0, color: "#0F172A" }}>입력 필드 접두/접미 예시</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
            TextField 컴포넌트가 도입되면 동일한 패턴으로 prefix/suffix 아이콘을 배치할 수 있습니다.
          </p>
          <label style={fieldStyle}>
            <span style={{ fontSize: "0.875rem", color: "#0F172A" }}>워크플로우 URL</span>
            <div style={inputShellStyle}>
              <Icon icon={CheckCircle} tone="primary" size="md" aria-hidden />
              <input
                type="text"
                defaultValue="https://ara.design/workflows"
                aria-label="워크플로우 URL"
                style={inputStyle}
              />
              <Icon icon={ArrowRight} size="sm" aria-hidden />
            </div>
            <p style={helperStyle}>prefix/suffix 슬롯을 활용해 상태나 액션 힌트를 함께 노출합니다.</p>
          </label>
        </section>
      </div>
    );
  }
};
