const FLOAT_PRECISION = 3;

/**
 * @type {import('svgo').Config}
 */
const config = {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // viewBox는 소비 레이어의 스케일 기준이므로 제거하지 않는다.
          removeViewBox: false,
          // data-*, aria-* 메타 정보는 그대로 둔다.
          removeUnknownsAndDefaults: {
            keepDataAttrs: true
          },
          // 숫자 정밀도는 아래 plugin에서 통일 적용한다.
          cleanupNumericValues: false,
          convertPathData: {
            floatPrecision: FLOAT_PRECISION
          }
        }
      }
    },
    // 속성 이름과 불필요한 공백을 정리한다.
    "cleanupAttrs",
    {
      name: "cleanupNumericValues",
      params: {
        floatPrecision: FLOAT_PRECISION
      }
    },
    {
      name: "mergePaths",
      params: {
        force: true,
        noSpaceAfterFlags: true
      }
    },
    // diff 가독성을 위해 속성 순서를 일정하게 유지한다.
    "sortAttrs",
    // 라이선스/저작권 주석은 최적화 과정에서도 보존한다.
    "preserveLicense"
  ]
};

export default config;
