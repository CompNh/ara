import { useMemo, useState, type ComponentProps, type FormEventHandler } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, CheckCircle, Plus, Search } from "@ara/icons";
import {
  AraProvider,
  AraThemeBoundary,
  Button,
  Flex,
  Grid,
  Icon,
  Stack,
  TextField
} from "@ara/react";

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
    suffixAction: { control: false },
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
        prefixIcon={<Icon icon={Search} size="sm" aria-hidden />}
        suffixAction={
          <Button tone="primary" variant="solid" size="sm">
            검색
          </Button>
        }
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
  render: (args) => (
    <TextField {...args} label="사용자명" helperText="Esc 또는 지우기 버튼으로 초기화할 수 있습니다." />
  )
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

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
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

const IntegrationSmokeExample = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("hello@ara.design");
  const [topic, setTopic] = useState("온보딩 문의");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setSubmitted(`${name || "(이름 없음)"} / ${email || "(이메일 없음)"} / ${
      topic || "(주제 없음)"
    }`);
  };

  const handleReset = () => {
    setName("");
    setEmail("hello@ara.design");
    setTopic("");
    setSubmitted(null);
  };

  return (
    <Stack gap="md" style={{ maxWidth: "780px" }}>
      <Stack gap="2px">
        <div style={{ fontWeight: 700 }}>아이콘 · 레이아웃 · 폼 통합</div>
        <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
          prefix/suffix 아이콘, Stack/Grid 배치, Button 액션을 한 번에 확인하는 스모크 예제입니다.
        </div>
      </Stack>

      <form onSubmit={handleSubmit} onReset={handleReset} style={{ display: "grid", gap: "0.75rem" }}>
        <Grid columns={{ base: 1, sm: 2 }} gap="md">
          <TextField
            label="이름"
            name="applicant"
            placeholder="홍길동"
            value={name}
            onValueChange={setName}
            prefixIcon={<Icon icon={Plus} size="sm" aria-hidden />}
            required
          />
          <TextField
            label="이메일"
            name="email"
            type="email"
            value={email}
            onValueChange={setEmail}
            helperText="폼 제출 및 Enter 확정(onCommit)을 모두 지원합니다."
            prefixIcon={<Icon icon={CheckCircle} tone="primary" size="sm" aria-hidden />}
            required
          />
          <TextField
            label="키워드"
            name="topic"
            placeholder="예: 디자인 시스템"
            value={topic}
            onValueChange={setTopic}
            suffixIcon={<Icon icon={Search} size="sm" aria-hidden />}
            suffixAction={
              <Button size="sm" variant="outline" tone="neutral" type="submit" trailingIcon={<ArrowRight aria-hidden />}>
                제출
              </Button>
            }
            clearable
          />
          <TextField
            label="메모"
            name="note"
            placeholder="요청 배경이나 추가 정보를 적어주세요."
            helperText="Grid 레이아웃을 통해 가로 폭을 쉽게 확장할 수 있습니다."
            style={{ gridColumn: "1 / -1" }}
          />
        </Grid>

        <Flex gap="sm" justify="end">
          <Button type="reset" variant="outline" tone="neutral">
            초기화
          </Button>
          <Button type="submit" trailingIcon={<ArrowRight aria-hidden />}>
            폼 제출
          </Button>
        </Flex>

        <div style={{ color: "var(--ara-color-text-muted, #475569)", fontSize: "0.95rem" }}>
          최근 제출: <strong>{submitted ?? "(아직 없음)"}</strong>
        </div>
      </form>
    </Stack>
  );
};

export const IntegrationSmoke: Story = {
  name: "Integration Smoke (Icons + Layout + Form)",
  parameters: {
    controls: { disable: true }
  },
  render: () => <IntegrationSmokeExample />
};
