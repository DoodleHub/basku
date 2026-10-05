import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CheckIcon, LeafIcon, UserIcon } from "./icons";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-line bg-surface", className)}
      {...props}
    />
  );
}

/** Round checkbox from the grocery list. */
export function RoundCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors",
        checked
          ? "border-brand-600 bg-brand-600 text-ink-inverse hover:bg-brand-700"
          : "border-ink-400 bg-surface hover:border-brand-600 hover:bg-brand-50",
      )}
    >
      {checked && <CheckIcon size={16} strokeWidth={2.5} />}
    </button>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LeafIcon size={34} className="text-brand-600" />
      <span className="text-[1.75rem] leading-none font-semibold tracking-[-0.02em] text-ink-900">
        basku
      </span>
    </span>
  );
}

export function Avatar({ label = "Account" }: { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-10 cursor-pointer items-end justify-center overflow-hidden rounded-full border border-line bg-muted text-ink-400 transition-colors hover:text-ink-500"
    >
      <UserIcon size={24} className="mb-[7px]" />
    </button>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <hr className={cn("border-0 border-t border-line-subtle", className)} />
  );
}
