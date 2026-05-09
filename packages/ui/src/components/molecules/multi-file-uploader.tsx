"use client";

import * as React from "react";

import { CloseIcon, DownloadIcon } from "../../icons";

type FileUploadStatus = "default" | "error" | "success";

export type MultiFileUploaderProps = {
  id?: string;
  name?: string;
  className?: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
  maxFileSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  onFilesChange?: (files: File[]) => void;
};

type PreviewItem = {
  file: File;
  key: string;
  isImage: boolean;
  previewUrl: string | null;
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function normalizeExtensions(exts?: string[]): Set<string> | null {
  if (!exts || exts.length === 0) return null;
  return new Set(
    exts
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .map((e) => (e.startsWith(".") ? e : `.${e}`)),
  );
}

function getExtension(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i).toLowerCase() : "";
}

const MultiFileUploader = React.forwardRef<HTMLInputElement, MultiFileUploaderProps>(
  (
    {
      id,
      name,
      className,
      label = "Upload files",
      hint,
      placeholder = "Drag files here or click to browse",
      disabled = false,
      accept,
      maxFiles,
      maxFileSizeMB,
      allowedMimeTypes,
      allowedExtensions,
      onFilesChange,
    },
    forwardedRef,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const urlCacheRef = React.useRef<Map<string, string>>(new Map());
    const dragDepthRef = React.useRef(0);

    const [{ files, errors }, setUploadState] = React.useState<{
      files: File[];
      errors: string[];
    }>({ files: [], errors: [] });
    const [isDragActive, setIsDragActive] = React.useState(false);
    const [previewModal, setPreviewModal] = React.useState<{ url: string; name: string; key: string } | null>(null);

    const onFilesChangeRef = React.useRef(onFilesChange);
    onFilesChangeRef.current = onFilesChange;

    React.useEffect(() => {
      onFilesChangeRef.current?.(files);
    }, [files]);

    const generatedId = React.useId();
    const inputId = id ?? `multi-file-uploader-${generatedId}`;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const statusId = `${inputId}-status`;

    const extensionSet = React.useMemo(
      () => normalizeExtensions(allowedExtensions),
      [allowedExtensions],
    );

    const maxReached = typeof maxFiles === "number" && files.length >= maxFiles;
    const status: FileUploadStatus = errors.length > 0 ? "error" : files.length > 0 ? "success" : "default";

    const describedBy = [hint ? hintId : null, errors.length > 0 ? errorId : statusId]
      .filter(Boolean)
      .join(" ");

    const setInputNode = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const validateFile = React.useCallback(
      (file: File): string | null => {
        if (typeof maxFileSizeMB === "number") {
          const maxBytes = maxFileSizeMB * 1024 * 1024;
          if (file.size > maxBytes) {
            return `"${file.name}" exceeds ${maxFileSizeMB}MB limit.`;
          }
        }

        if (allowedMimeTypes && allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
          return `"${file.name}" has an unsupported MIME type.`;
        }

        if (extensionSet && extensionSet.size > 0) {
          const ext = getExtension(file.name);
          if (!extensionSet.has(ext)) {
            return `"${file.name}" has an unsupported file extension.`;
          }
        }

        return null;
      },
      [allowedMimeTypes, extensionSet, maxFileSizeMB],
    );

    const mergeNewFiles = React.useCallback(
      (incoming: File[]) => {
        if (disabled) return;
        if (incoming.length === 0) return;

        setUploadState((prev) => {
          const next = [...prev.files];
          const seen = new Set(prev.files.map(fileKey));
          const newErrors: string[] = [];
          const limit = maxFiles ?? Number.POSITIVE_INFINITY;

          for (const file of incoming) {
            const key = fileKey(file);

            if (seen.has(key)) {
              newErrors.push(`"${file.name}" is duplicate and was skipped.`);
              continue;
            }

            if (next.length >= limit) {
              newErrors.push(`Maximum ${limit} files allowed.`);
              break;
            }

            const validationError = validateFile(file);
            if (validationError) {
              newErrors.push(validationError);
              continue;
            }

            seen.add(key);
            next.push(file);
          }

          return { files: next, errors: newErrors };
        });
      },
      [disabled, maxFiles, validateFile],
    );

    const openPicker = React.useCallback(() => {
      if (disabled || maxReached) return;
      inputRef.current?.click();
    }, [disabled, maxReached]);

    const handleInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const incoming = Array.from(event.target.files ?? []);
        mergeNewFiles(incoming);
        event.currentTarget.value = "";
      },
      [mergeNewFiles],
    );

    const handleRemoveFile = React.useCallback((keyToRemove: string) => {
      if (disabled) return;
      setUploadState((prev) => ({
        files: prev.files.filter((f) => fileKey(f) !== keyToRemove),
        errors: [],
      }));
      setPreviewModal((pm) => (pm?.key === keyToRemove ? null : pm));
    }, [disabled]);

    const handleDownloadFile = React.useCallback((file: File, event?: React.MouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    }, []);

    const handleDragEnter = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled || maxReached) return;
        dragDepthRef.current += 1;
        setIsDragActive(true);
      },
      [disabled, maxReached],
    );

    const handleDragOver = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled || maxReached) return;
        event.dataTransfer.dropEffect = "copy";
      },
      [disabled, maxReached],
    );

    const handleDragLeave = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled || maxReached) return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
          setIsDragActive(false);
        }
      },
      [disabled, maxReached],
    );

    const handleDrop = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled || maxReached) return;
        dragDepthRef.current = 0;
        setIsDragActive(false);
        const incoming = Array.from(event.dataTransfer.files ?? []);
        mergeNewFiles(incoming);
      },
      [disabled, maxReached, mergeNewFiles],
    );

    const handleZoneKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled || maxReached) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      },
      [disabled, maxReached, openPicker],
    );

    const previews = React.useMemo<PreviewItem[]>(() => {
      return files.map((file) => {
        const key = fileKey(file);
        const isImage = file.type.startsWith("image/");
        let previewUrl: string | null = null;

        if (isImage) {
          const cached = urlCacheRef.current.get(key);
          if (cached) {
            previewUrl = cached;
          } else {
            const created = URL.createObjectURL(file);
            urlCacheRef.current.set(key, created);
            previewUrl = created;
          }
        }

        return { file, key, isImage, previewUrl };
      });
    }, [files]);

    React.useEffect(() => {
      const activeKeys = new Set(files.map(fileKey));
      for (const [key, url] of urlCacheRef.current.entries()) {
        if (!activeKeys.has(key)) {
          URL.revokeObjectURL(url);
          urlCacheRef.current.delete(key);
        }
      }
    }, [files]);

    React.useEffect(() => {
      const cache = urlCacheRef.current;
      return () => {
        for (const url of cache.values()) {
          URL.revokeObjectURL(url);
        }
        cache.clear();
      };
    }, []);

    const dropWrapperStateClass =
      status === "error"
        ? "border-red-300 bg-red-50/40"
        : isDragActive
          ? "border-sky-400 bg-sky-50/70"
          : "border-slate-200 bg-transparent";

    return (
      <div className={cn("w-full space-y-2", className)}>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-800">
            {label}
          </label>
          {typeof maxFiles === "number" ? (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px]",
                maxReached ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600",
              )}
            >
              {files.length}/{maxFiles}
            </span>
          ) : null}
        </div>

        {hint ? (
          <p id={hintId} className="text-[11px] text-slate-500/90">
            {hint}
          </p>
        ) : null}

        <input
          ref={setInputNode}
          id={inputId}
          name={name}
          type="file"
          multiple
          accept={accept}
          disabled={disabled || maxReached}
          onChange={handleInputChange}
          className="sr-only"
          aria-describedby={describedBy || undefined}
        />

        <div
          aria-label="File upload area"
          aria-describedby={describedBy || undefined}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border border-dashed p-2 transition-colors",
            dropWrapperStateClass,
            (disabled || maxReached) && "opacity-70",
          )}
        >
          <ul className="flex flex-wrap gap-2">
            {previews.map(({ file, key, isImage, previewUrl }) => (
              <li key={key} className="group relative h-24 w-24 overflow-hidden rounded-md border border-slate-300 bg-white">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isImage && previewUrl && !disabled) {
                      setPreviewModal({ url: previewUrl, name: file.name, key });
                    }
                  }}
                  className={cn("h-full w-full", isImage && previewUrl && !disabled && "cursor-zoom-in")}
                >
                  {isImage && previewUrl ? (
                    <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-1 text-center text-slate-500">
                      <span className="text-base">📄</span>
                      <span className="mt-1 line-clamp-1 text-[10px]">{file.name}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => handleDownloadFile(file, e)}
                  aria-label={`Download ${file.name}`}
                  className="absolute left-1 bottom-1 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <DownloadIcon />
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(key);
                  }}
                  aria-label={`Remove ${file.name}`}
                  className="absolute right-1 top-1 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CloseIcon />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45 px-1 py-0.5 text-[10px] text-white">
                  <p className="truncate">{formatFileSize(file.size)}</p>
                </div>
              </li>
            ))}

            {!maxReached ? (
              <li>
                <div
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  onClick={openPicker}
                  onKeyDown={handleZoneKeyDown}
                  aria-label="Select files"
                  className={cn(
                    "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 bg-white text-slate-600 transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    "hover:border-sky-400 hover:text-sky-600",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="text-xs">Upload</span>
                </div>
              </li>
            ) : null}
          </ul>
        </div>

        {errors.length > 0 ? (
          <div id={errorId} role="alert">
            <ul className="space-y-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
              {errors.map((err, idx) => (
                <li key={`${err}-${idx}`}>- {err}</li>
              ))}
            </ul>
          </div>
        ) : maxReached ? (
          <p id={statusId} className="text-xs text-amber-700">
            Maximum {maxFiles} files selected.
          </p>
        ) : (
          <p id={statusId} className="text-xs text-slate-500">
            {files.length > 0
              ? `${files.length} file(s) selected.${files.some((f) => !f.type.startsWith("image/")) ? " Some files are not previewable." : ""}`
              : placeholder}
          </p>
        )}

        {previewModal ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onClick={() => setPreviewModal(null)}
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white p-2"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={previewModal.url} alt={previewModal.name} className="max-h-[85vh] max-w-[85vw] object-contain" />
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                aria-label="Close preview"
                className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

MultiFileUploader.displayName = "MultiFileUploader";

export { MultiFileUploader };
     