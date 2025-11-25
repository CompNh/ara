import { Fragment, useMemo, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ThemeOverrides } from "@ara/core";
import {
  Button,
  ThemeProvider,
  useAraThemeVariables,
  useColorMode
} from "@ara/react";
import { colors, layout, typography } from "@ara/tokens";

type ThemeProviderComponent = typeof ThemeProvider;

const meta = {
  title: "Foundation/ThemeProvider",
  component: ThemeProvider,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    mode: "system" as const,
    defaultMode: "light" as const,
    storageKey: null,
    asChild: false,
    children: undefined
  },
  argTypes: {
    mode: {
      control: { type: "inline-radio" },
      options: ["system", "light", "dark"]
    },
    defaultMode: {
      control: { type: "inline-radio" },
      options: ["light", "dark"]
    },
    storageKey: {
      control: { type: "text" },
      description: "로컬 스토리지 키(null 이면 저장하지 않음)"
    },
    theme: {
      control: { type: "object" }
    },
    asChild: {
      control: { type: "boolean" }
    },
    direction: {
      control: { type: "inline-radio" },
      options: ["ltr", "rtl", "auto"],
      description: "텍스트 방향"
    },
    onModeChange: {
      action: "modeChange"
    },
    children: {
      control: false
    }
  },
  tags: ["autodocs"]
} satisfies Meta<ThemeProviderComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

function ThemePlayground() {
  const { mode, source } = useColorMode();
  const variables = useAraThemeVariables(mode);
  const subtleText = `var(--ara-color-role-${mode}-text-secondary)`;
  const borderColor = `var(--ara-color-role-${mode}-border-default)`;
  const elevated = `var(--ara-color-role-${mode}-surface-elevated)`;
  const surface = `var(--ara-color-role-${mode}-surface-surface)`;
  const accentBg = `var(--ara-color-role-${mode}-interactive-primary-default-bg)`;
  const accentFg = `var(--ara-color-role-${mode}-interactive-primary-default-fg)`;

  const sampleVariables = useMemo(
    () => {
      const keys = [
        `--ara-color-role-${mode}-surface-canvas`,
        `--ara-color-role-${mode}-text-primary`,
        `--ara-color-role-${mode}-interactive-primary-default-bg`,
        "--ara-space-md",
        "--ara-radius-lg"
      ] as const;

      return keys
        .map((key) => ({
          name: key,
          value: variables[key]
        }))
        .filter((entry) => Boolean(entry.value)) as { name: (typeof keys)[number]; value: string }[];
    },
    [mode, variables]
  );

  const sourceLabel = useMemo(() => {
    switch (source) {
      case "prop":
        return "props";
      case "user":
        return "사용자 선택";
      default:
        return "시스템";
    }
  }, [source]);

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "var(--ara-space-xl)",
        background: surface,
        color: `var(--ara-color-role-${mode}-text-primary)`,
        display: "flex",
        flexDirection: "column",
        gap: "var(--ara-space-xl)",
        fontFamily: "var(--ara-font-family-sans)"
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--ara-space-xs)"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize["3xl"],
            lineHeight: typography.lineHeight.tight
          }}
        >
          ThemeProvider 플레이그라운드
        </h1>
        <p style={{ margin: 0, color: subtleText }}>
          현재 모드: <strong>{mode}</strong> · 결정 출처: {sourceLabel}
        </p>
        <p style={{ margin: 0, color: subtleText }}>
          우측 상단 툴바 또는 <code>useColorMode</code> 훅으로 모드를 제어할 수 있습니다.
        </p>
      </header>

      <section
        style={{
          background: elevated,
          borderRadius: "var(--ara-radius-lg)",
          padding: "var(--ara-space-lg)",
          boxShadow: "var(--ara-elevation-md)",
          border: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          gap: "var(--ara-space-md)"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            lineHeight: typography.lineHeight.tight
          }}
        >
          버튼 토큰 미리보기
        </h2>
        <p style={{ margin: 0, color: subtleText }}>
          <code>tokens.component.button</code> 값이 CSS 변수로 주입되어 variant/tone/size 조합을 정의합니다.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--ara-space-sm)"
          }}
        >
          <Button tone="primary">Primary</Button>
          <Button tone="neutral">Neutral</Button>
          <Button tone="danger">Danger</Button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "var(--ara-space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
        }}
      >
        <InfoTile
          title="타이포그래피"
          description="폰트 패밀리, 크기, 행간, 자간 토큰이 CSS 변수(--ara-font-* / --ara-line-height-*)로 변환됩니다."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <span style={{ fontSize: typography.fontSize.xl, lineHeight: typography.lineHeight.tight }}>Aa Headline</span>
            <span
              style={{
                fontSize: typography.fontSize.md,
                lineHeight: typography.lineHeight.normal,
                color: subtleText
              }}
            >
              body · {typography.fontSize.md}
            </span>
          </div>
        </InfoTile>
        <InfoTile
          title="레이아웃"
          description="간격/반지름/섀도우 스케일은 --ara-space-*, --ara-radius-*, --ara-elevation-* 변수로 노출됩니다."
        >
          <div style={{ display: "flex", gap: "var(--ara-space-sm)", alignItems: "center" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "var(--ara-radius-lg)",
                background: accentBg,
                color: accentFg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600
              }}
            >
              lg
            </div>
            <div style={{ color: subtleText }}>
              gap: {layout.space.lg}
              <br /> radius: {layout.radius.lg}
            </div>
          </div>
        </InfoTile>
        <InfoTile
          title="CSS 변수"
          description="ThemeProvider는 mode에 맞춰 data-ara-theme와 CSS 변수를 동기화합니다."
        >
          <dl
            style={{
              margin: 0,
              display: "grid",
              gap: "0.375rem"
            }}
          >
            {sampleVariables.map(({ name, value }) => (
              <Fragment key={name}>
                <dt style={{ fontWeight: 600 }}>{name}</dt>
                <dd style={{ margin: 0, color: subtleText }}>{value}</dd>
              </Fragment>
            ))}
          </dl>
        </InfoTile>
      </section>

      <footer style={{ color: subtleText }}>
        ThemeProvider는 <code>storageKey</code>가 null이면 로컬 스토리지에 아무것도 기록하지 않아 스토리북처럼 일회성 미리보기에 적합합니다.
      </footer>
    </div>
  );
}

