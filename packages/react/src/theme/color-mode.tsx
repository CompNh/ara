import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from "react";

import type { ColorThemeName } from "@ara/tokens/colors";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
export const DEFAULT_COLOR_MODE_STORAGE_KEY = "ara:color-mode";

export type ColorMode = ColorThemeName;
export type ColorScheme = ColorMode | "system";

export interface ColorModeContextValue {
  readonly mode: ColorMode;
  readonly systemMode: ColorMode;
  readonly userMode: ColorMode | null;
  readonly source: "system" | "user" | "prop";
  readonly setMode: (mode: ColorScheme) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

function isColorMode(value: unknown): value is ColorMode {
  return value === "light" || value === "dark";
}

function readStoredMode(storageKey: string | null | undefined): ColorMode | null {
  if (!storageKey || typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    return isColorMode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredMode(storageKey: string | null | undefined, mode: ColorMode | null) {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  try {
    if (!mode) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, mode);
  } catch {
    // storage 접근이 제한된 환경에서는 무시한다.
  }
}

function getSystemMode(defaultMode: ColorMode): ColorMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return defaultMode;
  }

  try {
    return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
  } catch {
    return defaultMode;
  }
}

function subscribeSystemMode(listener: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const media = window.matchMedia(COLOR_SCHEME_QUERY);
  const handler = () => listener();

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }

  media.addListener(handler);
  return () => media.removeListener(handler);
}

function useSystemMode(defaultMode: ColorMode): ColorMode {
  return useSyncExternalStore(
    subscribeSystemMode,
    () => getSystemMode(defaultMode),
    () => defaultMode
  );
}

export interface ColorModeProviderProps {
  readonly children: ReactNode;
  readonly mode: ColorScheme;
  readonly defaultMode: ColorMode;
  readonly storageKey?: string | null;
  readonly onModeChange?: (mode: ColorMode) => void;
}

export function ColorModeProvider({
  children,
  mode,
  defaultMode,
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
  onModeChange
}: ColorModeProviderProps) {
  const normalizedMode: ColorScheme = mode ?? "system";

  const [userMode, setUserMode] = useState<ColorMode | null>(() => {
    if (normalizedMode === "system") {
      return readStoredMode(storageKey);
    }

    return normalizedMode;
  });

  const systemMode = useSystemMode(defaultMode);

  useEffect(() => {
    if (normalizedMode === "system") {
      setUserMode(readStoredMode(storageKey));
      return;
    }

    setUserMode(normalizedMode);
  }, [normalizedMode, storageKey]);

  useEffect(() => {
    if (normalizedMode !== "system") {
      return;
    }

    if (!storageKey || typeof window === "undefined") {
      return;
    }

    const handler = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      setUserMode(isColorMode(event.newValue) ? (event.newValue as ColorMode) : null);
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [normalizedMode, storageKey]);

  const resolvedMode: ColorMode = useMemo(() => {
    if (normalizedMode === "system") {
      return userMode ?? systemMode;
    }

    return normalizedMode;
  }, [normalizedMode, systemMode, userMode]);

  useEffect(() => {
    onModeChange?.(resolvedMode);
  }, [resolvedMode, onModeChange]);

  const setMode = useCallback(
    (next: ColorScheme) => {
      if (next === "system") {
        setUserMode(null);
        writeStoredMode(storageKey, null);
        return;
      }

      setUserMode(next);
      writeStoredMode(storageKey, next);
    },
    [storageKey]
  );

  useEffect(() => {
    if (normalizedMode !== "system") {
      return;
    }

    writeStoredMode(storageKey, userMode);
  }, [normalizedMode, storageKey, userMode]);

  const source: ColorModeContextValue["source"] = useMemo(() => {
    if (normalizedMode !== "system") {
      return "prop";
    }

    return userMode ? "user" : "system";
  }, [normalizedMode, userMode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode: resolvedMode,
      systemMode,
      userMode,
      source,
      setMode
    }),
    [resolvedMode, setMode, source, systemMode, userMode]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode는 ThemeProvider 내부에서만 사용할 수 있습니다.");
  }

  return context;
}
