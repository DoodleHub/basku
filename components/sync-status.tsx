"use client";

import { Button, CloseIcon, IconButton } from "@/components/ui";
import { dismissError, reload, useStore } from "@/lib/store";

/** Loading / failed-to-load placeholder shown before data arrives. */
export function LoadState() {
  const status = useStore((s) => s.status);
  const error = useStore((s) => s.error);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-label text-ink-600">{error}</p>
        <Button variant="outline" size="sm" onClick={() => void reload()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <p role="status" className="px-4 py-16 text-center text-label text-ink-500">
      Loading…
    </p>
  );
}

/** Banner for a save that failed after the data loaded. */
export function SyncError() {
  const status = useStore((s) => s.status);
  const error = useStore((s) => s.error);
  if (status !== "ready" || !error) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-2 rounded-control bg-danger-50 py-1 pr-1 pl-3 text-label text-danger-600"
    >
      <span className="flex-1">{error}</span>
      <IconButton label="Dismiss" className="size-8" onClick={dismissError}>
        <CloseIcon size={16} />
      </IconButton>
    </div>
  );
}
