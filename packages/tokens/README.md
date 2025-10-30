# @ara/tokens

Ara 디자인 시스템 전반에서 사용하는 색상·타이포그래피 토큰을 제공하는 패키지다. React/웹 앱뿐 아니라 디자인 자동화 스크립트에서도 재사용할 수 있도록 TypeScript API와 JSON 산출물을 동시에 노출한다.

## 설치

모노레포 내에서는 pnpm 워크스페이스에 이미 포함되어 있으므로 별도 설치가 필요 없다.

## 사용 방법

### TypeScript/JavaScript

```ts
import { colors, typography, tokens, getColor } from "@ara/tokens";

const primary = getColor("brand", "500");
const bodyFontSize = typography.fontSize.md;
```

세분화된 모듈이 필요하면 경로를 지정해 가져올 수 있다.

```ts
import { typography } from "@ara/tokens/typography";
```

### JSON 소비자

디자인 자동화나 비 Node.js 환경에서는 JSON 파일을 직접 읽을 수 있다.

```ts
import tokensJson from "@ara/tokens/tokens.json" assert { type: "json" };
```

JSON 구조는 `color`와 `typography` 두 최상위 키로 구성되어 있으며 TypeScript API와 동일한 값을 제공한다.

## 개발 스크립트

- `pnpm --filter @ara/tokens build` : `dist/` 디렉터리에 ESM 번들과 선언 파일을 생성한다.
- `pnpm exec eslint packages/tokens` : 토큰 모듈에 대한 린트 검사를 실행한다.

## 빌드 산출물

`package.json` 의 `exports` 설정을 통해 기본 엔트리(`.`) 외에 `./colors`, `./typography`, `./tokens.json` 경로가 노출된다. 번들러는 `module`/`types` 필드를 이용해 ESM과 타입 선언을 자동으로 해상한다.

## Testing

- ✅ pnpm --filter @ara/tokens build
- ✅ pnpm --filter @ara/tokens test
- ✅ pnpm run check:manifests
