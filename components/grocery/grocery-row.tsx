"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  CompactInput,
  IconButton,
  Menu,
  MenuItem,
  MoreVerticalIcon,
  PencilIcon,
  RoundCheckbox,
  TrashIcon,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { groceries, type GroceryItem } from "@/lib/store";

export function GroceryRow({
  listId,
  item,
  first,
}: {
  listId: string;
  item: GroceryItem;
  first: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);

  const startEdit = () => {
    setName(item.name);
    setQuantity(item.quantity);
    setEditing(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    groceries.updateItem(listId, item.id, {
      name: name.trim(),
      quantity: quantity.trim(),
    });
    setEditing(false);
  };

  return (
    <li className="flex items-center pl-[18px]">
      <RoundCheckbox
        checked={item.checked}
        label={`Mark ${item.name} as ${item.checked ? "not bought" : "bought"}`}
        onChange={(checked) =>
          groceries.updateItem(listId, item.id, { checked })
        }
      />
      <div
        className={cn(
          "ml-3.5 flex min-h-[59px] flex-1 items-center gap-3 pr-4 pl-[15px]",
          !first && "border-t border-line-subtle",
        )}
      >
        {editing ? (
          <form onSubmit={save} className="flex flex-1 items-center gap-2 py-2">
            <CompactInput
              autoFocus
              aria-label="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="min-w-0 flex-[2]"
            />
            <CompactInput
              aria-label="Quantity"
              placeholder="Qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="min-w-0 flex-1"
            />
            <Button type="submit" size="sm">
              Save
            </Button>
          </form>
        ) : (
          <>
            <span
              className={cn(
                "flex-1 truncate text-body font-medium",
                item.checked ? "text-ink-500 line-through" : "text-ink-900",
              )}
            >
              {item.name}
            </span>
            <span className="mr-7 shrink-0 text-control text-ink-500">
              {item.quantity}
            </span>
            <Menu
              trigger={(props) => (
                <IconButton
                  {...props}
                  label={`Options for ${item.name}`}
                  className="size-8 text-ink-800"
                >
                  <MoreVerticalIcon size={20} />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem
                    icon={<PencilIcon size={16} />}
                    onSelect={() => {
                      close();
                      startEdit();
                    }}
                  >
                    Edit item
                  </MenuItem>
                  <MenuItem
                    tone="danger"
                    icon={<TrashIcon size={16} />}
                    onSelect={() => {
                      close();
                      groceries.removeItem(listId, item.id);
                    }}
                  >
                    Delete
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        )}
      </div>
    </li>
  );
}
