# ThemeProvider

Ara 디자인 시스템의 글로벌 토큰과 CSS 변수를 React 트리 하위에 주입하는 최상위 컴포넌트입니다. `AraProvider`의 테마 컨텍스트와 `AraThemeBoundary`의 CSS 변수 경계를 하나의 API로 묶어 라이트/다크 모드 및 토큰 오버라이드를 간편하게 구성할 수 있습니다.

## 사용 방법

```tsx
import { ThemeProvider } from "@ara/react";

function App() {
  return (
    <ThemeProvider mode="dark">
      <YourComponents />
    </ThemeProvider>
  );
}
```

- `mode`: `"light" | "dark"` 중 하나를 전달하면 해당 테마에 매핑된 CSS 변수가 `data-ara-theme`와 함께 주입됩니다. 기본값은 `"light"`입니다.
- `theme`: `ThemeOverrides` 구조를 전달하면 토큰 값을 동적으로 변경할 수 있으며, 변경된 값은 컨텍스트(`useAraTheme`)와 CSS 변수(`useAraThemeVariables`) 모두에 반영됩니다.
- `asChild`: `true`로 설정하면 기본 `div` 래퍼 대신 자식 요소를 그대로 사용하며, 해당 요소에 CSS 변수가 적용됩니다.

## SSR/중첩 구성

`ThemeProvider`는 중첩 구성을 지원합니다. 하위 Provider에 전달한 오버라이드는 상위 테마 값을 기준으로 병합되며, SSR 환경에서도 문제없이 작동하도록 순수 함수형으로 구현되어 있습니다.
