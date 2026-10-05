"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "./button";
import { CloseIcon } from "./icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSubmit: () => void;
  tone?: "primary" | "danger";
  /** Whether a tap outside the panel closes it. Escape always does. */
  dismissible?: boolean;
  children?: ReactNode;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Whether a tap outside the panel closes it. Escape always does. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Modal shell built on the native <dialog> element. Closes on Escape and,
 * when `dismissible`, on taps outside the panel.
 */
export function Modal({
  open,
  onClose,
  dismissible = true,
  className,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Only dismiss when the press both starts and ends on the backdrop, so
  // dragging out of an input (e.g. selecting text) doesn't close the dialog.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (
          dismissible &&
          pressedBackdrop.current &&
          e.target === e.currentTarget
        )
          onClose();
        pressedBackdrop.current = false;
      }}
      className={cn(
        "m-auto rounded-card border border-line bg-surface p-0 text-ink-800 shadow-popover",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

/** Modal form dialog. */
export function Dialog({
  open,
  onClose,
  title,
  submitLabel,
  onSubmit,
  tone = "primary",
  dismissible,
  children,
}: DialogProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      className="w-[min(420px,calc(100vw-32px))]"
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
    </Modal>
  );
}
