# FocusTrap

키보드 탭 포커스를 지정한 컨테이너 내부에 가두고, 언마운트 시 이전 포커스로 복구하는 컴포넌트입니다. 모달/다이얼로그 콘텐츠가 화면 전체에서 포커스를 독점해야 할 때 사용합니다.

## 사용 방법

```tsx
import { FocusTrap } from "@ara/react";

function DialogContent() {
  return (
    <FocusTrap>
      <h2>제목</h2>
      <p>설명</p>
      <button>확인</button>
    </FocusTrap>
  );
}
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **active** | `boolean` | `true` | `false`이면 포커스 트랩을 비활성화하고 아무 동작도 하지 않습니다. |
| **initialFocus** | `HTMLElement \| (() => HTMLElement \| null) \| null` | 첫 번째 포커스 가능한 요소 | 최초 마운트 시 포커스를 줄 요소. 반환값이나 요소가 컨테이너 내부에 있을 때만 적용됩니다. |
| **restoreFocus** | `boolean` | `true` | 언마운트 시 트랩 활성화 이전에 포커스를 갖고 있던 요소로 되돌립니다. |
| **asChild** | `boolean` | `false` | `true`이면 자식 요소를 그대로 컨테이너로 사용해 추가 래퍼를 만들지 않습니다. |
| **children** | `ReactNode` | — | 포커스를 가둘 콘텐츠. |

## 동작/고려 사항

- 컴포넌트가 렌더링되면 앞뒤에 포커스 가드(`tabIndex=0`)가 자동으로 삽입되어 탭 순환이 컨테이너 안에서만 이루어집니다.
- `initialFocus`가 유효하지 않으면 컨테이너 내부의 첫 번째 포커스 가능한 요소나 컨테이너 자체로 포커스를 이동합니다.
- `restoreFocus`가 활성화된 상태에서 트랩이 언마운트되면, 트랩이 처음 활성화되기 직전에 포커스를 가졌던 요소로 복구합니다.
- `asChild`를 사용하면 외부에서 전달한 엘리먼트가 컨테이너가 되며, `className` 등 속성은 그대로 병합됩니다.
