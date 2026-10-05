"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { Button, IconButton } from "./button";
import { CloseIcon } from "./icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSubmit: () => void;
  tone?: "primary" | "danger";
  children?: ReactNode;
};

/** Modal form dialog built on the native <dialog> element. */
export function Dialog({
  open,
  onClose,
  title,
  submitLabel,
  onSubmit,
  tone = "primary",
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-card border border-line bg-surface p-0 text-ink-800 shadow-popover"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-title text-ink-900">{title}</h2>
          <IconButton label="Close" onClick={onClose} className="-mr-2 size-9">
            <CloseIcon size={18} />
          </IconButton>
        </div>
        {children}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className={
              tone === "danger"
                ? "bg-danger-600 hover:bg-danger-600/90 active:bg-danger-600"
                : undefined
            }
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
