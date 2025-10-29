const parser = {
  meta: {
    name: "typescript-eslint-stub",
    version: "0.0.0-stub"
  },
  parse() {
    return { type: "Program", body: [] };
  },
  parseForESLint() {
    const ast = this.parse();
    return {
      ast,
      scopeManager: null,
      visitorKeys: {}
    };
  }
};

const recommendedConfigs = [
  {
    name: "typescript-eslint/recommended",
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parser
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
      "@typescript-eslint/ban-ts-comment": "warn"
    }
  }
];

export function config(...configs) {
  return configs.flat();
}

export const configs = {
  recommended: recommendedConfigs
};

export default {
  config,
  configs
};
