import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ThemeOverrides } from "@ara/core";
import { ArrowRight, Plus } from "@ara/icons";
import { AraProvider, AraThemeBoundary, Button, Icon, ThemeProvider } from "@ara/react";

const meta = {
  title: "Components/Button",
  component: Button,
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
    layout: "centered"
  },
  args: {
    children: "확인",
    variant: "solid",
    tone: "primary",
    size: "md"
  },
  argTypes: {
    leadingIcon: { control: false },
    trailingIcon: { control: false }
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const darkTheme: ThemeOverrides = {
  component: {
    button: {
      radius: "0.625rem",
      focus: {
        outlineWidth: "2px",
        outlineColor: "#60A5FA",
        outlineOffset: "2px",
        ringSize: "6px",
        ringColor: "rgba(96, 165, 250, 0.35)"
      },
      variant: {
        solid: {
          primary: {
            background: "#2563EB",
            foreground: "#F8FAFC",
            border: "#2563EB",
            backgroundHover: "#1E40AF",
            foregroundHover: "#F8FAFC",
            borderHover: "#1E3A8A",
            backgroundActive: "#1D4ED8",
            foregroundActive: "#F8FAFC",
            borderActive: "#1D4ED8",
            shadow: "0 0 0 1px rgba(37, 99, 235, 0.45)"
          },
          danger: {
            background: "#F87171",
            foreground: "#0F172A",
            border: "#F87171",
            backgroundHover: "#EF4444",
            foregroundHover: "#0F172A",
            borderHover: "#EF4444",
            backgroundActive: "#DC2626",
            foregroundActive: "#F9FAFB",
            borderActive: "#DC2626"
          }
        },
        outline: {
          primary: {
            background: "transparent",
            foreground: "#BFDBFE",
            border: "#60A5FA",
            backgroundHover: "rgba(37, 99, 235, 0.12)",
            foregroundHover: "#DBEAFE",
            borderHover: "#60A5FA",
            backgroundActive: "rgba(37, 99, 235, 0.2)",
            foregroundActive: "#E0F2FE",
            borderActive: "#60A5FA"
          }
        },
        ghost: {
          primary: {
            background: "transparent",
            foreground: "#93C5FD",
            border: "transparent",
            backgroundHover: "rgba(37, 99, 235, 0.12)",
            foregroundHover: "#BFDBFE",
            borderHover: "transparent",
            backgroundActive: "rgba(37, 99, 235, 0.2)",
            foregroundActive: "#E0F2FE",
            borderActive: "transparent"
          }
        }
      }
    }
  }
};

export const Playground: Story = {};

export const Variants: Story = {
  parameters: {
    controls: { exclude: ["variant"] }
  },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  )
};

export const Tones: Story = {
  parameters: {
    controls: { exclude: ["tone"] }
  },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button {...args} tone="primary">
        Primary
      </Button>
      <Button {...args} tone="neutral" variant="solid">
        Neutral
      </Button>
      <Button {...args} tone="danger" variant="solid">
        Danger
      </Button>
    </div>
  )
};

export const Sizes: Story = {
  parameters: {
    controls: { exclude: ["size"] }
  },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  )
};

export const WithIcons: Story = {
  args: {
    leadingIcon: <Icon icon={Plus} size="sm" aria-hidden />,
    trailingIcon: <Icon icon={ArrowRight} size="sm" aria-hidden />,
    children: "아이콘 포함"
  }
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "로딩 중"
  }
};

export const AsLink: Story = {
  args: {
    href: "https://ara.design",
    target: "_blank",
    rel: "noopener noreferrer",
    children: "문서로 이동"
  }
};

export const FullWidth: Story = {
  render: (args) => (
    <div style={{ width: "320px" }}>
      <Button {...args} fullWidth>
        가로 전체
      </Button>
    </div>
  ),
  parameters: {
    controls: { exclude: ["fullWidth"] }
  }
};

export const ThemeSamples: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: "520px" }}>
      <section>
        <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#475569" }}>라이트 (기본)</h4>
        <ThemeProvider mode="light" storageKey={null}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button {...args}>Primary</Button>
            <Button {...args} variant="outline">
              Outline
            </Button>
            <Button {...args} tone="danger">
              Danger
            </Button>
          </div>
        </ThemeProvider>
      </section>
      <section
        style={{
          backgroundColor: "#0B1120",
          color: "#E2E8F0",
          padding: "1.5rem",
          borderRadius: "1rem"
        }}
      >
        <h4 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "0.875rem" }}>다크 (테마 오버라이드)</h4>
        <ThemeProvider mode="dark" defaultMode="dark" storageKey={null} theme={darkTheme}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button {...args}>Primary</Button>
            <Button {...args} variant="outline">
              Outline
            </Button>
            <Button {...args} tone="danger">
              Danger
            </Button>
          </div>
        </ThemeProvider>
      </section>
    </div>
  ),
  parameters: {
    controls: { exclude: ["tone", "variant", "size"] }
  }
};

