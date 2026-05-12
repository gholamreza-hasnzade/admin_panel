"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { UpDownIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Label } from "../atoms/label";

export type SelectFieldOption<TValue extends string = string> = {
  value: TValue;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SelectFieldProps<TValue extends string = string> = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "defaultValue" | "onChange" | "children" | "multiple"
> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  options?: SelectFieldOption<TValue>[];
  optionsUrl?: string;
  requestParams?: Record<string, string | number | boolean | null | undefined>;
  fetchOptions?: (args: {
    url: string;
    params?: Record<string, string | number | boolean | null | undefined>;
  }) => Promise<unknown>;
  normalizeOptions?: (raw: unknown) => SelectFieldOption<TValue>[];
  queryEnabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  multiple?: boolean;
  value?: TValue | TValue[];
  defaultValue?: TValue | TValue[];
  onValueChange?: (value: TValue | TValue[] | "") => void;
  placeholder?: React.ReactNode;
  loading?: boolean;
  loadingText?: React.ReactNode;
  emptyOptionsText?: React.ReactNode;
  allowEmptyOption?: boolean;
  containerClassName?: string;
  selectClassName?: string;
};

function useOutsideClick<T extends HTMLElement>(ref: React.RefObject<T | null>, onOutside: () => void) {
  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !ref.current) return;
      if (!ref.current.contains(target)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside, ref]);
}

