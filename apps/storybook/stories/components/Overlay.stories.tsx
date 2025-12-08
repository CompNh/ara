import { useRef, useState, type ComponentProps, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AraProvider,
  AraThemeBoundary,
  Button,
  DismissableLayer,
  FocusTrap,
  Portal,
  Positioner,
  Stack,
  TextField,
  usePositioner
} from "@ara/react";

const meta = {
  title: "Components/Overlay",
  component: Portal,
  subcomponents: { FocusTrap, Positioner, DismissableLayer },
  decorators: [
    (Story) => (
      <AraProvider>
        <AraThemeBoundary>
          <Story />
        </AraThemeBoundary>
      </AraProvider>
    )
  ],
  parameters: { layout: "padded" },
  tags: ["autodocs"]
} satisfies Meta<typeof Portal>;

export default meta;

type Story = StoryObj<typeof meta>;
type PositionerArgs = {
  placement?: ComponentProps<typeof Positioner>["placement"];
  offset?: ComponentProps<typeof Positioner>["offset"];
  strategy?: ComponentProps<typeof Positioner>["strategy"];
  renderArrow?: boolean;
};

const surfaceStyle: CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid var(--ara-color-border-weak, #e5e7eb)",
  background: "var(--ara-color-surface-strong, #ffffff)",
  boxShadow: "0 10px 40px rgba(15, 23, 42, 0.18)",
  color: "var(--ara-color-text-strong, #0f172a)"
};

const overlayBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.42)",
  display: "grid",
  placeItems: "center",
  padding: "1.5rem",
  zIndex: 10
};

function PortalTargetsStory() {
  const [leftContainer, setLeftContainer] = useState<HTMLDivElement | null>(null);
  const [rightContainer, setRightContainer] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState<"left" | "right">("left");

  const activeButtonProps = { variant: "solid" as const, tone: "primary" as const };
  const inactiveButtonProps = { variant: "ghost" as const, tone: "primary" as const };

  return (
    <Stack gap="md">
      <Stack orientation="horizontal" gap="sm">
        <Button
          {...(active === "left" ? activeButtonProps : inactiveButtonProps)}
          onClick={() => setActive("left")}
        >
          왼쪽 컨테이너
        </Button>
        <Button
          {...(active === "right" ? activeButtonProps : inactiveButtonProps)}
          onClick={() => setActive("right")}
        >
          오른쪽 컨테이너
        </Button>
      </Stack>
      <Stack orientation="horizontal" gap="md">
        <div
          ref={setLeftContainer}
          style={{
            ...surfaceStyle,
            padding: "1rem",
            minHeight: "140px",
            flex: 1,
            borderStyle: active === "left" ? "solid" : "dashed"
          }}
        >
          왼쪽: Portal이 여기로 렌더링됩니다.
        </div>
        <div
          ref={setRightContainer}
          style={{
            ...surfaceStyle,
            padding: "1rem",
            minHeight: "140px",
            flex: 1,
            borderStyle: active === "right" ? "solid" : "dashed"
          }}
        >
          오른쪽: 포탈 대상 토글을 확인하세요.
        </div>
      </Stack>
      <Portal container={active === "left" ? leftContainer : rightContainer}>
        <div
          style={{
            ...surfaceStyle,
            padding: "0.75rem 1rem",
            width: "fit-content",
            fontWeight: 600,
            borderColor: "var(--ara-color-accent-strong, #2563eb)",
            boxShadow: "0 12px 32px rgba(37, 99, 235, 0.25)"
          }}
        >
          Portal에서 렌더링된 배지
        </div>
      </Portal>
    </Stack>
  );
}

export const PortalTargets: Story = {
  name: "Portal 대상 선택",
  parameters: { controls: { disable: true } },
  render: () => <PortalTargetsStory />
};

