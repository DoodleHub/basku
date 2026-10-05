"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string };

/** Pill-shaped segmented control used as the app's primary navigation. */
export function SegmentedNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 rounded-full border border-line bg-sunken p-[3px]"
    >
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-[34px] min-w-[100px] items-center justify-center rounded-full px-4 sm:min-w-[130px] sm:px-5 text-label font-medium transition-colors",
              active
                ? "bg-brand-600 text-ink-inverse shadow-control"
                : "text-ink-900 hover:bg-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
