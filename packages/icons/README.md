# @ara/icons

Ara 디자인 시스템에서 사용하는 SVG 아이콘을 React 컴포넌트로 제공하는 패키지입니다. 각 아이콘은 `title` 프롭을 받아 필요한 경우 `role="img"` 로 렌더링되며, 기본적으로 `currentColor` 를 상속합니다.

## 계약(Contract)

아래 규칙은 v0 범위 내에서 **동결**되며, 이후 변경은 Major 릴리스에서만 가능합니다.

- **파일/심볼 명명**: 파일명과 심볼명은 모두 파스칼케이스(PascalCase)로 통일합니다. 예) `Plus`, `ArrowRight`. 파일 경로는 케밥 케이스를 사용합니다. 예) `icons/arrow-right.ts`에서 `ArrowRight` 심볼을 export.
- **카테고리**: 용도별 카테고리를 토픽 접두사로 구분합니다. 예) 화살표류 `Arrow`, 동작류 `Action`, 상태/피드백 `Status`. 카테고리는 네이밍의 논리적 그룹으로만 사용하며, 경로 구조는 평면(flat)으로 유지합니다.
- **사이즈 스케일**: 기본 뷰박스는 `24x24`를 표준으로 하며, 소비 레이어(@ara/react/icon)에서 `sm`/`md`/`lg` 스케일을 제공할 때 이 뷰박스를 기준으로 스케일링합니다. SVG 자체는 스케일 불변(viewBox 기반) 상태를 유지합니다.
- **톤/색상**: 기본 색상은 `currentColor` 상속을 원칙으로 합니다. 명시적 색상 토큰을 받을 경우에도 `currentColor` 우선 정책을 유지하며, React 래퍼에서 tone 변환을 적용할 때를 제외하고 원본 SVG는 채색 값을 포함하지 않습니다.
- **스트로크/필 규칙**: 가능한 한 `fill="currentColor"`를 사용해 단색 스타일을 우선합니다. stroke 기반 아이콘은 `stroke="currentColor"` + `strokeWidth` 기본값(2)을 권장하며, 루트 `<svg>`의 `fill="none"` 설정을 통해 stroke-only 스타일을 보장합니다.
- **대체 텍스트**: 아이콘 데이터 객체에는 접근성 텍스트를 포함하지 않습니다. 실제 접근성 처리는 소비 레이어(React Icon 컴포넌트)에서 `title` 또는 `aria-label`을 전달하는 방식으로 수행합니다.

## SVG 최적화 (SVGO)

- 설정 파일: [`svgo.config.mjs`](./svgo.config.mjs)
- precision: `3`(floatPrecision), `multipass: true` 로 고정합니다.
- `preset-default`에서 `removeViewBox: false`를 오버라이드하여 뷰박스를 유지하고, `cleanupAttrs`·`mergePaths`를 활성화해 불필요한 속성을 정리하고 path를 병합합니다.
- 라이선스 주석을 보존하기 위해 `preserveLicense` 플러그인을 함께 사용합니다.
- 실행 예시: 원본 SVG 폴더를 덮어쓸 때 `pnpm --filter @ara/icons svgo -- --input ./svgs --output ./svgs` (입력·출력 경로를 상황에 맞게 교체)를 사용합니다. 최적화 전후 시각 차이를 확인해야 하는 경우, 출력 폴더를 따로 지정한 뒤 뷰어에서 두 파일을 비교하거나 `git diff`로 path 병합/precision 변화를 확인합니다.

## 설치

```bash
pnpm add @ara/icons
```

## 사용 예시

```ts
import { ArrowRight } from "@ara/icons"; // 집합 엔트리포인트
import { Plus } from "@ara/icons/Plus"; // 개별 엔트리포인트

console.log(<ArrowRight title="이동" />);
console.log(<Plus title="추가" />);
```

## 아이콘 생성기

- 원본 SVG는 `packages/icons/svgs` 폴더에 저장하고, 변환된 TSX 파일은 `packages/icons/src/icons` 에 생성됩니다.
- 변환은 루트에서 `pnpm gen:icons` 로 실행합니다. 새 SVG를 추가하거나 기존 아이콘을 수정한 뒤 스크립트를 돌리면 개별 파일과 인덱스가 자동으로 갱신됩니다.
- 변경 사항만 확인하고 싶다면 `pnpm gen:icons -- --diff` 로 실행하여 생성 결과와 기존 파일의 차이를 확인할 수 있습니다.

## 빌드

```bash
pnpm --filter @ara/icons build
```