function InfoTile({
  title,
  description,
  children
}: {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}) {
  const { mode } = useColorMode();
  const elevated = `var(--ara-color-role-${mode}-surface-elevated)`;
  const borderColor = `var(--ara-color-role-${mode}-border-subtle)`;
  const subtleText = `var(--ara-color-role-${mode}-text-secondary)`;

  return (
    <div
      style={{
        borderRadius: "var(--ara-radius-lg)",
        padding: "var(--ara-space-lg)",
        background: elevated,
        border: `1px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        gap: "var(--ara-space-sm)",
        boxShadow: "var(--ara-elevation-sm)"
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: typography.fontSize.lg,
          lineHeight: typography.lineHeight.tight
        }}
      >
        {title}
      </h3>
      <p style={{ margin: 0, color: subtleText }}>{description}</p>
      {children}
    </div>
  );
}

function getReadableText(hex: string): string {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return "#0F172A";
  }

  const r = Number.parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(sanitized.slice(4, 6), 16) / 255;

    const [lr, lg, lb] = [r, g, b].map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    ) as [number, number, number];
  const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  return luminance > 0.6 ? "#0F172A" : "#F8FAFC";
}

function ColorPalettePreview() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--ara-space-xl)",
        fontFamily: "var(--ara-font-family-sans)"
      }}
    >
      {Object.entries(colors.palette).map(([ramp, shades]) => (
        <section key={ramp} style={{ display: "flex", flexDirection: "column", gap: "var(--ara-space-sm)" }}>
          <h3 style={{ margin: 0, textTransform: "capitalize" }}>palette.{ramp}</h3>
          <div
            style={{
              display: "grid",
              gap: "var(--ara-space-sm)",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))"
            }}
          >
            {Object.entries(shades).map(([shade, value]) => (
              <div
                key={shade}
                style={{
                  borderRadius: "var(--ara-radius-md)",
                  overflow: "hidden",
                  boxShadow: "var(--ara-elevation-xs)"
                }}
              >
                <div
                  style={{
                    background: value,
                    color: getReadableText(value),
                    padding: "var(--ara-space-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    fontWeight: 600
                  }}
                >
                  <span>{shade}</span>
                  <code style={{ fontWeight: 400 }}>{value}</code>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TypographyPreview() {
  const { mode } = useColorMode();
  const subtleText = `var(--ara-color-role-${mode}-text-secondary)`;

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--ara-space-md)",
        fontFamily: "var(--ara-font-family-sans)"
      }}
    >
      {Object.entries(typography.fontSize).map(([token, value]) => (
        <div key={token} style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <span style={{ fontSize: value, lineHeight: typography.lineHeight.normal }}>
            Aa {token}
          </span>
          <span style={{ color: subtleText }}>
            fontSize.{token} · {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function LayoutPreview() {
  const { mode } = useColorMode();
  const accentBg = `var(--ara-color-role-${mode}-interactive-primary-default-bg)`;
  const accentFg = `var(--ara-color-role-${mode}-interactive-primary-default-fg)`;
  const subtleText = `var(--ara-color-role-${mode}-text-secondary)`;
  const elevated = `var(--ara-color-role-${mode}-surface-elevated)`;
  const borderColor = `var(--ara-color-role-${mode}-border-subtle)`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--ara-space-xl)",
        fontFamily: "var(--ara-font-family-sans)"
      }}
    >
      <section style={{ display: "grid", gap: "var(--ara-space-sm)" }}>
        <h3 style={{ margin: 0 }}>space</h3>
        {Object.entries(layout.space).map(([token, value]) => (
          <div
            key={token}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--ara-space-md)"
            }}
          >
            <code style={{ minWidth: "5rem" }}>space.{token}</code>
            <div
              style={{
                flexShrink: 0,
                width: value,
                height: "0.5rem",
                borderRadius: "999px",
                background: accentBg
              }}
            />
            <span style={{ color: subtleText }}>{value}</span>
          </div>
        ))}
      </section>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--ara-space-sm)" }}>
        <h3 style={{ margin: 0 }}>radius</h3>
        <div
          style={{
            display: "grid",
            gap: "var(--ara-space-sm)",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {Object.entries(layout.radius).map(([token, value]) => (
            <div
              key={token}
              style={{
                borderRadius: "var(--ara-radius-md)",
                background: elevated,
                border: `1px solid ${borderColor}`,
                padding: "var(--ara-space-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--ara-space-xs)",
                alignItems: "center",
                boxShadow: "var(--ara-elevation-xs)"
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "3rem",
                  borderRadius: value,
                  background: accentBg,
                  color: accentFg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600
                }}
              >
                {token}
              </div>
              <span style={{ color: subtleText }}>{value}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ display: "grid", gap: "var(--ara-space-sm)" }}>
        <h3 style={{ margin: 0 }}>elevation</h3>
        <div
          style={{
            display: "grid",
            gap: "var(--ara-space-sm)",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
          }}
        >
          {Object.entries(layout.elevation).map(([token, value]) => (
            <div
              key={token}
              style={{
                borderRadius: "var(--ara-radius-md)",
                background: elevated,
                border: `1px solid ${borderColor}`,
                padding: "var(--ara-space-md)",
                boxShadow: value,
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem"
              }}
            >
              <strong>elevation.{token}</strong>
              <span style={{ color: subtleText }}>{value}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ display: "grid", gap: "var(--ara-space-xs)" }}>
        <h3 style={{ margin: 0 }}>zIndex</h3>
        {Object.entries(layout.zIndex).map(([token, value]) => (
          <div key={token} style={{ color: subtleText }}>
            <code>zIndex.{token}</code> = {value}
          </div>
        ))}
      </section>
    </div>
  );
}

const midnightTheme: ThemeOverrides = {
  color: {
    role: {
      dark: {
        surface: {
          canvas: "#050816",
          surface: "#0B1120",
          elevated: "#131C2F",
          overlay: "#1E2A44",
          inverse: "#F8FAFC"
        },
        text: {
          primary: "#E2E8F0",
          secondary: "#94A3B8",
          tertiary: "#64748B",
          inverse: "#0F172A",
          link: "#7DD3FC"
        }
      }
    }
  },
  layout: {
    radius: {
      lg: "1.5rem"
    }
  },
  typography: {
    fontFamily: {
      sans: "'Spoqa Han Sans Neo', 'Pretendard Variable', sans-serif"
    }
  },
  component: {
    button: {
      radius: "999px",
      focus: {
        ringSize: "6px",
        ringColor: "rgba(129, 140, 248, 0.45)"
      }
    }
  }
};

export const Playground: Story = {
  args: { ...meta.args },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePlayground />
    </ThemeProvider>
  )
};

export const ColorPalette: Story = {
  args: { ...meta.args },
  render: (args) => (
    <ThemeProvider {...args}>
      <ColorPalettePreview />
    </ThemeProvider>
  ),
  parameters: {
    controls: {
      exclude: ["children", "theme", "storageKey", "asChild", "direction", "onModeChange"]
    }
  }
};

export const TypographyScale: Story = {
  args: { ...meta.args },
  render: (args) => (
    <ThemeProvider {...args}>
      <TypographyPreview />
    </ThemeProvider>
  ),
  parameters: {
    controls: {
      exclude: ["children", "theme", "storageKey", "asChild", "direction", "onModeChange"]
    }
  }
};

export const LayoutTokens: Story = {
  args: { ...meta.args },
  render: (args) => (
    <ThemeProvider {...args}>
      <LayoutPreview />
    </ThemeProvider>
  ),
  parameters: {
    controls: {
      exclude: ["children", "theme", "storageKey", "asChild", "direction", "onModeChange"]
    }
  }
};

export const CustomTheme: Story = {
  args: {
    ...meta.args,
    mode: "dark",
    defaultMode: "dark",
    storageKey: null,
    theme: midnightTheme
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePlayground />
    </ThemeProvider>
  )
};
