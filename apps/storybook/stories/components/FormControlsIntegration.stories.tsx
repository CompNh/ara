import { useMemo, useState, type FormEventHandler } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, CheckCircle, Plus } from "@ara/icons";
import {
  AraProvider,
  AraThemeBoundary,
  Button,
  Checkbox,
  Flex,
  Grid,
  Icon,
  Radio,
  Stack,
  Switch,
  TextField
} from "@ara/react";

type SubmittedState = {
  readonly name: string;
  readonly email: string;
  readonly contact: string;
  readonly channels: readonly string[];
  readonly marketing: boolean;
};

const meta = {
  title: "Components/Form Controls/Integration",
  component: Checkbox,
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
    layout: "padded",
    controls: { disable: true }
  }
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const descriptionStyle = { color: "var(--ara-color-text-muted, #475569)" } as const;
const cardStyle = {
  border: "1px solid var(--ara-color-border-weak, #e2e8f0)",
  borderRadius: "0.75rem",
  background: "var(--ara-color-surface-strong, #fff)",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)"
} as const;

const ChannelSummary = ({ label }: { readonly label: string }) => (
  <Flex gap="xs" align="center">
    <Icon icon={ArrowRight} size="sm" aria-hidden />
    <span>{label}</span>
  </Flex>
);

const FormIntegration = () => {
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const selectedChannels = formData.getAll("channels").map(String);

    setSubmitted({
      name: (formData.get("name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      contact: (formData.get("contact") as string) ?? "",
      channels: selectedChannels,
      marketing: formData.get("marketing") === "on"
    });
  };

  const resetState = () => setSubmitted(null);

  const channelHint = useMemo(
    () =>
      submitted && submitted.channels.length
        ? submitted.channels.join(", ")
        : "이메일, SMS, 푸시 중 원하는 채널을 선택하세요.",
    [submitted]
  );

  return (
    <Stack as="form" gap="lg" onSubmit={handleSubmit} onReset={resetState} style={cardStyle}>
      <Stack gap="xs" style={{ padding: "1.25rem 1.25rem 0" }}>
        <Flex gap="sm" align="center">
          <Icon icon={CheckCircle} tone="primary" aria-hidden />
          <Stack gap="2px">
            <div style={{ fontWeight: 700 }}>Icons + Layout + Form Controls</div>
            <div style={descriptionStyle}>
              Stack/Grid 레이아웃 위에 Checkbox · Radio · Switch를 배치하고, Icon 컴포넌트로 피드백을 제공합니다.
            </div>
          </Stack>
        </Flex>
      </Stack>

      <Stack gap="lg" style={{ padding: "0 1.25rem 1.25rem" }}>
        <Grid columns={{ base: 1, sm: 2 }} gap="md">
          <TextField name="name" label="이름" placeholder="아라" required />
          <TextField
            name="email"
            type="email"
            label="이메일"
            placeholder="ara@example.com"
            helperText="워크스페이스 알림을 받을 이메일을 입력하세요."
            required
          />
        </Grid>

        <Grid columns={{ base: 1, md: 2 }} gap="lg">
          <Stack gap="sm">
            <Flex gap="xs" align="center" style={{ fontWeight: 600 }}>
              <Icon icon={Plus} size="sm" aria-hidden />
              <span>알림 채널</span>
            </Flex>
            <div style={descriptionStyle}>{channelHint}</div>
            <Stack gap="sm">
              <Checkbox
                name="channels"
                value="email"
                label="이메일"
                description="정기 업데이트와 보안 알림을 메일로 전달합니다."
                defaultChecked
              />
              <Checkbox
                name="channels"
                value="sms"
                label="SMS"
                description="문자로 긴급 알림을 받습니다."
              />
              <Checkbox
                name="channels"
                value="push"
                label="푸시"
                description="앱 알림 배너로 주요 변경 사항을 확인합니다."
              />
            </Stack>
          </Stack>

          <Stack gap="lg">
            <Stack gap="sm">
              <Flex gap="xs" align="center" style={{ fontWeight: 600 }}>
                <Icon icon={ArrowRight} size="sm" aria-hidden />
                <span>응답 속도</span>
              </Flex>
              <div style={descriptionStyle}>알림 수신 빈도를 선택합니다.</div>
              <Stack gap="sm">
                <Radio name="contact" value="fast" label="실시간" defaultChecked />
                <Radio name="contact" value="daily" label="매일 요약" />
                <Radio name="contact" value="weekly" label="주간 묶음" />
              </Stack>
            </Stack>

            <Stack gap="sm">
              <Flex gap="xs" align="center" style={{ fontWeight: 600 }}>
                <Icon icon={CheckCircle} size="sm" aria-hidden />
                <span>마케팅 수신 동의</span>
              </Flex>
              <Switch
                name="marketing"
                label="신규 기능·프로모션 소식을 수신합니다."
                description="언제든지 폼을 다시 제출해 동의를 변경할 수 있습니다."
                defaultChecked
              />
            </Stack>
          </Stack>
        </Grid>

        <Flex justify="end" gap="sm" wrap={{ base: "wrap", sm: false }}>
          <Button type="reset" variant="outline" tone="neutral">
            초기화
          </Button>
          <Button type="submit" trailingIcon={<ArrowRight aria-hidden />}>
            제출하고 미리보기
          </Button>
        </Flex>

        <Stack gap="sm" style={{ borderTop: "1px solid var(--ara-color-border-weak, #e2e8f0)", paddingTop: "1rem" }}>
          {submitted ? (
            <Stack gap="sm">
              <Flex gap="sm" align="center">
                <Icon icon={CheckCircle} tone="primary" aria-hidden />
                <Stack gap="2px">
                  <div style={{ fontWeight: 700 }}>폼 제출 완료</div>
                  <div style={descriptionStyle}>폼 데이터는 네이티브 FormData로 수집했습니다.</div>
                </Stack>
              </Flex>
              <Grid columns={{ base: 1, sm: 2 }} gap="sm">
                <Stack gap="2px" style={{ fontWeight: 600 }}>
                  이름
                  <span style={descriptionStyle}>{submitted.name || "(미입력)"}</span>
                </Stack>
                <Stack gap="2px" style={{ fontWeight: 600 }}>
                  이메일
                  <span style={descriptionStyle}>{submitted.email || "(미입력)"}</span>
                </Stack>
                <Stack gap="2px" style={{ fontWeight: 600 }}>
                  수신 빈도
                  <span style={descriptionStyle}>{submitted.contact}</span>
                </Stack>
                <Stack gap="2px" style={{ fontWeight: 600 }}>
                  마케팅 동의
                  <span style={descriptionStyle}>{submitted.marketing ? "동의" : "거부"}</span>
                </Stack>
              </Grid>
              <Stack gap="xs">
                <div style={{ fontWeight: 600 }}>선택한 채널</div>
                <Stack gap="4px">
                  {submitted.channels.length ? (
                    submitted.channels.map((channel) => <ChannelSummary key={channel} label={channel} />)
                  ) : (
                    <span style={descriptionStyle}>선택된 채널이 없습니다.</span>
                  )}
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <div style={descriptionStyle}>폼을 작성해 제출하면 선택 사항이 요약되어 표시됩니다.</div>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const IconLayoutFormSmoke: Story = {
  name: "아이콘/레이아웃/폼 스모크",
  render: () => <FormIntegration />
};