function FocusTrapDialogStory() {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = () => setOpen(false);

  return (
    <Stack gap="md">
      <Button onClick={() => setOpen(true)}>
        대화상자 열기
      </Button>
      {open ? (
        <Portal>
          <div style={overlayBackdrop}>
            <FocusTrap restoreFocus initialFocus={() => confirmRef.current}>
              <Stack gap="sm" style={{ ...surfaceStyle, padding: "1.25rem", minWidth: "340px" }}>
                <div style={{ fontWeight: 700 }}>포커스가 이 영역을 벗어나지 않습니다.</div>
                <TextField label="이름" placeholder="홍길동" />
                <TextField label="이메일" placeholder="example@company.com" />
                <Stack orientation="horizontal" gap="sm" justify="end">
                  <Button variant="ghost" onClick={handleClose}>
                    취소
                  </Button>
                  <Button ref={confirmRef} onClick={handleClose}>
                    확인
                  </Button>
                </Stack>
              </Stack>
            </FocusTrap>
          </div>
        </Portal>
      ) : null}
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
        탭 키를 눌러도 포커스가 모달 내부에서 순환하며, 닫으면 트리거 버튼으로 복원됩니다.
      </div>
    </Stack>
  );
}

export const FocusTrapDialog: Story = {
  name: "FocusTrap 대화상자",
  parameters: { controls: { disable: true } },
  render: () => <FocusTrapDialogStory />
};

const bubbleStyle: CSSProperties = {
  ...surfaceStyle,
  padding: "0.75rem 1rem",
  minWidth: "220px",
  position: "absolute",
  border: "1px solid var(--ara-color-border, #cbd5e1)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
  zIndex: 2
};

