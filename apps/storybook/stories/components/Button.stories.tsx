import type { Meta, StoryObj } from "@storybook/react";
import { AraProvider, Button } from "@ara/react";

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
    children: "확인"
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary"
  }
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "보조"
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "비활성화"
  }
};
