import { type ReactNode, useMemo } from "react";
import type { ThemeOverrides } from "@ara/core";
import type { ColorThemeName } from "@ara/tokens/colors";
import {
  AraProvider,
  AraThemeBoundary,
  useAraThemeVariableTable,
  type TextDirection
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
  readonly direction?: TextDirection;
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
  onModeChange,
  direction
}: ThemeProviderProps) {
  return (
    <AraProvider theme={theme}>
      <ThemeProviderInner
        mode={mode}
        defaultMode={defaultMode}
        storageKey={storageKey}
        asChild={asChild}
        direction={direction}
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
    | "mode"
    | "defaultMode"
    | "storageKey"
    | "asChild"
    | "children"
    | "onModeChange"
    | "direction"
  > {}

function ThemeProviderInner({
  mode = "system",
  defaultMode = DEFAULT_MODE,
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
  asChild,
  children,
  onModeChange,
  direction
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
      <ResolvedThemeBoundary asChild={asChild} direction={direction}>
        {children}
      </ResolvedThemeBoundary>
    </ColorModeProvider>
  );
}

function ResolvedThemeBoundary({
  asChild,
  children,
  direction
}: Pick<ThemeProviderProps, "asChild" | "children" | "direction">) {
  const { mode } = useColorMode();

  return (
    <AraThemeBoundary mode={mode} asChild={asChild} direction={direction}>
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

    const applyVariables = (element, variables) => {
      if (!variables || !(element instanceof HTMLElement)) {
        return;
      }

      for (const [name, value] of Object.entries(variables)) {
        element.style.setProperty(name, value);
      }
    };

    const clearVariables = (element, variables) => {
      if (!variables || !(element instanceof HTMLElement)) {
        return;
      }

      for (const name of Object.keys(variables)) {
        element.style.removeProperty(name);
      }
    };

    const applyTheme = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      element.setAttribute("data-ara-theme", resolved);
      element.style.colorScheme = resolved;
      applyVariables(element, rootVariables);
      applyVariables(element, themeVariables[resolved]);
      return true;
    };

    const clearTheme = (element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      element.removeAttribute("data-ara-theme");
      element.style.colorScheme = "";
      clearVariables(element, rootVariables);
      clearVariables(element, themeVariables[resolved]);
    };

    const root = document.documentElement;
    const appliedToRoot = applyTheme(root);

    const applyToBoundary = () => {
      const boundary = script.nextElementSibling;
      if (!(boundary instanceof HTMLElement)) {
        return false;
      }

      applyTheme(boundary);
      if (appliedToRoot && boundary !== root) {
        clearTheme(root);
      }
      return true;
    };

    if (applyToBoundary()) {
      return;
    }

    const retry = () => {
      if (applyToBoundary()) {
        return;
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          applyToBoundary();
        }, { once: true });
      } else {
        applyToBoundary();
      }
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(retry);
    } else {
      setTimeout(retry, 0);
    }
  })();`;
}
