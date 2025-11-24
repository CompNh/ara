import { useMemo, useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, CheckCircle, Plus } from "@ara/icons";
import { AraProvider, AraThemeBoundary, Button, Icon, Stack, TextField } from "@ara/react";

const meta = {
  title: "Components/TextField",
  component: TextField,
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
    label: "이메일",
    placeholder: "example@ara.design",
    size: "md",
    helperText: "입력 시 이메일 형식을 확인하세요.",
    required: false,
    disabled: false
  },
  argTypes: {
    prefixIcon: { control: false },
    suffixIcon: { control: false },
    helperText: { control: "text" },
    errorText: { control: "text" }
  },
  tags: ["autodocs"]
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;
type TextFieldProps = ComponentProps<typeof TextField>;

const spacingProps = { gap: "md", style: { maxWidth: "720px" } } as const;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: { exclude: ["size"] }
  },
  render: (args) => (
    <Stack orientation="horizontal" gap="md">
      <TextField {...args} size="sm" label="이메일 (sm)" />
      <TextField {...args} size="md" label="이메일 (md)" />
      <TextField {...args} size="lg" label="이메일 (lg)" />
    </Stack>
  )
};

export const HelperAndError: Story = {
  name: "Helper & Error",
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <TextField label="닉네임" helperText="최소 2자 이상 입력하세요." placeholder="ara" />
      <TextField
        label="이메일"
        defaultValue="ara@"
        errorText="이메일 형식이 올바르지 않습니다."
        helperText="도메인까지 입력해야 합니다."
      />
    </Stack>
  )
};

export const States: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <TextField label="기본" placeholder="입력 가능" />
      <TextField label="읽기 전용" defaultValue="고정 값" readOnly />
      <TextField label="비활성화" defaultValue="입력 불가" disabled />
      <TextField label="유효성 오류" defaultValue="ara" errorText="필수 값이 비어 있습니다." />
    </Stack>
  )
};

export const PrefixSuffix: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <TextField
        label="금액"
        type="number"
        placeholder="10000"
        prefixIcon={<Icon icon={Plus} size="sm" aria-hidden />}
        suffixIcon={<Icon icon={CheckCircle} tone="primary" size="sm" aria-hidden />}
      />
      <TextField
        label="검색"
        placeholder="키워드를 입력하세요"
        prefixIcon={<Icon icon={ArrowRight} size="sm" aria-hidden />}
        suffixIcon={<Button tone="neutral" variant="outline" size="sm">검색</Button>}
      />
    </Stack>
  )
};

export const Clearable: Story = {
  parameters: {
    controls: { exclude: ["clearable", "defaultValue"] }
  },
  args: {
    clearable: true,
    defaultValue: "ara-design"
  },
  render: (args) => <TextField {...args} label="사용자명" helperText="Esc 또는 X 버튼으로 초기화할 수 있습니다." />
};

export const PasswordToggle: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    passwordToggle: true,
    autoComplete: "new-password"
  }
};

const ControlledVsUncontrolledExample = () => {
  const [email, setEmail] = useState("ara@design.com");

  return (
    <Stack {...spacingProps}>
      <TextField
        label="제어 모드"
        value={email}
        onValueChange={setEmail}
        helperText="상위 상태를 직접 갱신합니다."
      />
      <TextField
        label="비제어 모드"
        defaultValue="초기값"
        helperText="내부 상태를 사용하며 onValueChange로만 알림"
        onValueChange={(value) => console.log("비제어 변경", value)}
      />
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>현재 이메일 값: {email}</div>
    </Stack>
  );
};

export const ControlledVsUncontrolled: Story = {
  name: "Controlled vs Uncontrolled",
  parameters: {
    controls: { disable: true }
  },
  render: () => <ControlledVsUncontrolledExample />
};

export const Types: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: () => (
    <Stack {...spacingProps}>
      <TextField label="텍스트" type="text" placeholder="자유 입력" />
      <TextField label="이메일" type="email" placeholder="example@ara.design" />
      <TextField label="비밀번호" type="password" passwordToggle placeholder="********" />
      <TextField label="숫자" type="number" placeholder="12345" />
    </Stack>
  )
};

const FormSubmitExample = () => {
  const [submitted, setSubmitted] = useState<TextFieldProps["defaultValue"]>("");
  const [value, setValue] = useState("hello");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextValue = formData.get("feedback")?.toString() ?? "";
    setSubmitted(nextValue);
  };

  const helper = useMemo(() => "Enter 키로 onCommit, Submit 버튼으로 네이티브 제출 흐름을 확인하세요.", []);

  return (
    <form onSubmit={handleSubmit} style={{ width: "320px", display: "grid", gap: "0.75rem" }}>
      <TextField
        label="의견"
        name="feedback"
        value={value}
        onValueChange={setValue}
        onCommit={setSubmitted}
        helperText={helper}
        required
      />
      <Button type="submit">제출</Button>
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
        마지막 제출 값: <strong>{submitted || "(비어 있음)"}</strong>
      </div>
    </form>
  );
};

export const FormSubmit: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: () => <FormSubmitExample />
};
