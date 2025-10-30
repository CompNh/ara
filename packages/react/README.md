# @ara/react

Ara 디자인 시스템의 React 컴포넌트 레이어다. `@ara/core`의 테마 로직을 React 컨텍스트로 노출하고, 토큰 기반 UI 컴포넌트를 제공한다.

## 설치

```bash
pnpm add @ara/react
```

`react`와 `react-dom`은 피어 의존성이므로 소비자 애플리케이션에서 함께 설치해야 한다.

## 사용 예시

```tsx
import { AraProvider, Button } from "@ara/react";

function App() {
  return (
    <AraProvider>
      <Button>확인</Button>
    </AraProvider>
  );
}
```

테마 토큰을 덮어쓰려면 `AraProvider`의 `theme` 속성에 `ThemeOverrides`를 전달한다.

```tsx
<AraProvider theme={{ color: { brand: { "500": "#FF6B00" } } }}>
  <Button>주의</Button>
</AraProvider>
```

## 개발 스크립트

- `pnpm build` : 타입 선언과 번들 산출물을 생성한다.
- `pnpm test` : Vitest + Testing Library를 사용해 단위 테스트를 실행한다.
- `pnpm storybook -- --smoke-test` : Storybook 구성을 CI 모드로 기동해 기본 스토리가 동작하는지 확인한다.

## Testing

- ✅ pnpm --filter @ara/react build 
- ✅ pnpm --filter @ara/react test 
- ✅ pnpm --filter @ara/react storybook 
- ✅ pnpm run check:manifests 
