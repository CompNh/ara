export const configs = {
  recommended: {
    name: "@eslint/js/recommended",
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
      "no-debugger": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
};

export default { configs };
