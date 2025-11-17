import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type ComponentType,
  type ReactElement,
  type ReactNode,
  type Ref
} from "react";
import type { Theme } from "@ara/core";
import type { IconProps as IconSourceProps } from "@ara/icons/types";
import { useAraTheme } from "../../theme/index.js";

type IconComponent = ComponentType<IconSourceProps>;
type IconComponentTokens = Theme["component"]["icon"];

type IconSize = keyof IconComponentTokens["size"];
type IconTone = keyof IconComponentTokens["tone"];

export interface IconProps extends Omit<IconSourceProps, "width" | "height"> {
  readonly icon: IconComponent;
  readonly size?: IconSize | string | number;
  readonly tone?: IconTone | null;
  readonly strokeWidth?: number;
  readonly filled?: boolean;
  readonly className?: string;
}

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

function getFirstRecordValue<T>(record: Record<string, T> | Readonly<Record<string, T>>): T | undefined {
  const [firstKey] = Object.keys(record);
  if (firstKey === undefined) return undefined;
  return record[firstKey] as T | undefined;
}

function resolveSize(tokens: IconComponentTokens, size: IconProps["size"]): string | number {
  if (typeof size === "number") return size;
  if (typeof size === "string") {
    const mappedSize = tokens.size[size as IconSize];
    return mappedSize ?? size;
  }

  return tokens.size.md ?? getFirstRecordValue(tokens.size) ?? "1.25rem";
}

function resolveTone(tokens: IconComponentTokens, tone: IconProps["tone"]): string | null {
  if (!tone) return null;
  return tokens.tone[tone] ?? getFirstRecordValue(tokens.tone) ?? null;
}

function resolveStrokeWidth(tokens: IconComponentTokens, strokeWidth: IconProps["strokeWidth"]): number {
  if (typeof strokeWidth === "number") return strokeWidth;
  return tokens.strokeWidth.default;
}

function applyIconOverrides(
  node: ReactNode,
  options: { strokeWidth?: number; filled: boolean }
): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  const children = node.props.children;
  const resolvedChildren =
    children === undefined
      ? children
      : Children.map(children, (child) => applyIconOverrides(child, options));

  const nextProps: Record<string, unknown> = {};

  if (options.strokeWidth !== undefined) {
    const hasStroke = node.props.stroke !== undefined || node.props.strokeWidth !== undefined;
    if (typeof node.type === "string" && hasStroke) {
      nextProps.strokeWidth = options.strokeWidth;
    }
  }

  if (options.filled && (node.props.fill === undefined || node.props.fill === "none")) {
    nextProps.fill = "currentColor";
  }

  if (resolvedChildren !== children || Object.keys(nextProps).length > 0) {
    return cloneElement(node, nextProps, resolvedChildren);
  }

  return node;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref: Ref<SVGSVGElement>) {
  const {
    icon: IconComponent,
    size: sizeProp,
    tone: toneProp,
    strokeWidth: strokeWidthProp,
    filled = false,
    className,
    style,
    color,
    ...restProps
  } = props;

  const theme = useAraTheme();
  const iconTokens = theme.component.icon;

  const size = resolveSize(iconTokens, sizeProp);
  const toneColor = resolveTone(iconTokens, toneProp);
  const strokeWidth = resolveStrokeWidth(iconTokens, strokeWidthProp);

  const mergedStyle: CSSProperties = {
    ...style,
    width: size,
    height: size
  };

  const resolvedColor = color ?? style?.color ?? toneColor;
  if (resolvedColor) {
    mergedStyle.color = resolvedColor;
  }

  const renderedIcon = IconComponent({
    ...restProps,
    className: mergeClassNames("ara-icon", className),
    style: mergedStyle,
    width: size,
    height: size
  });

  const enhancedIcon = applyIconOverrides(renderedIcon, { strokeWidth, filled }) as ReactElement;

  return cloneElement(enhancedIcon, { ref });
});

Icon.displayName = "Icon";
