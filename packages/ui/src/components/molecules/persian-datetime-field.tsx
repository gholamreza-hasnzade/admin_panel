"use client";

import * as React from "react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker, { type DatePickerProps } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

import { cn } from "../../lib/utils";
import { Label } from "../atoms/label";
import { textFieldVariants } from "../atoms/text-field";

const DEFAULT_OUTPUT_FORMAT = "YYYY/MM/DD HH:mm";

export type PersianDateTimeFieldProps = {
  id?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
  placeholder?: string;
  outputFormat?: string;
  hideSeconds?: boolean;
  minDate?: Date | string | number | DateObject;
  maxDate?: Date | string | number | DateObject;
  containerClassName?: string;
  inputClass?: string;
  calendarPosition?: DatePickerProps["calendarPosition"];
  zIndex?: number;
  title?: string;
};

function parseDisplayString(value: string | null | undefined, outputFormat: string): DateObject | undefined {
  if (value == null || !`${value}`.trim()) return undefined;
  const trimmed = `${value}`.trim();

  // Support backend ISO/Gregorian values (e.g. 2026-05-06T12:20:00) for edit forms.
  const parsedNativeDate = new Date(trimmed);
  if (Number.isFinite(parsedNativeDate.getTime())) {
    return new DateObject({
      date: parsedNativeDate,
      calendar: persian,
      locale: persian_fa,
    });
  }

  const candidates = [outputFormat, "YYYY/MM/DD HH:mm", "YYYY/MM/DD"];
  for (const format of candidates) {
    try {
      return new DateObject({
        date: trimmed,
        calendar: persian,
        locale: persian_fa,
        format,
      });
    } catch {
      // continue
    }
  }
  return undefined;
}

export function PersianDateTimeField({
  id,
  label,
  hint,
  error,
  required,
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  onBlur,
  name,
  className,
  placeholder = "انتخاب تاریخ و زمان",
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  hideSeconds = true,
  minDate,
  maxDate,
  containerClassName,
  inputClass,
  calendarPosition = "bottom-end",
  zIndex = 200,
  title,
}: PersianDateTimeFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const fieldState = error ? "error" : "default";
  const isDisabled = Boolean(disabled);
  const isReadOnly = Boolean(readOnly);

  const [innerValue, setInnerValue] = React.useState<DateObject | undefined>(() =>
    parseDisplayString(defaultValue ?? undefined, outputFormat),
  );

  const isControlled = value !== undefined;
  const parsedControlled = React.useMemo(
    () => (isControlled ? parseDisplayString(value, outputFormat) : undefined),
    [isControlled, value, outputFormat],
  );

  const pickerValue = isControlled ? parsedControlled : innerValue;

  const timePlugin = React.useMemo(
    () => <TimePicker key="persian-dt-time" position="bottom" hideSeconds={hideSeconds} />,
    [hideSeconds],
  );

  const handleChange: NonNullable<DatePickerProps["onChange"]> = (date) => {
    const next = Array.isArray(date) ? date[0] : date;
    if (!next) {
      if (!isControlled) setInnerValue(undefined);
      onChange?.("");
      return;
    }
    const formatted = next.format(outputFormat);
    if (!isControlled) setInnerValue(next);
    onChange?.(formatted);
  };

  React.useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInnerValue(parseDisplayString(defaultValue, outputFormat));
    }
  }, [isControlled, defaultValue, outputFormat]);

  return (
    <div className={cn("flex w-full flex-col gap-1 sm:gap-1.5", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? (
            <span className="ms-1 font-semibold text-red-600 dark:text-red-400" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      <div
        className={cn(
          textFieldVariants({ variant: "outline", size: "default", state: fieldState }),
          isDisabled && "cursor-not-allowed border-input bg-muted/50 opacity-70 hover:border-input",
          isReadOnly &&
            !isDisabled &&
            "bg-muted/30 hover:border-input focus-within:border-input focus-within:ring-transparent",
          containerClassName,
        )}
        onBlur={onBlur}
      >
        <DatePicker
          id={fieldId}
          name={name}
          title={title}
          calendar={persian}
          locale={persian_fa}
          format={outputFormat}
          value={pickerValue}
          onChange={handleChange}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={required}
          placeholder={placeholder}
          calendarPosition={calendarPosition}
          zIndex={zIndex}
          editable={false}
          minDate={minDate}
          maxDate={maxDate}
          containerClassName="w-full"
          inputClass={cn(
            "h-9 w-full min-w-0 border-0 bg-transparent py-1 text-start text-xs text-foreground outline-none ring-0",
            "placeholder:text-muted-foreground sm:h-10 sm:text-sm",
            inputClass,
          )}
          plugins={[timePlugin]}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      {error ? (
        <p id={errorId} className="text-[10px] leading-snug text-destructive sm:text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[10px] leading-snug text-muted-foreground sm:text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