function SelectFieldBase<TValue extends string = string>({
  id,
  label,
  hint,
  error,
  options = [],
  optionsUrl,
  requestParams,
  fetchOptions,
  normalizeOptions,
  queryEnabled = true,
  searchable = false,
  searchPlaceholder = "جستجو...",
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  placeholder = "انتخاب کنید",
  loading = false,
  loadingText = "در حال دریافت...",
  emptyOptionsText,
  allowEmptyOption = true,
  disabled,
  required,
  className,
  containerClassName,
  selectClassName,
  ...props
}: SelectFieldProps<TValue>) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const triggerId = `${selectId}-trigger`;
  const searchId = `${selectId}-search`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const [searchText, setSearchText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const shouldFetch = Boolean(optionsUrl) && queryEnabled;
  const isMultipleValue = Array.isArray(value);
  const selectedValues = React.useMemo(
    () => (isMultipleValue ? (value as TValue[]) : value ? [value as TValue] : []),
    [isMultipleValue, value],
  );

  useOutsideClick(rootRef, () => setOpen(false));

  const queryResult = useQuery<SelectFieldOption<TValue>[]>({
    queryKey: ["select-field-options", optionsUrl ?? "", requestParams ?? {}],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!optionsUrl) return [] as SelectFieldOption<TValue>[];
      const raw = fetchOptions
        ? await fetchOptions({ url: optionsUrl, params: requestParams })
        : await (async () => {
            const parsedUrl = new URL(optionsUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
            Object.entries(requestParams ?? {}).forEach(([key, paramValue]) => {
              if (paramValue != null) {
                parsedUrl.searchParams.set(key, String(paramValue));
              }
            });
            const response = await fetch(parsedUrl.toString());
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return response.json() as Promise<unknown>;
          })();
      if (normalizeOptions) return normalizeOptions(raw);
      if (!Array.isArray(raw)) return [] as SelectFieldOption<TValue>[];
      const mapped: Array<SelectFieldOption<TValue> | null> = raw
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const record = item as Record<string, unknown>;
          const optionValue = record.value ?? record.id ?? record.key ?? record.code ?? "";
          const optionLabel = record.label ?? record.title ?? record.name ?? record.text ?? optionValue;
          if (!optionValue) return null;
          return {
            value: String(optionValue) as TValue,
            label: String(optionLabel),
            disabled: Boolean(record.disabled),
          };
        });
      return mapped.filter(Boolean) as SelectFieldOption<TValue>[];
    },
  });

  const resolvedOptions = React.useMemo(
    () => (shouldFetch ? (queryResult.data ?? []) : options),
    [options, queryResult.data, shouldFetch],
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchText.trim()) return resolvedOptions;
    const query = searchText.trim().toLowerCase();
    return resolvedOptions.filter((option) =>
      typeof option.label === "string" ? option.label.toLowerCase().includes(query) : true,
    );
  }, [resolvedOptions, searchText, searchable]);

  const hasNoOptions = filteredOptions.length === 0;
  const effectiveLoading = Boolean(loading) || (shouldFetch && queryResult.isPending);
  const effectiveDisabled = Boolean(disabled) || (effectiveLoading && resolvedOptions.length === 0);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (multiple) {
        const selected = Array.from(event.target.selectedOptions).map((option) => option.value as TValue);
        onValueChange?.(selected);
        return;
      }
      onValueChange?.(event.target.value as TValue | "");
    },
    [multiple, onValueChange],
  );

  const helper = React.useMemo(() => {
    if (error) {
      return (
        <p id={errorId} className="text-[10px] leading-snug text-destructive sm:text-xs">
          {error}
        </p>
      );
    }
    if (hint) {
      return (
        <p id={hintId} className="text-[10px] leading-snug text-muted-foreground sm:text-xs">
          {hint}
        </p>
      );
    }
    return null;
  }, [error, errorId, hint, hintId]);

  const selectedLabel = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    const selectedItems = resolvedOptions.filter((option) => selectedValues.includes(option.value));
    if (selectedItems.length === 0) return placeholder;
    if (multiple) {
      const labels = selectedItems
        .map((item) => (typeof item.label === "string" ? item.label : String(item.value)))
        .filter(Boolean);
      return labels.join("، ");
    }
    return selectedItems[0]?.label ?? placeholder;
  }, [multiple, placeholder, resolvedOptions, selectedValues]);

  const toggleOption = React.useCallback(
    (next: TValue) => {
      if (multiple) {
        const current = new Set(selectedValues);
        if (current.has(next)) current.delete(next);
        else current.add(next);
        onValueChange?.(Array.from(current));
        return;
      }
      onValueChange?.(next);
      setOpen(false);
    },
    [multiple, onValueChange, selectedValues],
  );

  return (
    <div className={cn("flex w-full flex-col gap-1 sm:gap-1.5", className)}>
      {label ? (
        <Label htmlFor={selectId}>
          {label}
          {required ? (
            <span className="ms-1 font-semibold text-red-600 dark:text-red-400" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      <div className={cn("relative w-full", containerClassName)} ref={rootRef}>
        {searchable ? (
          <>
            <button
              id={triggerId}
              type="button"
              disabled={effectiveDisabled}
              aria-haspopup="menu"
              aria-describedby={describedBy}
              onClick={() => setOpen((prev) => !prev)}
              className={cn(
                "flex h-9 w-full touch-manipulation items-center justify-between gap-1.5 rounded-md border border-input bg-background px-2.5 text-right text-xs text-foreground outline-none transition-colors sm:h-10 sm:gap-2 sm:px-3 sm:text-sm",
                "focus:border-ring focus:ring-1 focus:ring-ring",
                "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-70",
                error && "border-destructive focus:border-destructive focus:ring-destructive/30",
                selectClassName,
              )}
            >
              <span className={cn("block truncate", selectedValues.length === 0 && "text-muted-foreground")}>
                {effectiveLoading ? loadingText : selectedLabel}
              </span>
              <UpDownIcon
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform sm:size-4",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {open ? (
              <div className="absolute inset-x-0 top-full z-40 mt-0.5 overflow-hidden rounded-md border border-border bg-popover shadow-md sm:mt-1">
                <div className="border-b border-border/70 p-1.5 sm:p-2">
                  <input
                    id={searchId}
                    title={typeof label === "string" ? label : "search"}
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-8 w-full touch-manipulation rounded-md border border-input bg-background px-2 text-[11px] outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring sm:h-9 sm:px-2.5 sm:text-xs"
                    aria-label={typeof label === "string" ? `جستجو در ${label}` : "جستجو در گزینه‌ها"}
                  />
                </div>
                <ul className="max-h-48 overflow-auto py-0.5 sm:max-h-56 sm:py-1">
                  {allowEmptyOption ? (
                    <li>
                      <button
                        type="button"
                        className="w-full touch-manipulation px-2.5 py-1.5 text-right text-xs text-muted-foreground hover:bg-accent sm:px-3 sm:py-2 sm:text-sm"
                        onClick={() => {
                          onValueChange?.(multiple ? ([] as TValue[]) : "");
                          if (!multiple) setOpen(false);
                        }}
                      >
                        {placeholder}
                      </button>
                    </li>
                  ) : null}
                  {filteredOptions.map((option, index) => {
                    const selected = selectedValues.includes(option.value);
                    const optionKey = `${option.value}-${index}`;
                    return (
                      <li key={optionKey}>
                        <button
                          type="button"
                          disabled={option.disabled}
                          onClick={() => toggleOption(option.value)}
                          className={cn(
                            "flex w-full touch-manipulation items-center justify-between px-2.5 py-1.5 text-right text-xs hover:bg-accent sm:px-3 sm:py-2 sm:text-sm",
                            option.disabled && "cursor-not-allowed opacity-50",
                            selected && "bg-accent/70 font-medium text-primary",
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          {selected ? (
                            <span className="shrink-0 ps-1 text-[11px] sm:text-sm" aria-hidden>
                              ✓
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                  {hasNoOptions ? (
                    <li className="px-2.5 py-1.5 text-right text-[11px] text-muted-foreground sm:px-3 sm:py-2 sm:text-xs">
                      {emptyOptionsText ?? "گزینه‌ای یافت نشد"}
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            <input type="hidden" name={props.name} value={multiple ? selectedValues.join(",") : (value as string) ?? ""} />
          </>
        ) : (
          <select
            id={selectId}
            value={value}
            defaultValue={defaultValue}
            multiple={multiple}
            required={required}
            disabled={effectiveDisabled}
            aria-describedby={describedBy}
            className={cn(
              "h-9 w-full touch-manipulation rounded-md border border-input bg-background px-2.5 text-xs text-foreground outline-none transition-colors sm:h-10 sm:px-3 sm:text-sm",
              "focus:border-ring focus:ring-1 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-70",
              error && "border-destructive focus:border-destructive focus:ring-destructive/30",
              selectClassName,
            )}
            onChange={handleChange}
            {...props}
          >
            {allowEmptyOption ? (
              <option value="">{effectiveLoading ? loadingText : placeholder}</option>
            ) : null}
            {filteredOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
            {hasNoOptions && !allowEmptyOption && emptyOptionsText ? (
              <option value="" disabled>
                {emptyOptionsText}
              </option>
            ) : null}
          </select>
        )}
      </div>

      {helper}
    </div>
  );
}

const SelectField = React.memo(SelectFieldBase) as typeof SelectFieldBase;

export { SelectField };

