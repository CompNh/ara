import type { Meta, StoryObj } from "@storybook/react";
import type { ThemeOverrides } from "@ara/core";
import { AraProvider, AraThemeBoundary, Button } from "@ara/react";

const ArrowRightIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    fill="currentColor"
  >
    <path d="M4 11h10.17l-3.58-3.59L12 6l6 6-6 6-1.41-1.41L14.17 13H4z" />
  </svg>
);

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
    leadingIcon: <ArrowRightIcon />,
    trailingIcon: <ArrowRightIcon />,
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
        <AraProvider>
          <AraThemeBoundary asChild>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button {...args}>Primary</Button>
              <Button {...args} variant="outline">
                Outline
              </Button>
              <Button {...args} tone="danger">
                Danger
              </Button>
            </div>
          </AraThemeBoundary>
        </AraProvider>
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
        <AraProvider theme={darkTheme}>
          <AraThemeBoundary asChild>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button {...args}>Primary</Button>
              <Button {...args} variant="outline">
                Outline
              </Button>
              <Button {...args} tone="danger">
                Danger
              </Button>
            </div>
          </AraThemeBoundary>
        </AraProvider>
      </section>
    </div>
  ),
  parameters: {
    controls: { exclude: ["tone", "variant", "size"] }
  }
};
