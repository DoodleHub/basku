"use client";

import { logout } from "@/app/(auth)/actions";
import { Avatar, Menu, MenuItem, MenuSeparator } from "@/components/ui";

export function AccountMenu({ email }: { email?: string }) {
  return (
    <Menu trigger={(props) => <Avatar {...props} />}>
      {() => (
        <>
          {email && (
            <>
              <p className="truncate px-2.5 py-2 text-label text-ink-500">
                {email}
              </p>
              <MenuSeparator />
            </>
          )}
          <MenuItem onSelect={() => logout()}>Log out</MenuItem>
        </>
      )}
    </Menu>
  );
}
