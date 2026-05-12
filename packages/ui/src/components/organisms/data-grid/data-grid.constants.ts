/** React Query key segment shared by `DataGrid` and callers that invalidate grid caches. */
export const DATA_GRID_ROOT_QUERY_KEY = "data-grid" as const;

export function getDataGridQueryKey(args: {
  url: string;
  requestParamsKey: string;
  dataPath: string;
  totalPath: string;
}) {
  return [
    DATA_GRID_ROOT_QUERY_KEY,
    args.url,
    args.requestParamsKey,
    args.dataPath,
    args.totalPath,
  ] as const;
}

export const GRID_CLASS = {
  shell:
    "w-full space-y-4 rounded-xl border border-border/90 bg-card p-3 shadow-sm md:p-4",
  wrapper: "overflow-hidden rounded-lg border border-border/80 bg-background",
  table: "w-full min-w-[920px] table-fixed border-collapse text-sm",
  headerCell:
    "sticky top-0 z-20 h-11 border-b border-border/90 bg-muted px-4 text-right text-xs font-semibold text-foreground md:text-sm",
  filterCell:
    "sticky top-11 z-10 h-11 border-b border-border/80 bg-card px-2.5 py-1.5 text-right",
  bodyCell:
    "border-b border-border/60 px-4 py-2.5 text-right align-middle text-xs text-foreground md:text-sm",
  filterControl:
    "h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring",
} as const;
