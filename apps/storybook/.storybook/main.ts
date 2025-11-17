import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    const aliases = config.resolve.alias ?? [];
    const resolvePackages = (pkg: string) =>
      path.resolve(__dirname, "..", "..", "..", "packages", pkg, "src");
    config.resolve.alias = [
      ...(Array.isArray(aliases) ? aliases : Object.entries(aliases).map(([find, replacement]) => ({ find, replacement }))),
      { find: "@ara/react", replacement: resolvePackages("react") },
      { find: "@ara/react/", replacement: `${resolvePackages("react")}/` },
      { find: "@ara/core", replacement: resolvePackages("core") },
      { find: "@ara/core/", replacement: `${resolvePackages("core")}/` },
      { find: "@ara/icons", replacement: resolvePackages("icons") },
      { find: "@ara/icons/", replacement: `${resolvePackages("icons")}/` },
      { find: "@ara/tokens", replacement: resolvePackages("tokens") },
      { find: "@ara/tokens/", replacement: `${resolvePackages("tokens")}/` }
    ];

    // Storybook's published ESM bundles expect Node's default symlink resolution
    // behaviour so that transitive dependencies inside the pnpm virtual store are
    // visible. Enabling preserveSymlinks on Windows breaks that resolution and
    // causes "Could not resolve '@storybook/..." errors during bundling.
    config.resolve.preserveSymlinks = process.platform !== "win32";
    return config;
  }
};

export default config;
