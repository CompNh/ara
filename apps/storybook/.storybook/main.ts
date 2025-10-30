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
    // Storybook's published ESM bundles expect Node's default symlink resolution
    // behaviour so that transitive dependencies inside the pnpm virtual store are
    // visible. Enabling preserveSymlinks on Windows breaks that resolution and
    // causes "Could not resolve '@storybook/..." errors during bundling.
    config.resolve.preserveSymlinks = process.platform !== "win32";
    return config;
  }
};

export default config;
