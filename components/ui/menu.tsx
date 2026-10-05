"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type MenuProps = {
  /** Renders the trigger; spread the props onto a button. */
  trigger: (props: {
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => ReactNode;
  align?: "start" | "end";
  className?: string;
  children: (close: () => void) => ReactNode;
};

/** Lightweight popover menu: closes on outside click, Escape, or selection. */
export function Menu({
  trigger,
  align = "end",
  className,
  children,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: () => setOpen((o) => !o),
      })}
      {open && (
        <div
          id={id}
          role="menu"
          className={cn(
            "absolute top-full z-20 mt-1.5 min-w-44 rounded-card border border-line bg-surface p-1.5 shadow-popover",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  onSelect,
  tone = "default",
  selected,
  icon,
  children,
}: {
  onSelect: () => void;
  tone?: "default" | "danger";
  selected?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-label transition-colors",
        tone === "danger"
          ? "text-danger-600 hover:bg-danger-50"
          : "text-ink-800 hover:bg-muted",
        selected && "font-semibold text-brand-800",
      )}
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1.5 h-px bg-line-subtle" />;
}
