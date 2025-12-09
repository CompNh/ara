# @ara/core

Ara 디자인 시스템의 headless 코어 패키지입니다. 디자인 토큰과 상태 유틸리티를 묶어 UI 레이어와 분리된 비즈니스 로직을 제공합니다.

## 설치

```sh
pnpm add @ara/core
```

## 사용법

기본 테마를 생성하고 필요한 토큰만 부분적으로 오버라이드할 수 있습니다.

```ts
import { createTheme } from "@ara/core";

const theme = createTheme({
  color: {
    brand: {
      500: "#1E40AF"
    }
  }
});
```

테마 객체는 `@ara/tokens`이 제공하는 기본 토큰을 기반으로 하며, React 등의 바인딩 레이어에서 그대로 사용할 수 있습니다.

### 유틸리티 훅

- `useTypeahead`: 키보드로 빠르게 입력된 문자열을 버퍼링해 일치하는 항목을 찾아주는 훅입니다. 기본 타임아웃은 700ms이며, 영문 기준 접두 검색만 지원하고 한글 초성 매칭은 제공하지 않습니다.

## Testing

- ✅ pnpm --filter @ara/core build
- ✅ pnpm --filter @ara/core test
- ✅ pnpm run check:manifests