type ColorModeSampleProps = {
  readonly mode: "light" | "dark";
  readonly args: Story["args"];
};

function ColorModeSample({ mode, args }: ColorModeSampleProps) {
  const surface = `var(--ara-color-role-${mode}-surface-surface)`;
  const elevated = `var(--ara-color-role-${mode}-surface-elevated)`;
  const textPrimary = `var(--ara-color-role-${mode}-text-primary)`;
  const textSecondary = `var(--ara-color-role-${mode}-text-secondary)`;
  const border = `var(--ara-color-role-${mode}-border-default)`;

  return (
    <ThemeProvider mode={mode} defaultMode={mode} storageKey={null}>
      <section
        style={{
          background: surface,
          color: textPrimary,
          padding: "var(--ara-space-lg)",
          borderRadius: "var(--ara-radius-lg)",
          border: `1px solid ${border}`,
          display: "grid",
          gap: "var(--ara-space-md)",
          boxShadow: "var(--ara-elevation-md)"
        }}
      >
        <header>
          <p
            style={{
              margin: 0,
              color: textSecondary,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "var(--ara-space-xs)"
            }}
          >
            <span
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                display: "inline-block",
                background: `var(--ara-color-role-${mode}-interactive-primary-default-bg)`
              }}
            />
            {mode === "light" ? "라이트" : "다크"} 모드
          </p>
          <h4 style={{ margin: "0 0 var(--ara-space-sm)", fontSize: "1rem" }}>
            ThemeProvider 연동
          </h4>
          <p style={{ margin: 0, color: textSecondary, fontSize: "0.875rem" }}>
            Button 토큰이 모드별 CSS 변수(--ara-color-role-*)와 크기 토큰(--ara-btn-size-*)을 소비하는지 확인합니다.
          </p>
        </header>
        <div
          style={{
            display: "grid",
            gap: "var(--ara-space-sm)",
            background: elevated,
            padding: "var(--ara-space-md)",
            borderRadius: "var(--ara-radius-md)",
            border: `1px solid ${border}`
          }}
        >
          <div style={{ display: "flex", gap: "var(--ara-space-sm)", flexWrap: "wrap" }}>
            <Button {...args}>Primary</Button>
            <Button {...args} variant="outline">
              Outline
            </Button>
            <Button {...args} variant="ghost">
              Ghost
            </Button>
            <Button {...args} tone="neutral">
              Neutral
            </Button>
            <Button {...args} tone="danger">
              Danger
            </Button>
          </div>
          <div style={{ display: "flex", gap: "var(--ara-space-sm)", flexWrap: "wrap" }}>
            <Button {...args} size="sm">
              Small
            </Button>
            <Button {...args} size="md">
              Medium
            </Button>
            <Button {...args} size="lg">
              Large
            </Button>
          </div>
        </div>
      </section>
    </ThemeProvider>
  );
}

export const ThemeIntegration: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gap: "var(--ara-space-lg)",
        maxWidth: "min(960px, 100%)"
      }}
    >
      <ColorModeSample mode="light" args={args} />
      <ColorModeSample mode="dark" args={args} />
    </div>
  ),
  parameters: {
    controls: { exclude: ["variant", "tone", "size"] }
  },
  args: {
    children: "토큰 반영"
  }
};

export const Accessibility: Story = {
  render: (args) => {
    const focusOverride = {
      "--ara-btn-focus-outline": "3px solid var(--ara-color-brand-500)",
      "--ara-btn-focus-ring": "0 0 0 6px rgba(37, 99, 235, 0.3)"
    } as CSSProperties;

    return (
      <div style={{ display: "grid", gap: "1.5rem", maxWidth: "520px" }}>
        <section>
          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#475569" }}>
            RTL 방향
          </h4>
          <AraProvider>
            <AraThemeBoundary asChild direction="rtl">
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  justifyContent: "flex-start"
                }}
              >
                <Button
                  {...args}
                  leadingIcon={<Icon icon={ArrowRight} size="sm" aria-hidden />}
                  trailingIcon={<Icon icon={ArrowRight} size="sm" aria-hidden />}
                >
                  오른쪽에서 시작
                </Button>
                <Button
                  {...args}
                  variant="outline"
                  leadingIcon={<Icon icon={ArrowRight} size="sm" aria-hidden />}
                >
                  아이콘 정렬 확인
                </Button>
              </div>
            </AraThemeBoundary>
          </AraProvider>
        </section>
        <section>
          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#475569" }}>
            포커스 링 커스터마이징
          </h4>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", color: "#64748B" }}>
            CSS 변수로 `--ara-btn-focus-outline`과 `--ara-btn-focus-ring`을 덮어써 시각을 조정합니다.
          </p>
          <Button {...args} style={focusOverride}>
            포커스 스타일
          </Button>
        </section>
      </div>
    );
  },
  parameters: {
    controls: { exclude: ["leadingIcon", "trailingIcon"] }
  }
};
