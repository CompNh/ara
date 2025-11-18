# Icon

`Icon` 컴포넌트는 `@ara/icons`에서 생성된 개별 SVG 아이콘을 토큰 기반 크기·색상 규칙에 맞춰 출력한다.

## Props

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **icon** | `ComponentType<IconProps>` | (필수) | `@ara/icons`에서 export된 아이콘 컴포넌트. |
| **size** | `"sm" \| "md" \| "lg" \| string \| number` | `"md"` | 토큰 스케일 또는 임의 CSS/픽셀 크기. |
| **tone** | `"primary" \| "neutral" \| "danger" \| null` | `null` | 지정 시 토큰 색상을 `currentColor` 로 주입한다. |
| **strokeWidth** | `number` | `tokens.component.icon.strokeWidth.default` | 스트로크 기반 아이콘의 두께를 덮어쓴다. |
| **filled** | `boolean` | `false` | `fill` 이 비어 있거나 `none` 인 노드에 `currentColor` 를 적용한다. |
| **className** | `string` | — | 기본 클래스(`ara-icon`)와 병합된다. |
| **기타** | `@ara/icons` `IconProps` | — | `title`, `aria-*`, `data-*` 등 SVG 속성을 그대로 전달한다. |

## 사용 예시

```tsx
import { Icon } from "@ara/react";
import { ArrowRight } from "@ara/icons/icons/arrow-right";

function Example() {
  return <Icon icon={ArrowRight} size="sm" tone="primary" aria-label="다음" />;
}
```

## Tokens 매핑

아이콘 크기·색상은 `ThemeProvider` 로 전달되는 아이콘 토큰(`tokens.component.icon`)과 매핑된다.

| 항목 | 토큰 키 | 값 예시 | 설명 |
| --- | --- | --- | --- |
| **size** | `sm` \| `md` \| `lg` | `1rem` · `1.25rem` · `1.5rem` | 크기를 토큰 스케일에 맞춰 설정한다. 커스텀 문자열/숫자를 전달하면 그대로 사용한다. |
| **tone** | `primary` \| `neutral` \| `danger` | 브랜드·중립·위험 계열 색상 | `color` 프롭이 비어 있을 때 `currentColor` 로 주입할 색상을 토큰에서 가져온다. |
| **strokeWidth** | `default` | `2` | 스트로크 기반 아이콘의 두께 기본값. |

- 색상 우선순위: `color` 프롭 → `style.color` → `tone` 토큰 → 상위 `currentColor` 상속.
- 크기 우선순위: `size` 프롭이 토큰 키면 토큰 값을, 문자열/숫자면 그대로 사용한다. 프롭이 없으면 `md` 토큰 값을 사용한다.
- `ThemeProvider` 로 전달한 토큰이 기본 토큰보다 우선한다. 토큰을 커스터마이즈하면 위 우선순위 내에서 적용된다.

## 접근성

- 제목(`title`)이나 라벨(`aria-label`/`aria-labelledby`)이 없으면 기본으로 `aria-hidden="true"` 로 처리해 장식용 아이콘으로 숨긴다.
- `title` 을 제공하면 내부 `title` 요소에 `id` 를 부여하고 `role="img"`, `aria-labelledby` 로 연결해 스크린 리더가 읽을 수 있도록 한다.
- `aria-label` 또는 `aria-labelledby` 를 전달하면 `role="img"` 로 노출하며, 키보드 포커스 흐름에는 영향을 주지 않는다.
