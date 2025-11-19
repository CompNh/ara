import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref
} from "react";
import { useAraTheme } from "../../theme/index.js";
import {
  BREAKPOINTS,
  type Breakpoint,
  type Responsive,
  type SpaceScale,
  createRule,
  mergeClassNames,
  normalizeResponsiveValue,
  resolveSpaceValue,
  toCSSValue,
  useLayoutClassName
} from "./shared.js";

export type GridAlign = "start" | "center" | "end" | "stretch";
export type GridJustify = GridAlign;
export type GridAutoFlow = "row" | "column" | "dense" | "row dense" | "column dense";

interface GridOwnProps<T extends ElementType = "div"> {
  readonly as?: T;
  readonly columns?: Responsive<number | string>;
  readonly rows?: Responsive<number | string>;
  readonly areas?: string[];
  readonly gap?: Responsive<SpaceScale | string | number>;
  readonly columnGap?: Responsive<SpaceScale | string | number>;
  readonly rowGap?: Responsive<SpaceScale | string | number>;
  readonly align?: Responsive<GridAlign>;
  readonly justify?: Responsive<GridJustify>;
  readonly autoFlow?: Responsive<GridAutoFlow>;
  readonly inline?: boolean;
  readonly children?: ReactNode;
}

export type GridProps<T extends ElementType = "div"> = GridOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GridOwnProps<T> | "as">;

function mapGridAlign(value: GridAlign): CSSProperties["alignItems"] {
  switch (value) {
    case "start":
      return "start";
    case "end":
      return "end";
    case "center":
      return "center";
    default:
      return "stretch";
  }
}

function mapGridJustify(value: GridJustify): CSSProperties["justifyItems"] {
  switch (value) {
    case "start":
      return "start";
    case "end":
      return "end";
    case "center":
      return "center";
    default:
      return "stretch";
  }
}

function resolveColumns(value: number | string): string {
  if (typeof value === "number") return `repeat(${value}, minmax(0, 1fr))`;
  return value;
}

function resolveRows(value: number | string): string {
  if (typeof value === "number") return `repeat(${value}, minmax(0, auto))`;
  return value;
}

function resolveAreas(areas?: string[]): string | undefined {
  if (!areas || areas.length === 0) return undefined;
  return areas.map((area) => `"${area}"`).join(" ");
}

interface GridComponent {
  <T extends ElementType = "div">(props: GridProps<T> & { ref?: Ref<HTMLElement> }): JSX.Element;
  displayName?: string;
}

export const Grid = forwardRef(function Grid<T extends ElementType = "div">(
  props: GridProps<T>,
  ref: Ref<HTMLElement>
) {
  const {
    as,
    columns: columnsProp,
    rows: rowsProp,
    areas,
    gap: gapProp,
    columnGap: columnGapProp,
    rowGap: rowGapProp,
    align: alignProp,
    justify: justifyProp,
    autoFlow: autoFlowProp,
    inline = false,
    className,
    children,
    ...restProps
  } = props;

  const Component = (as ?? "div") as ElementType;
  const theme = useAraTheme();
  const generatedClassName = useLayoutClassName("grid");

  const columns = useMemo(
    () => normalizeResponsiveValue<number | string>(columnsProp, 1),
    [columnsProp]
  );
  const rows = useMemo(() => normalizeResponsiveValue<number | string>(rowsProp, "auto"), [rowsProp]);
  const gap = useMemo(
    () => normalizeResponsiveValue<SpaceScale | string | number>(gapProp, 0),
    [gapProp]
  );
  const columnGap = useMemo(
    () => normalizeResponsiveValue<SpaceScale | string | number | undefined>(columnGapProp, undefined),
    [columnGapProp]
  );
  const rowGap = useMemo(
    () => normalizeResponsiveValue<SpaceScale | string | number | undefined>(rowGapProp, undefined),
    [rowGapProp]
  );
  const align = useMemo(
    () => normalizeResponsiveValue<GridAlign>(alignProp, "stretch"),
    [alignProp]
  );
  const justify = useMemo(
    () => normalizeResponsiveValue<GridJustify>(justifyProp, "stretch"),
    [justifyProp]
  );
  const autoFlow = useMemo(
    () => normalizeResponsiveValue<GridAutoFlow>(autoFlowProp, "row"),
    [autoFlowProp]
  );

  const resolvedAreas = useMemo(() => resolveAreas(areas), [areas]);
  const resolvedClassName = mergeClassNames("ara-grid", generatedClassName, className);

  const baseStyles = useMemo<Partial<CSSProperties>>(
    () => ({
      display: inline ? "inline-grid" : "grid",
      boxSizing: "border-box",
      gridTemplateColumns: resolveColumns(columns.base),
      gridTemplateRows: resolveRows(rows.base),
      gridTemplateAreas: resolvedAreas,
      gap: resolveSpaceValue(gap.base, theme),
      columnGap:
        columnGap.base !== undefined
          ? resolveSpaceValue(columnGap.base as SpaceScale | string | number, theme)
          : undefined,
      rowGap:
        rowGap.base !== undefined
          ? resolveSpaceValue(rowGap.base as SpaceScale | string | number, theme)
          : undefined,
      alignItems: mapGridAlign(align.base),
      justifyItems: mapGridJustify(justify.base),
      gridAutoFlow: autoFlow.base
    }),
    [
      align.base,
      autoFlow.base,
      columnGap.base,
      columns.base,
      gap.base,
      inline,
      justify.base,
      resolvedAreas,
      rowGap.base,
      rows.base,
      theme
    ]
  );

  const responsiveRules = useMemo(
    () =>
      (Object.keys(BREAKPOINTS) as Breakpoint[]).map((breakpoint) => {
        const styles: Partial<CSSProperties> = {
          gridTemplateColumns:
            columns[breakpoint] !== undefined
              ? resolveColumns(columns[breakpoint] as number | string)
              : undefined,
          gridTemplateRows:
            rows[breakpoint] !== undefined ? resolveRows(rows[breakpoint] as number | string) : undefined,
          gap:
            gap[breakpoint] !== undefined
              ? resolveSpaceValue(gap[breakpoint] as SpaceScale | string | number, theme)
              : undefined,
          columnGap:
            columnGap[breakpoint] !== undefined
              ? resolveSpaceValue(columnGap[breakpoint] as SpaceScale | string | number, theme)
              : undefined,
          rowGap:
            rowGap[breakpoint] !== undefined
              ? resolveSpaceValue(rowGap[breakpoint] as SpaceScale | string | number, theme)
              : undefined,
          alignItems: align[breakpoint] ? mapGridAlign(align[breakpoint] as GridAlign) : undefined,
          justifyItems: justify[breakpoint] ? mapGridJustify(justify[breakpoint] as GridJustify) : undefined,
          gridAutoFlow: autoFlow[breakpoint]
        };

        const rule = createRule(`.${generatedClassName}`, styles);
        if (!rule) return "";

        return `@media (min-width: ${toCSSValue(BREAKPOINTS[breakpoint])}px){${rule}}`;
      }),
    [align, autoFlow, columnGap, columns, generatedClassName, gap, justify, rowGap, rows, theme]
  );

  const cssText = useMemo(
    () => [createRule(`.${generatedClassName}`, baseStyles), ...responsiveRules].filter(Boolean).join(""),
    [baseStyles, generatedClassName, responsiveRules]
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <Component ref={ref} className={resolvedClassName} {...restProps}>
        {children}
      </Component>
    </>
  );
}) as GridComponent;

Grid.displayName = "Grid";
