import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/auth/account-menu";
import { Logo, SegmentedNav, Skeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/", label: "Grocery List" },
  { href: "/recipes", label: "Recipes" },
];

/** Reads the session separately so the rest of the header isn't held up. */
async function Account() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return <AccountMenu email={data?.claims.email} />;
}

export function AppHeader() {
  return (
    <header className="border-b border-line bg-canvas">
      <div className="grid h-[78px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-7">
        <Link href="/" aria-label="basku home" className="justify-self-start">
          <Logo className="max-sm:[&>span:last-child]:hidden" />
        </Link>
        <SegmentedNav items={nav} />
        <div className="justify-self-end">
          <Suspense fallback={<Skeleton className="size-10 rounded-full" />}>
            <Account />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
