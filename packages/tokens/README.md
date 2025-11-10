# @ara/tokens

Ara 디자인 시스템 전반에서 사용하는 색상·레이아웃·타이포그래피 토큰을 제공하는 패키지다. React/웹 앱뿐 아니라 디자인 자동화 스크립트에서도 재사용할 수 있도록 TypeScript API와 JSON 산출물을 동시에 노출한다.

## 토큰 명명 규칙과 계약

### 범주와 접두사
- **패키지 토큰 키는 모두 `camelCase`**로 작성하며, 범주별 네임스페이스를 유지한다.
  - 색상: `color.<역할>.<단계>` (예: `color.brand.500`)
  - 타이포그래피: `typography.<속성>.<스케일>` (예: `typography.fontSize.md`)
  - 레이아웃: `layout.<속성>.<스케일>` (예: `layout.space.md`, `layout.radius.lg`)
- **CSS 변수는 `--ara-<카테고리>-<키>`** 구조로 매핑한다. 예: `color.brand.500` → `--ara-color-brand-500`.
- 토큰에서 파생되는 유틸리티 함수/타입 또한 `@ara/tokens` 네임스페이스 안에서 동일한 접두사를 따른다.

### 스케일 정의 원칙
- 색상 스케일은 **역할(role) → 단계(step)** 2단 구조로 고정하며, 단계는 50~950 범위의 백단위(예: 50, 100, …, 900)만 사용한다.
- 타이포그래피 스케일은 `sm`, `md`, `lg`, `xl`, `2xl` 등 **일관된 문자 스케일 라벨**을 사용하고, `fontSize`, `lineHeight`, `fontWeight` 등 속성별 서브키를 둔다.
- 레이아웃 스케일은 `space`, `radius`, `elevation`, `zIndex` 등 핵심 속성을 제공하며 숫자 스케일(`4`, `8`, `12` 등) 또는 sm/md/lg 라벨을 상황에 맞게 고정한다.
- 스케일 값은 디자인 시안과 1:1 매칭되며, 동일 스케일 명칭이 다른 범주에서 충돌하지 않도록 한다.

### 버전 정책과 변경 관리
- 본 문서가 병합되는 시점을 **Tokens v1 계약의 기준점**으로 삼는다.
- v1 이후에는 다음 변경이 발생하면 **무조건 Major 릴리스**로 간주한다.
  - 토큰 키/네임스페이스 변경, 기존 키 삭제, 의미(semantic)의 재정의.
  - CSS 변수 접두사 또는 네이밍 체계 변경.
- Minor/Patch 범위에서 허용되는 변경은 새로운 토큰 키 추가 또는 설명 문서 보완 정도로 제한한다.
- Breaking 변경이 필요하면 사전에 이슈를 등록하고 논의 후 진행한다.

## 설치

모노레포 내에서는 pnpm 워크스페이스에 이미 포함되어 있으므로 별도 설치가 필요 없다.

## 사용 방법

### TypeScript/JavaScript

```ts
import { colors, layout, typography, tokens, getColor, getLayoutValue } from "@ara/tokens";

const primary = getColor("brand", "500");
const bodyFontSize = typography.fontSize.md;
const buttonPadding = getLayoutValue("space", "md");
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

JSON 구조는 `color`, `layout`, `typography`, `component` 네 최상위 키로 구성되어 있으며 TypeScript API와 동일한 값을 제공한다.

## 개발 스크립트

- `pnpm --filter @ara/tokens build` : `dist/` 디렉터리에 ESM 번들과 선언 파일을 생성한다.
- `pnpm exec eslint packages/tokens` : 토큰 모듈에 대한 린트 검사를 실행한다.

## 빌드 산출물

- `package.json` 의 `exports` 는 기본 엔트리(`.`) 외에 `./colors`, `./layout`, `./typography`, `./tokens.json`, `./package.json` 경로를 고정적으로 노출한다.
- 모든 엔트리는 `types` + `import(default)` 페어를 제공하므로 ESM 번들러와 TypeScript가 동일한 모듈 해상 결과를 갖는다.
- `typesVersions` 는 `dist/*.d.ts` 파일과 서브패스를 직접 연결해, 오래된 TypeScript 모듈 해상 모드에서도 선언 파일을 안정적으로 찾을 수 있도록 한다.

## Testing

- ✅ pnpm --filter @ara/tokens build
- ✅ pnpm --filter @ara/tokens test
- ✅ pnpm run check:manifests
