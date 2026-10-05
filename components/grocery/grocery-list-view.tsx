"use client";

import { useState, type FormEvent } from "react";
import {
  Card,
  CheckIcon,
  ChevronDownIcon,
  CompactInput,
  Dialog,
  Field,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuSeparator,
  PlusIcon,
  Button,
} from "@/components/ui";
import { LoadState, SyncError } from "@/components/sync-status";
import { groceries, useStore } from "@/lib/store";
import { GroceryListSkeleton } from "./grocery-list-skeleton";
import { GroceryRow } from "./grocery-row";

type DialogKind = "new" | "rename" | "delete" | null;

/** "Eggs, 12" → { name: "Eggs", quantity: "12" } */
function parseItem(text: string) {
  const [name, ...rest] = text.split(",");
  return { name: name.trim(), quantity: rest.join(",").trim() };
}

export function GroceryListView() {
  const lists = useStore((s) => s.lists);
  const activeId = useStore((s) => s.activeListId);
  const list = lists.find((l) => l.id === activeId) ?? lists[0];

  const [draft, setDraft] = useState("");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [listName, setListName] = useState("");

  if (!list) return <LoadState skeleton={<GroceryListSkeleton />} />;

  const checkedCount = list.items.filter((i) => i.checked).length;

  const addItem = (e: FormEvent) => {
    e.preventDefault();
    const { name, quantity } = parseItem(draft);
    if (!name) return;
    groceries.addItem(list.id, name, quantity);
    setDraft("");
  };

  const openDialog = (kind: Exclude<DialogKind, null>) => {
    setListName(kind === "rename" ? list.name : "");
    setDialog(kind);
  };

  const submitDialog = () => {
    const name = listName.trim();
    if (dialog === "new" && name) groceries.createList(name);
    if (dialog === "rename" && name) groceries.renameList(list.id, name);
    if (dialog === "delete") groceries.deleteList(list.id);
    if (dialog === "delete" || name) setDialog(null);
  };

  return (
    <div className="mx-auto w-full max-w-[546px] px-4 pt-12 pb-16">
      <SyncError />
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-display text-ink-900">{list.name}</h1>
          <Menu
            align="start"
            trigger={(props) => (
              <IconButton
                {...props}
                label="Switch list"
                variant="subtle"
                className="h-8 w-9"
              >
                <ChevronDownIcon size={18} />
              </IconButton>
            )}
          >
            {(close) => (
              <>
                <p className="px-2.5 pt-1 pb-1.5 text-caption font-medium text-ink-500">
                  Your lists
                </p>
                {lists.map((l) => (
                  <MenuItem
                    key={l.id}
                    selected={l.id === list.id}
                    icon={
                      <CheckIcon
                        size={16}
                        className={l.id === list.id ? "" : "invisible"}
                      />
                    }
                    onSelect={() => {
                      groceries.setActive(l.id);
                      close();
                    }}
                  >
                    {l.name}
                  </MenuItem>
                ))}
                <MenuSeparator />
                <MenuItem
                  onSelect={() => {
                    close();
                    openDialog("rename");
                  }}
                >
                  Rename list
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    close();
                    groceries.clearChecked(list.id);
                  }}
                >
                  Clear checked items
                </MenuItem>
                <MenuItem
                  tone="danger"
                  onSelect={() => {
                    close();
                    openDialog("delete");
                  }}
                >
                  Delete list
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
        <Button
          variant="link"
          size="sm"
          icon={<PlusIcon size={18} />}
          onClick={() => openDialog("new")}
          className="font-semibold"
        >
          New list
        </Button>
      </div>

      <form onSubmit={addItem} className="mt-6 flex">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item..."
          aria-label="Add an item (use a comma for quantity, e.g. Eggs, 12)"
          className="rounded-r-none"
        />
        <IconButton
          type="submit"
          label="Add item"
          variant="primary"
          className="relative -ml-0.5 h-[52px] w-14 rounded-l-none"
        >
          <PlusIcon size={26} strokeWidth={1.75} />
        </IconButton>
      </form>

      <Card className="mt-[22px] py-0.5">
        {list.items.length === 0 ? (
          <p className="px-6 py-10 text-center text-label text-ink-500">
            Nothing here yet. Add your first item above.
          </p>
        ) : (
          <ul>
            {list.items.map((item, i) => (
              <GroceryRow
                key={item.id}
                listId={list.id}
                item={item}
                first={i === 0}
              />
            ))}
          </ul>
        )}
      </Card>

      <p className="mt-[26px] text-caption text-ink-500">
        {checkedCount} of {list.items.length} items checked
      </p>

      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={
          dialog === "new"
            ? "New list"
            : dialog === "rename"
              ? "Rename list"
              : "Delete list?"
        }
        submitLabel={
          dialog === "new"
            ? "Create list"
            : dialog === "rename"
              ? "Save"
              : "Delete"
        }
        tone={dialog === "delete" ? "danger" : "primary"}
        onSubmit={submitDialog}
      >
        {dialog === "delete" ? (
          <p className="text-label text-ink-600">
            &ldquo;{list.name}&rdquo; and its {list.items.length} items will be
            removed.
          </p>
        ) : (
          <Field label="List name" htmlFor="list-name">
            <CompactInput
              id="list-name"
              autoFocus
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Party supplies"
            />
          </Field>
        )}
      </Dialog>
    </div>
  );
}
