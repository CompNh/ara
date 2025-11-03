import type { Meta, StoryObj } from "@storybook/react";
import { AraProvider, Button } from "@ara/react";

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
        <Story />
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
