import { type ReactNode, useMemo } from "react";
import type { ThemeOverrides } from "@ara/core";
import type { ColorThemeName } from "@ara/tokens/colors";
import {
  AraProvider,
  AraThemeBoundary,
  useAraThemeVariableTable
} from "./AraProvider.js";
import {
  ColorModeProvider,
  DEFAULT_COLOR_MODE_STORAGE_KEY,
  useColorMode,
  type ColorScheme
} from "./color-mode.js";
import type { ThemeCSSVariableTable } from "@ara/tokens/css-vars";

export interface ThemeProviderProps {
  readonly theme?: ThemeOverrides;
  readonly mode?: ColorScheme;
  readonly defaultMode?: ColorThemeName;
  readonly storageKey?: string | null;
  readonly asChild?: boolean;
  readonly children: ReactNode;
  readonly onModeChange?: (mode: ColorThemeName) => void;
}

const DEFAULT_MODE: ColorThemeName = "light";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({
  theme,
  mode = "system",
  defaultMode = DEFAULT_MODE,
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
  asChild = false,
  children,
  onModeChange
}: ThemeProviderProps) {
  return (
    <AraProvider theme={theme}>
      <ThemeProviderInner
        mode={mode}
        defaultMode={defaultMode}
        storageKey={storageKey}
        asChild={asChild}
        onModeChange={onModeChange}
      >
        {children}
      </ThemeProviderInner>
    </AraProvider>
  );
}

ThemeProvider.displayName = "ThemeProvider";

interface ThemeProviderInnerProps
  extends Pick<
    ThemeProviderProps,
    "mode" | "defaultMode" | "storageKey" | "asChild" | "children" | "onModeChange"
  > {}

function ThemeProviderInner({
  mode = "system",
  defaultMode = DEFAULT_MODE,
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
  asChild,
  children,
  onModeChange
}: ThemeProviderInnerProps) {
  const table = useAraThemeVariableTable();

  return (
    <ColorModeProvider
      mode={mode}
      defaultMode={defaultMode}
      storageKey={storageKey}
      onModeChange={onModeChange}
    >
      <ThemeBootstrapScript
        mode={mode}
        defaultMode={defaultMode}
        storageKey={storageKey}
        table={table}
      />
      <ResolvedThemeBoundary asChild={asChild}>{children}</ResolvedThemeBoundary>
    </ColorModeProvider>
  );
}

function ResolvedThemeBoundary({
  asChild,
  children
}: Pick<ThemeProviderProps, "asChild" | "children">) {
  const { mode } = useColorMode();

  return (
    <AraThemeBoundary mode={mode} asChild={asChild}>
      {children}
    </AraThemeBoundary>
  );
}

interface ThemeBootstrapScriptProps {
  readonly mode: ColorScheme;
  readonly defaultMode: ColorThemeName;
  readonly storageKey?: string | null;
  readonly table: ThemeCSSVariableTable;
}

function ThemeBootstrapScript({
  mode,
  defaultMode,
  storageKey,
  table
}: ThemeBootstrapScriptProps) {
  const data = useMemo(() => ({
    mode,
    defaultMode,
    storageKey: storageKey ?? null,
    variables: {
      root: table.root,
      themes: table.themes
    }
  }), [defaultMode, mode, storageKey, table]);

  const script = useMemo(() => createBootstrapScript(data), [data]);

  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />;
}

interface BootstrapData {
  readonly mode: ColorScheme;
  readonly defaultMode: ColorThemeName;
  readonly storageKey: string | null;
  readonly variables: ThemeCSSVariableTable;
}

function createBootstrapScript(data: BootstrapData): string {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003C");

  return `(() => {
    const data = ${serialized};
    const script = document.currentScript;
    if (!script) {
      return;
    }

    const target = script.nextElementSibling;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const parse = (value) => (value === "light" || value === "dark" ? value : null);
    const rootVariables = data.variables.root ?? {};
    const themeVariables = data.variables.themes ?? {};

    let resolved = data.mode === "system" ? null : data.mode;

    if (!resolved && data.storageKey) {
      try {
        resolved = parse(window.localStorage.getItem(data.storageKey));
      } catch {
        resolved = null;
      }
    }

    if (!resolved) {
      try {
        const media = typeof window.matchMedia === "function"
          ? window.matchMedia("${COLOR_SCHEME_QUERY}")
          : null;
        if (media && typeof media.matches === "boolean") {
          resolved = media.matches ? "dark" : "light";
        }
      } catch {
        resolved = null;
      }
    }

    if (resolved !== "light" && resolved !== "dark") {
      resolved = data.defaultMode;
    }

    const apply = (variables) => {
      if (!variables) {
        return;
      }

      for (const [name, value] of Object.entries(variables)) {
        target.style.setProperty(name, value);
      }
    };

    target.setAttribute("data-ara-theme", resolved);
    target.style.colorScheme = resolved;

    apply(rootVariables);
    apply(themeVariables[resolved]);
  })();`;
}
