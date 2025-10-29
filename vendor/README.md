# Vendor stubs

이 디렉터리는 외부 레지스트리에 접근할 수 없는 환경에서 개발 편의를 위해 최소 동작만 제공하는 도구 패키지의 스텁 버전을 포함합니다. 다음 패키지가 제공됩니다.

- `eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- `eslint-config-prettier`, `globals`, `typescript-eslint`
- `typescript`, `prettier`
- `@changesets/cli`

각 패키지는 실제 구현과 API가 다를 수 있으며, 필수적인 CLI나 구성 요소가 없을 수도 있습니다. CI 또는 배포 환경에서는 반드시 공식 패키지를 설치하도록 `.npmrc`나 레지스트리 구성을 조정해야 합니다.