function PositionerPlaygroundStory(args: PositionerArgs) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);

  const { anchorProps, floatingProps, arrowProps, placement } = usePositioner({
    anchorRef,
    floatingRef,
    placement: args.placement,
    offset: args.offset,
    strategy: args.strategy,
    withArrow: args.renderArrow
  });

  return (
    <div style={{ position: "relative", minHeight: "220px", padding: "48px" }}>
      <Button {...anchorProps} ref={anchorRef} style={{ paddingInline: "1.25rem" }}>
        기준 버튼 ({placement})
      </Button>
      <div
        {...floatingProps}
        ref={floatingRef}
        style={{
          ...bubbleStyle,
          ...floatingProps.style,
          background: "var(--ara-color-surface, #ffffff)",
          display: "grid",
          gap: "0.25rem"
        }}
      >
        <div style={{ fontWeight: 700 }}>Positioner</div>
        <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
          placement/offset/strategy를 조절해 배치를 확인하세요.
        </div>
        {arrowProps ? (
          <span
            {...arrowProps}
            style={{
              ...arrowProps.style,
              width: "12px",
              height: "12px",
              background: "inherit",
              transform: "rotate(45deg)",
              borderLeft: "1px solid var(--ara-color-border, #cbd5e1)",
              borderTop: "1px solid var(--ara-color-border, #cbd5e1)"
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export const PositionerPlayground: StoryObj<PositionerArgs> = {
  name: "Positioner 배치 컨트롤",
  args: {
    placement: "bottom-start",
    offset: 8,
    strategy: "absolute",
    renderArrow: true
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top-start",
        "top",
        "top-end",
        "right-start",
        "right",
        "right-end",
        "bottom-start",
        "bottom",
        "bottom-end",
        "left-start",
        "left",
        "left-end"
      ]
    },
    offset: { control: { type: "number", min: 0, max: 32 } },
    strategy: { control: "select", options: ["absolute", "fixed"] },
    renderArrow: { control: "boolean" }
  },
  render: (args) => <PositionerPlaygroundStory {...args} />
};

function DismissableLayerStackStory() {
  const [outerOpen, setOuterOpen] = useState(true);
  const [innerOpen, setInnerOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const appendLog = (message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 5));
  };

  const handleOuterDismiss = (reason: string) => {
    appendLog(`바깥 패널 닫힘 (${reason})`);
    setOuterOpen(false);
    setInnerOpen(false);
  };

  const handleInnerDismiss = (reason: string) => {
    appendLog(`알림 닫힘 (${reason})`);
    setInnerOpen(false);
  };

  const primaryTone = { tone: "primary" as const };

  return (
    <Stack gap="md">
      <Stack orientation="horizontal" gap="sm">
        <Button variant="solid" {...primaryTone} onClick={() => setOuterOpen(true)}>
          사이드 패널 열기
        </Button>
        <Button variant="ghost" {...primaryTone} onClick={() => setInnerOpen(true)} disabled={!outerOpen}>
          알림 열기
        </Button>
      </Stack>
      <div style={{ position: "relative", minHeight: "260px", border: "1px dashed var(--ara-color-border-weak, #e5e7eb)", borderRadius: "0.75rem" }}>
        {outerOpen ? (
          <DismissableLayer
            disableOutsidePointerEvents
            onDismiss={handleOuterDismiss}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: "360px",
              padding: "1rem",
              ...surfaceStyle
            }}
          >
            <Stack gap="sm">
              <div style={{ fontWeight: 700 }}>배경 클릭이나 ESC로 닫힙니다.</div>
              <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
                disableOutsidePointerEvents=true로 다른 클릭이 모두 차단됩니다.
              </div>
              <Stack orientation="horizontal" gap="sm" justify="end">
                <Button variant="ghost" {...primaryTone} onClick={() => setOuterOpen(false)}>
                  닫기
                </Button>
                <Button {...primaryTone} onClick={() => setInnerOpen(true)}>알림 열기</Button>
              </Stack>
            </Stack>
            {innerOpen ? (
              <DismissableLayer
                onDismiss={handleInnerDismiss}
                style={{
                  position: "absolute",
                  top: 12,
                  left: "-12px",
                  width: "240px",
                  padding: "0.875rem 1rem",
                  ...surfaceStyle,
                  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.22)",
                  borderColor: "var(--ara-color-border, #cbd5e1)"
                }}
              >
                <Stack gap="xs">
                  <div style={{ fontWeight: 700 }}>중첩된 레이어</div>
                  <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
                    패널 안쪽에서도 ESC, 포인터 아웃사이드로 닫힙니다.
                  </div>
                  <Button size="sm" {...primaryTone} onClick={() => setInnerOpen(false)}>
                    확인
                  </Button>
                </Stack>
              </DismissableLayer>
            ) : null}
          </DismissableLayer>
        ) : null}
      </div>
      <Stack gap="xs">
        <div style={{ fontWeight: 700 }}>최근 닫힘 이벤트</div>
        <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--ara-color-text-muted, #475569)" }}>
          {log.length === 0 ? <li>이벤트가 없습니다.</li> : log.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </Stack>
    </Stack>
  );
}

export const DismissableLayerStack: Story = {
  name: "DismissableLayer 중첩",
  parameters: { controls: { disable: true } },
  render: () => <DismissableLayerStackStory />
};

