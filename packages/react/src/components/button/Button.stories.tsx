import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { AraProvider } from "../../theme/index.js";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AraProvider>
        <Story />
      </AraProvider>
    )
  ]
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "기본 버튼"
  }
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "보조 버튼"
  }
};

export const CustomTheme: Story = {
  args: {
    children: "경고"
  },
  render: (args) => (
    <AraProvider theme={{ color: { brand: { "500": "#FF6B00" } } }}>
      <Button {...args} />
    </AraProvider>
  )
};
