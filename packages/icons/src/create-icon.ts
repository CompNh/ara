import type { IconDefinition, IconName } from "./types.js";

interface CreateIconOptions {
  readonly viewBox: string;
  readonly paths: readonly string[];
  readonly width?: number;
  readonly height?: number;
}

export const createIcon = (
  name: IconName,
  { viewBox, paths, width, height }: CreateIconOptions,
): IconDefinition => ({
  name,
  viewBox,
  paths,
  width,
  height,
});
