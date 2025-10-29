const recommendedRules = {
  "react/jsx-uses-react": "warn",
  "react/jsx-uses-vars": "warn"
};

const jsxRuntimeRules = {
  "react/react-in-jsx-scope": "off"
};

export const configs = {
  recommended: {
    name: "react/recommended",
    rules: recommendedRules
  },
  "jsx-runtime": {
    name: "react/jsx-runtime",
    rules: jsxRuntimeRules
  }
};

export const rules = {};

export default {
  configs,
  rules
};
