"use client";

import { logout } from "@/app/(auth)/actions";
import { Avatar, Menu, MenuItem, MenuSeparator } from "@/components/ui";
import { resetStore } from "@/lib/store";

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
          <MenuItem
            onSelect={() => {
              resetStore();
              void logout();
            }}
          >
            Log out
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
