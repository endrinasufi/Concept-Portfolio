"use client";

import { ImagePlus } from "lucide-react";
import { useId, useRef, useState } from "react";

export function AdminUploadDropzone({
  label = "Upload",
  hint,
  accept = "image/*",
  multiple = false,
  disabled = false,
  busy = false,
  variant = "zone",
  className = "",
  form,
  onFiles,
}: {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  busy?: boolean;
  variant?: "zone" | "button";
  className?: string;
  form?: string;
  onFiles: (files: FileList | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isDisabled = disabled || busy;
  const text = busy ? "Loading…" : label;

  function handleFiles(files: FileList | null) {
    if (isDisabled) return;
    onFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept}
      multiple={multiple}
      form={form}
      disabled={isDisabled}
      className="hidden"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  if (variant === "button") {
    return (
      <label
        htmlFor={inputId}
        className={`admin-upload-btn ${isDisabled ? "pointer-events-none opacity-60" : ""} ${className}`}
      >
        <ImagePlus size={13} />
        {text}
        {input}
      </label>
    );
  }

  return (
    <label
      htmlFor={inputId}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!isDisabled) setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDisabled) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`admin-upload-zone ${dragging ? "is-dragging" : ""} ${isDisabled ? "pointer-events-none opacity-60" : ""} ${className}`}
    >
      <ImagePlus size={18} />
      <span>{text}</span>
      {hint ? <span className="admin-upload-hint">{hint}</span> : null}
      {input}
    </label>
  );
}
