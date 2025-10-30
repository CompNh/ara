# @ara/icons

Ara 디자인 시스템에서 사용하는 SVG 아이콘을 제공하는 패키지입니다. 아이콘 정의는 순수 TypeScript 객체로 제공되며, React 등의 렌더러에서 재사용할 수 있도록 설계되었습니다.

## 설치

```bash
pnpm add @ara/icons
```

## 사용 예시

```ts
import { arrowRight } from "@ara/icons/icons/arrow-right";

console.log(arrowRight.viewBox);
```

## 빌드

```bash
pnpm --filter @ara/icons build
```
