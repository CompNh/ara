# ThemeProvider

Ara 디자인 시스템의 글로벌 토큰과 CSS 변수를 React 트리 하위에 주입하는 최상위 컴포넌트입니다. `AraProvider`의 테마 컨텍스트와 `AraThemeBoundary`의 CSS 변수 경계를 하나의 API로 묶어 라이트/다크 모드 및 토큰 오버라이드를 간편하게 구성할 수 있습니다.

## 사용 방법

```tsx
import { ThemeProvider, useColorMode } from "@ara/react";

function ColorModeSwitch() {
  const { mode, setMode } = useColorMode();

  return (
    <button type="button" onClick={() => setMode(mode === "light" ? "dark" : "system")}>
      Toggle
    </button>
  );
}

function App() {
  return (
    <ThemeProvider mode="system">
      <ColorModeSwitch />
      <YourComponents />
    </ThemeProvider>
  );
}
```

- `mode`: `"light" | "dark" | "system"` 중 하나를 전달해 색상 테마를 제어합니다. 기본값은 `"system"`이며, `system` 모드에서는 `prefers-color-scheme` 미디어 쿼리를 읽어 초기 테마를 결정하고 사용자 선택(저장소 기본 키 `ara:color-mode`)을 우선합니다.
- `defaultMode`: SSR이나 `prefers-color-scheme`을 사용할 수 없는 환경에서 사용할 폴백 모드를 지정합니다. 기본값은 `"light"`입니다.
- `storageKey`: 사용자 선택을 저장할 `localStorage` 키입니다. `null` 또는 `undefined`를 전달하면 저장을 비활성화할 수 있습니다.
- `theme`: `ThemeOverrides` 구조를 전달하면 토큰 값을 동적으로 변경할 수 있으며, 변경된 값은 컨텍스트(`useAraTheme`)와 CSS 변수(`useAraThemeVariables`) 모두에 반영됩니다.
- `asChild`: `true`로 설정하면 기본 `div` 래퍼 대신 자식 요소를 그대로 사용하며, 해당 요소에 CSS 변수가 적용됩니다.
- `useColorMode`: 현재 모드(`mode`), 시스템 모드(`systemMode`), 사용자 정의 모드(`userMode`), 모드 변경 함수(`setMode`)를 제공하는 훅입니다. UI에서 토글러를 만들 때 활용할 수 있습니다.

## SSR/중첩 구성

`ThemeProvider`는 중첩 구성을 지원합니다. 하위 Provider에 전달한 오버라이드는 상위 테마 값을 기준으로 병합되며, SSR 환경에서도 문제없이 작동하도록 순수 함수형으로 구현되어 있습니다.

또한 서버 렌더링 시에는 `<script>` 태그를 통해 최초 페인트 전에 테마 CSS 변수를 주입하여 FOUC(Flash of Unstyled Content)를 방지합니다. 이 스크립트는 사용자 저장값 → 시스템 선호도 → `defaultMode` 순으로 초기 모드를 계산하며, `data-ara-theme`와 `color-scheme` 속성도 함께 설정합니다.
