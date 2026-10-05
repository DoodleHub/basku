import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Pulsing placeholder block. Size and shape it with `className`. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-control bg-muted motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** Wraps a page skeleton so screen readers hear one "Loading…" announcement. */
export function LoadingRegion({
  label = "Loading…",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-busy className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
