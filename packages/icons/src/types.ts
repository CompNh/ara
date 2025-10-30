export type IconName = string;

export interface IconDefinition {
  readonly name: IconName;
  readonly viewBox: string;
  readonly paths: readonly string[];
  readonly width?: number;
  readonly height?: number;
}
