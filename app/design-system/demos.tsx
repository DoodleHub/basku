"use client";

import { useState } from "react";
import {
  Card,
  IconButton,
  Menu,
  MenuItem,
  MenuSeparator,
  MoreVerticalIcon,
  PencilIcon,
  RoundCheckbox,
  SegmentedNav,
  TrashIcon,
} from "@/components/ui";

/** Interactive components for the design system page. */
export function DesignSystemDemos() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title text-ink-900">Controls</h2>
      <div className="flex flex-wrap items-start gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-caption text-ink-500">Segmented nav</p>
          <SegmentedNav
            items={[
              { href: "/design-system", label: "Active" },
              { href: "/recipes", label: "Inactive" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption text-ink-500">Round checkbox</p>
          <div className="flex gap-3">
            <RoundCheckbox
              checked={a}
              onChange={setA}
              label="Checked example"
            />
            <RoundCheckbox
              checked={b}
              onChange={setB}
              label="Unchecked example"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption text-ink-500">Menu</p>
          <Menu
            align="start"
            trigger={(props) => (
              <IconButton
                {...props}
                label="Open menu"
                className="size-8 text-ink-800"
              >
                <MoreVerticalIcon size={20} />
              </IconButton>
            )}
          >
            {(close) => (
              <>
                <MenuItem icon={<PencilIcon size={16} />} onSelect={close}>
                  Edit item
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  tone="danger"
                  icon={<TrashIcon size={16} />}
                  onSelect={close}
                >
                  Delete
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>
      <Card className="max-w-sm p-5">
        <p className="text-body font-semibold text-ink-900">Card</p>
        <p className="mt-1 text-label text-ink-600">
          12px radius, surface fill, 1px line border. No shadow at rest.
        </p>
      </Card>
    </section>
  );
}
