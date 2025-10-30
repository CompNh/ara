# Storybook 작업 가이드

## 개요
Ara 컴포넌트를 독립된 캔버스에서 문서화하고 테스트하기 위한 Storybook 8 기반 환경입니다. 디자인 시스템 소비자와 디자이너, QA가 컴포넌트의 상태와 상호작용을 빠르게 확인할 수 있도록 스토리를 작성하세요.

## 사전 준비
- **Node.js**: 22 LTS 이상
- **패키지 매니저**: Corepack으로 pnpm 10.5.2 사용 (`corepack use pnpm@10.5.2`)
- 루트에서 한 번 `pnpm install` 을 실행해 모든 워크스페이스 의존성을 설치합니다.

## 실행 방법
| 목적 | 루트 기준 명령 | 앱 디렉터리 기준 명령 | 설명 |
| --- | --- | --- | --- |
| 개발용 Storybook | `pnpm storybook` | `pnpm storybook` | 기본 포트 6006에서 Storybook 개발 서버를 실행합니다. 컴포넌트 변경이 즉시 반영됩니다. |
| 정적 빌드 | `pnpm storybook:build` | `pnpm build-storybook` | `storybook-static/` 폴더에 정적 문서를 생성합니다. 배포나 CI 스냅샷 테스트에서 사용하세요. |

> Storybook을 다른 포트로 띄우고 싶다면 `pnpm storybook -- --port 7007` 처럼 인자를 추가할 수 있습니다.

## 스토리 작성 팁
1. **위치**: 모든 스토리는 `apps/storybook/stories/` 아래에 작성하며, 도메인별로 서브 디렉터리를 나누어 관리합니다.
2. **CSF3 권장**: 컴포넌트 기본 내보내기는 메타(`Meta`) 객체, 케이스는 `StoryObj` 패턴을 사용해 스토리를 선언합니다.
3. **Controls & Docs**: `@storybook/addon-essentials` 세트가 활성화되어 있으니 `argTypes`를 정의해 Story Docs와 Controls 패널을 풍부하게 구성하세요.
4. **Interactions 테스트**: 상호작용이 필요한 경우 `@storybook/addon-interactions`의 `play` 함수와 Testing Library 헬퍼를 활용해 회귀 테스트를 작성할 수 있습니다.
5. **디자인 토큰 연동**: `@ara/react` 패키지를 통해 전달되는 테마/토큰을 그대로 사용하면 Showcase와 시각적으로 일관성을 유지할 수 있습니다.

## 추천 워크플로우
1. 새 컴포넌트를 추가하면 기본 렌더 스토리와 변형 케이스를 정의합니다.
2. 접근성·상호작용 요구사항이 있다면 `play` 함수로 사용 시나리오를 자동화하고, 스냅샷 대신 시각적 회귀 도구(CI 통합 예정)를 활용합니다.
3. PR에서는 관련 스토리 파일 경로와 미리보기 캡처를 첨부해 리뷰어가 쉽게 접근하도록 합니다.

## 트러블슈팅
- **캐시 초기화**: Storybook이 이전 설정을 끌어올 경우 `pnpm storybook -- --no-manager-cache` 옵션으로 실행하거나, `node_modules/.cache/storybook` 폴더를 삭제합니다.
- **경로 해석 오류**: TS 경로 별칭이 인식되지 않으면 `apps/storybook/tsconfig.json` 의 `compilerOptions.paths` 구성을 확인하고, 루트 `tsconfig.base.json` 과 동기화합니다.
- **빌드 실패**: 빌드가 실패하면 `pnpm storybook:build -- --debug-webpack` 로 추가 로그를 확인하거나, `pnpm install` 로 의존성을 재설치한 뒤 다시 빌드를 시도합니다.

## 참고 자료
- [Storybook 8 공식 문서](https://storybook.js.org/docs)에서 최신 기능과 애드온 사용법을 확인할 수 있습니다.
- 협업 규칙과 배포 전략은 루트 `README.md`, `docs/` 디렉터리의 가이드를 참고하세요.