function OverlaySmokeStory() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  const { anchorProps, floatingProps } = usePositioner({
    anchorRef,
    floatingRef,
    placement: "bottom-start",
    offset: 8,
    strategy: "fixed",
    withArrow: true
  });

  const { ref: floatingRefCallback, style: floatingStyle, ...floatingRestProps } = floatingProps;

  const handleMenuToggle = () => {
    setMenuOpen((previous) => !previous);
  };

  const handleDialogOpen = () => {
    setMenuOpen(false);
    setDialogOpen(true);
  };

  const handleDialogClose = () => setDialogOpen(false);

  return (
    <Stack gap="md" style={{ maxWidth: "720px" }}>
      <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
        버튼으로 메뉴와 모달을 각각 열어 오버레이 프리미티브가 함께 작동하는지 스모크 테스트합니다.
        포커스 순환, 배경 차단, 스택 순서가 자연스럽게 동작해야 합니다.
      </div>

      <Stack orientation="horizontal" gap="sm">
        <Button
          {...anchorProps}
          ref={anchorRef}
          aria-expanded={menuOpen}
          aria-controls="overlay-smoke-menu"
          onClick={handleMenuToggle}
        >
          메뉴 토글
        </Button>
        <Button variant="outline" onClick={handleDialogOpen}>
          모달 열기
        </Button>
      </Stack>

      <div style={{ position: "relative", minHeight: "180px" }}>
        <div
          style={{
            ...surfaceStyle,
            padding: "1rem",
            height: "100%",
            overflow: "auto"
          }}
        >
          <Stack gap="xs">
            <div style={{ fontWeight: 700 }}>백그라운드 콘텐츠</div>
            <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
              ESC 키로 닫히는지, 백드롭에서 포커스가 빠져나가는지 등을 확인하며 상호작용을 반복해 보세요.
            </div>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat, neque vitae gravida luctus, neque
              dui congue nisi, quis tincidunt odio nisi vel massa. Integer sed nibh sed justo scelerisque facilisis.
            </div>
            <div>
              Curabitur ac metus sit amet lacus malesuada viverra. Quisque vel urna vel dui suscipit condimentum sed at
              nisl. Aenean sed elementum augue, ut aliquam massa.
            </div>
          </Stack>
        </div>

        {menuOpen ? (
          <DismissableLayer
            {...floatingRestProps}
            id="overlay-smoke-menu"
            disableOutsidePointerEvents
            ref={(node) => {
              floatingRef.current = node;
              floatingRefCallback(node);
            }}
            onDismiss={() => setMenuOpen(false)}
            style={{
              ...bubbleStyle,
              ...floatingStyle,
              width: 240,
              display: "grid",
              gap: "0.5rem",
              zIndex: 30
            }}
          >
            <div style={{ fontWeight: 700 }}>빠른 액션</div>
            <Button size="sm" variant="ghost" onClick={handleDialogOpen}>
              모달로 이동
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMenuOpen(false)}>
              메뉴 닫기
            </Button>
          </DismissableLayer>
        ) : null}
      </div>

      {dialogOpen ? (
        <Portal>
          <div style={{ ...overlayBackdrop, zIndex: 25 }}>
            <FocusTrap restoreFocus initialFocus={() => confirmRef.current}>
              <DismissableLayer
                disableOutsidePointerEvents
                onDismiss={handleDialogClose}
                style={{
                  ...surfaceStyle,
                  padding: "1.5rem",
                  width: "min(520px, 100%)",
                  maxHeight: "80vh",
                  overflow: "auto"
                }}
              >
                <Stack gap="sm">
                  <div style={{ fontWeight: 800 }}>모달 포커스/스크롤 확인</div>
                  <div style={{ color: "var(--ara-color-text-muted, #475569)" }}>
                    Tab 키로 버튼과 입력 필드를 순회하면서 포커스가 모달 내부에 갇히는지 확인하세요. 배경은 스크림으로 차단됩니다.
                  </div>
                  <TextField label="이메일" placeholder="name@example.com" />
                  <TextField label="메모" placeholder="내용을 입력하세요" />
                  <Stack orientation="horizontal" gap="sm" justify="end">
                    <Button variant="ghost" onClick={handleDialogClose}>
                      취소
                    </Button>
                    <Button ref={confirmRef} onClick={handleDialogClose}>
                      확인
                    </Button>
                  </Stack>
                </Stack>
              </DismissableLayer>
            </FocusTrap>
          </div>
        </Portal>
      ) : null}
    </Stack>
  );
}

export const OverlaySmoke: Story = {
  name: "메뉴·모달 스모크 조합",
  parameters: { controls: { disable: true } },
  render: () => <OverlaySmokeStory />
};
