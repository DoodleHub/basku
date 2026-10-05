import Link from "next/link";
import { AccountMenu } from "@/components/auth/account-menu";
import { Logo, SegmentedNav } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/", label: "Grocery List" },
  { href: "/recipes", label: "Recipes" },
];

export async function AppHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;

  return (
    <header className="border-b border-line bg-canvas">
      <div className="grid h-[78px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-7">
        <Link href="/" aria-label="basku home" className="justify-self-start">
          <Logo className="max-sm:[&>span:last-child]:hidden" />
        </Link>
        <SegmentedNav items={nav} />
        <div className="justify-self-end">
          <AccountMenu email={email} />
        </div>
      </div>
    </header>
  );
}
