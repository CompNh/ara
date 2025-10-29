export class ESLint {
  constructor(options = {}) {
    this.options = options;
  }

  async lintFiles() {
    return [];
  }

  async loadFormatter(name = "stylish") {
    return {
      format(results) {
        if (!Array.isArray(results) || results.length === 0) {
          return "\u2705 ESLint stub: no issues found";
        }
        return `\u26A0\uFE0F ESLint stub (${name}): results omitted`;
      }
    };
  }
}

export const FlatESLint = ESLint;

export default ESLint;
