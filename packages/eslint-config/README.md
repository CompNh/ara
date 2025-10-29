# @ara/eslint-config

Ara UI Components 모노레포에서 공통으로 사용하는 ESLint Flat 구성입니다. TypeScript와 React 규칙을 기본으로 제공하며 브라우저/Node 환경에 맞춘 프리셋을 제공합니다.

## 제공 프리셋

| 이름 | 설명 |
| --- | --- |
| `configs.base` | TypeScript/JavaScript 공통 규칙 세트. 프로젝트 전역에서 기본으로 적용합니다. |
| `configs.node` | Node.js 실행 환경(스크립트, 설정 파일 등)을 위한 확장 규칙. |
| `configs.react` | 브라우저 + React 환경을 위한 규칙. JSX 접근성(a11y) 및 Hooks 검사 포함. |
| `preset` (`default`) | `configs.react` 에 대한 별칭으로, 컴포넌트/앱 패키지에서 바로 가져다 쓸 수 있습니다. |

## 설치

```bash
pnpm add -D @ara/eslint-config
```

> 워크스페이스 루트에서 실행하면 의존성이 자동으로 연결됩니다. 이 저장소에는 오프라인 환경을 위한 스텁 패키지가 `vendor/`에 포함되어 있으므로, 실제 프로젝트에서는 반드시 공식 패키지(`eslint@^9`, `typescript@^5.5` 이상 등)를 설치해야 합니다.

## 사용 예시

### 루트(Node 전용) 구성

`eslint.config.js`

```js
import { configs } from "@ara/eslint-config";

export default configs.node;
```

### React 패키지 구성

`packages/react/eslint.config.js`

```js
import araEslint from "@ara/eslint-config";

export default araEslint;
```

### 토큰/코어 패키지 구성

TypeScript만 사용하는 패키지는 기본 프리셋을 가져온 뒤 필요에 따라 Node 또는 React 확장을 덧붙입니다.

```js
import { configs } from "@ara/eslint-config";

export default configs.base;
```

## 권장 적용 순서

1. **루트**: `configs.node` 로 설정하여 스크립트와 설정 파일을 검사합니다.
2. **공유 라이브러리(`packages/tokens`, `packages/core`)**: `configs.base` 를 적용하고, DOM이 필요한 경우에만 추가 구성을 덧붙입니다.
3. **React 바인딩(`packages/react`, `apps/*`)**: 기본값(`preset` 또는 `configs.react`)을 사용해 React/JSX 규칙을 활성화합니다.

## 무시 패턴

다음 경로는 기본적으로 검사 대상에서 제외됩니다.

- 빌드 산출물(`dist`, `storybook-static` 등)
- Next.js/.storybook/.turbo 캐시
- `node_modules`, `vendor`
- 테스트 커버리지 산출물(`coverage`)

필요시 각 패키지의 `eslint.config.js` 에서 추가 무시 경로를 정의할 수 있습니다.
