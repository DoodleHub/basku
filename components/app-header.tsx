import Link from "next/link";
import { Avatar, Logo, SegmentedNav } from "@/components/ui";

const nav = [
  { href: "/", label: "Grocery List" },
  { href: "/recipes", label: "Recipes" },
];

export function AppHeader() {
  return (
    <header className="border-b border-line bg-canvas">
      <div className="grid h-[78px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-7">
        <Link href="/" aria-label="basku home" className="justify-self-start">
          <Logo className="max-sm:[&>span:last-child]:hidden" />
        </Link>
        <SegmentedNav items={nav} />
        <div className="justify-self-end">
          <Avatar />
        </div>
      </div>
    </header>
  );
}
