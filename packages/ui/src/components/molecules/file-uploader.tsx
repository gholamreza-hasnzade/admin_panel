"use client";

import * as React from "react";

import { CloseIcon, DownloadIcon, FileDocumentIcon } from "../../icons";
import { cn } from "../../lib/utils";

type FileUploaderStatus = "default" | "error" | "success";

export type FileUploaderProps = {
  id?: string;
  name?: string;
  className?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
  maxFileSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  onFileChange?: (file: File | null) => void;
};

function normalizeExtensions(input?: string[]): Set<string> | null {
  if (!input || input.length === 0) return null;

  return new Set(
    input
      .map((ext) => ext.trim().toLowerCase())
      .filter(Boolean)
      .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`)),
  );
}

const FileUploader = React.forwardRef<HTMLInputElement, FileUploaderProps>(
  (
    {
      id,
      name,
      className,
      label = "Upload file",
      description,
      placeholder = "Drag and drop a file here, or click to browse",
      disabled = false,
      required = false,
      accept,
      maxFileSizeMB,
      allowedMimeTypes,
      allowedExtensions,
      onFileChange,
    },
    forwardedRef,
  ) => {
    const innerInputRef = React.useRef<HTMLInputElement | null>(null);

    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isDragActive, setIsDragActive] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    const generatedId = React.useId();
    const inputId = id ?? `file-uploader-${generatedId}`;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const statusId = `${inputId}-status`;

    const extensionSet = React.useMemo(
      () => normalizeExtensions(allowedExtensions),
      [allowedExtensions],
    );

    const isImage = React.useMemo(
      () => Boolean(selectedFile && selectedFile.type.startsWith("image/")),
      [selectedFile],
    );

    const describedBy = React.useMemo(() => {
      return [description ? descriptionId : null, error ? errorId : statusId]
        .filter(Boolean)
        .join(" ");
    }, [description, descriptionId, error, errorId, statusId]);

    React.useEffect(() => {
      if (!selectedFile || !isImage) {
        setPreviewUrl(null);
        return;
      }

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }, [isImage, selectedFile]);

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerInputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
          return;
        }
        if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const resetNativeInput = React.useCallback(() => {
      if (innerInputRef.current) {
        innerInputRef.current.value = "";
      }
    }, []);

    const status: FileUploaderStatus = error ? "error" : selectedFile ? "success" : "default";

    const validateFile = React.useCallback(
      (file: File): string | null => {
        if (maxFileSizeMB !== undefined) {
          const maxBytes = maxFileSizeMB * 1024 * 1024;
          if (file.size > maxBytes) {
            return `File size must be ${maxFileSizeMB}MB or less.`;
          }
        }

        if (allowedMimeTypes && allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
          return "This file type is not allowed.";
        }

        if (extensionSet && extensionSet.size > 0) {
          const lowered = file.name.toLowerCase();
          const dotIndex = lowered.lastIndexOf(".");
          const ext = dotIndex >= 0 ? lowered.slice(dotIndex) : "";
          if (!extensionSet.has(ext)) {
            return "This file extension is not allowed.";
          }
        }

        return null;
      },
      [allowedMimeTypes, extensionSet, maxFileSizeMB],
    );

    const applyFile = React.useCallback(
      (file: File | null) => {
        if (!file) {
          setSelectedFile(null);
          setError(null);
          resetNativeInput();
          onFileChange?.(null);
          return;
        }

        const maybeError = validateFile(file);
        if (maybeError) {
          setSelectedFile(null);
          setError(maybeError);
          resetNativeInput();
          onFileChange?.(null);
          return;
        }

        setSelectedFile(file);
        setError(null);
        onFileChange?.(file);
      },
      [onFileChange, resetNativeInput, validateFile],
    );

    const openPicker = React.useCallback(() => {
      if (disabled) return;
      innerInputRef.current?.click();
    }, [disabled]);

    const handleInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        applyFile(file);
      },
      [applyFile],
    );

    const handleRemove = React.useCallback(
      (event?: React.MouseEvent<HTMLButtonElement>) => {
        event?.stopPropagation();
        if (disabled) return;
        setIsPreviewOpen(false);
        applyFile(null);
      },
      [applyFile, disabled],
    );

    const handleDownload = React.useCallback(
      (event?: React.MouseEvent<HTMLButtonElement>) => {
        event?.stopPropagation();
        if (!selectedFile) return;
        const objectUrl = URL.createObjectURL(selectedFile);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = selectedFile.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      [selectedFile],
    );

    const handleDragOver = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled) return;
        setIsDragActive(true);
      },
      [disabled],
    );

    const handleDragLeave = React.useCallback(() => {
      setIsDragActive(false);
    }, []);

    const handleDrop = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled) return;
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        applyFile(file);
      },
      [applyFile, disabled],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      },
      [disabled, openPicker],
    );

    const dropAreaStateClass =
      status === "error"
        ? "border-red-300 bg-red-50/60"
        : isDragActive
          ? "border-sky-400 bg-sky-50/80"
          : "border-slate-300 bg-transparent hover:border-sky-300 hover:bg-slate-50/60";

    return (
      <div className={cn("w-full space-y-1.5 sm:space-y-2", className)}>
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-[11px] font-medium text-slate-900 sm:text-xs">
            {label}
            {required ? <span className="ms-1 text-red-500">*</span> : null}
          </label>
        </div>

        {description ? (
          <p id={descriptionId} className="text-[10px] text-slate-500/90 sm:text-[11px]">
            {description}
          </p>
        ) : null}

        <input
          ref={setRefs}
          id={inputId}
          name={name}
          type="file"
          className="sr-only"
          accept={accept}
          required={required}
          disabled={disabled}
          onChange={handleInputChange}
          aria-describedby={describedBy || undefined}
        />

        <div className="space-y-1.5 sm:space-y-2">
          {!selectedFile ? (
            <>
              <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label="File upload area"
                aria-describedby={describedBy || undefined}
                onClick={openPicker}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex h-20 w-20 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-md border border-dashed transition-colors sm:h-24 sm:w-24 sm:gap-1 sm:rounded-lg",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                  "cursor-pointer",
                  dropAreaStateClass,
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="text-base leading-none text-slate-500 sm:text-lg">+</span>
                <span className="text-[11px] text-slate-700 sm:text-xs">Upload</span>
              </div>

              <div className="space-y-0.5 border-t border-slate-200 pt-1.5 sm:space-y-1 sm:pt-2">
                <p className="text-[11px] font-semibold text-slate-800 sm:text-xs">Avatar</p>
                <p className="text-[11px] text-slate-700 sm:text-xs">
                  Click to upload user&apos;s avatar, and validate size and format.
                </p>
                <p className="text-[10px] text-slate-500 sm:text-[11px]">{placeholder}</p>
              </div>
            </>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <div
                  onClick={() => {
                    if (isImage && previewUrl && !disabled) setIsPreviewOpen(true);
                  }}
                  className={cn(
                    "group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-300 bg-white sm:h-24 sm:w-24 sm:rounded-lg",
                    isImage && previewUrl && !disabled ? "cursor-zoom-in touch-manipulation" : "",
                  )}
                >
                  {isImage && previewUrl ? (
                    <img src={previewUrl} alt={selectedFile.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <FileDocumentIcon />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={disabled}
                    aria-label="Download file"
                    className={cn(
                      "absolute bottom-1 inset-s-1 inline-flex size-8 touch-manipulation items-center justify-center rounded-full sm:size-5",
                      "bg-black/55 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100",
                      "cursor-pointer focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    <DownloadIcon className="size-3.5 sm:size-3" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    aria-label="Remove file"
                    className={cn(
                      "absolute inset-e-1 top-1 inline-flex size-8 touch-manipulation items-center justify-center rounded-full sm:size-5",
                      "bg-black/55 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100",
                      "cursor-pointer focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    <CloseIcon className="size-3.5 sm:size-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-[11px] text-red-600 sm:text-xs" role="alert">
            {error}
          </p>
        ) : status === "success" ? (
          <p id={statusId} className="text-[11px] text-emerald-600 sm:text-xs">
            {isImage ? "Upload ready." : "Preview not available for this file type."}
          </p>
        ) : (
          <p id={statusId} className="text-[11px] text-slate-500 sm:text-xs">
            No file selected.
          </p>
        )}

        {isPreviewOpen && isImage && previewUrl ? (
          <div
            className="fixed inset-0 z-50 flex touch-manipulation items-center justify-center bg-black/70 p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-md bg-white p-1.5 sm:rounded-lg sm:p-2"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={previewUrl} alt={selectedFile?.name ?? "Preview"} className="max-h-[85vh] max-w-[85vw] object-contain" />
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Close preview"
                className="absolute inset-e-2 top-2 inline-flex size-8 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-black/70 text-white hover:bg-black sm:size-7"
              >
                <CloseIcon className="size-3.5 sm:size-3" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

FileUploader.displayName = "FileUploader";

export { FileUploader };
