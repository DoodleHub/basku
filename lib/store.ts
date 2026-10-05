"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

export type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
};

export type GroceryList = { id: string; name: string; items: GroceryItem[] };

export type Ingredient = { id: string; name: string; quantity: string };

export type Recipe = {
  id: string;
  name: string;
  minutes: number;
  image?: string;
  ingredients: Ingredient[];
  /** Steps separated by newlines; see `instructionSteps`. */
  instructions: string;
};

/** Split stored instructions into their non-empty steps. */
export const instructionSteps = (instructions: string) =>
  instructions
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export type State = {
  status: "loading" | "ready" | "error";
  /** Set when loading or saving to Supabase fails. */
  error?: string;
  lists: GroceryList[];
  activeListId: string;
  recipes: Recipe[];
};

/** The active list is a per-device preference, so it stays in localStorage. */
const ACTIVE_LIST_KEY = "basku:active-list";
const IMAGE_BUCKET = "recipe-images";

export const uid = () => crypto.randomUUID();

const initial: State = {
  status: "loading",
  lists: [],
  activeListId: "",
  recipes: [],
};

let state = initial;
let loadStarted = false;
const listeners = new Set<() => void>();

let client: ReturnType<typeof createClient> | null = null;
const db = () => (client ??= createClient());

export function setState(update: (s: State) => State) {
  state = update(state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loadStarted) {
    loadStarted = true;
    void reload();
  }
  return () => listeners.delete(listener);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initial),
  );
}

/** Drops cached data, e.g. on sign-out, so the next user starts fresh. */
export function resetStore() {
  loadStarted = false;
  queue = Promise.resolve();
  setState(() => initial);
}

/* ---------- Sync with Supabase ---------- */

/**
 * Writes run one at a time, in the order the UI made them, so a quick
 * "add item, then tick it" can't reach the server out of order.
 */
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => PromiseLike<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

/** Saves in the background. On failure, shows an error and reloads. */
function persist(
  label: string,
  request: () => PromiseLike<{ error: { message: string } | null }>,
) {
  void enqueue(request).then(
    ({ error }) => error && fail(label, error),
    (error: unknown) => fail(label, error),
  );
}

function fail(label: string, error: unknown) {
  console.error(`Couldn't ${label}`, error);
  setState((s) => ({ ...s, error: `Couldn't ${label}. Showing saved data.` }));
  void reload();
}

export function dismissError() {
  setState((s) => ({ ...s, error: undefined }));
}

function readActiveList() {
  try {
    return localStorage.getItem(ACTIVE_LIST_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeActiveList(id: string) {
  try {
    localStorage.setItem(ACTIVE_LIST_KEY, id);
  } catch {
    // Storage unavailable: the first list is used next time.
  }
}

/** Replaces local state with what's in Supabase. */
export function reload() {
  return enqueue(async () => {
    const sb = db();
    const [listsRes, recipesRes] = await Promise.all([
      sb
        .from("grocery_lists")
        .select("id, name, grocery_items(id, name, quantity, checked)")
        .order("created_at")
        .order("created_at", { referencedTable: "grocery_items" }),
      sb
        .from("recipes")
        .select("id, name, minutes, image_url, instructions, ingredients")
        .order("created_at"),
    ]);

    if (listsRes.error || recipesRes.error) {
      console.error("Couldn't load data", listsRes.error ?? recipesRes.error);
      setState((s) => ({
        ...s,
        status: s.status === "ready" ? "ready" : "error",
        error: "Couldn't load your lists and recipes.",
      }));
      return;
    }

    const lists: GroceryList[] = listsRes.data.map(
      ({ grocery_items, ...l }) => ({ ...l, items: grocery_items }),
    );

    // Every account has at least one list to add items to.
    if (lists.length === 0) {
      const list = { id: uid(), name: "Groceries" };
      const { error } = await sb.from("grocery_lists").insert(list);
      if (error) console.error("Couldn't create a starter list", error);
      lists.push({ ...list, items: [] });
    }

    const recipes: Recipe[] = recipesRes.data.map((r) => ({
      id: r.id,
      name: r.name,
      minutes: r.minutes,
      image: r.image_url ?? undefined,
      instructions: r.instructions,
      ingredients: r.ingredients as Ingredient[],
    }));

    const saved = readActiveList();
    setState((s) => ({
      ...s,
      status: "ready",
      lists,
      recipes,
      activeListId: lists.some((l) => l.id === saved) ? saved : lists[0].id,
    }));
  });
}

/* ---------- Grocery lists ---------- */

const updateList = (listId: string, fn: (l: GroceryList) => GroceryList) =>
  setState((s) => ({
    ...s,
    lists: s.lists.map((l) => (l.id === listId ? fn(l) : l)),
  }));

/** Item names match regardless of case and surrounding spaces. */
export const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const setActive = (id: string) => {
  writeActiveList(id);
  setState((s) => ({ ...s, activeListId: id }));
};

export const groceries = {
  setActive,

  createList: (name: string) => {
    const id = uid();
    setState((s) => ({ ...s, lists: [...s.lists, { id, name, items: [] }] }));
    setActive(id);
    persist("create the list", () =>
      db().from("grocery_lists").insert({ id, name }),
    );
  },

  renameList: (id: string, name: string) => {
    updateList(id, (l) => ({ ...l, name }));
    persist("rename the list", () =>
      db().from("grocery_lists").update({ name }).eq("id", id),
    );
  },

  deleteList: (id: string) => {
    let replacement: GroceryList | undefined;
    setState((s) => {
      const lists = s.lists.filter((l) => l.id !== id);
      if (lists.length === 0) {
        replacement = { id: uid(), name: "Groceries", items: [] };
        lists.push(replacement);
      }
      return { ...s, lists };
    });
    if (state.activeListId === id) setActive(state.lists[0].id);

    persist("delete the list", () =>
      db().from("grocery_lists").delete().eq("id", id),
    );
    if (replacement) {
      const { id: newId, name } = replacement;
      persist("create the list", () =>
        db().from("grocery_lists").insert({ id: newId, name }),
      );
    }
  },

  /**
   * Adds an item. If the name is already on the list, that item is
   * un-checked (and given the new quantity, if one was typed) instead.
   */
  addItem: (listId: string, name: string, quantity = "") => {
    const existing = state.lists
      .find((l) => l.id === listId)
      ?.items.find((i) => sameName(i.name, name));
    if (existing) {
      groceries.updateItem(listId, existing.id, {
        checked: false,
        ...(quantity && { quantity }),
      });
      return;
    }
    const item = { id: uid(), name, quantity, checked: false };
    updateList(listId, (l) => ({ ...l, items: [...l.items, item] }));
    persist("add the item", () =>
      db()
        .from("grocery_items")
        .insert({ ...item, list_id: listId }),
    );
  },

  updateItem: (listId: string, itemId: string, patch: Partial<GroceryItem>) => {
    const { name, quantity, checked } = patch;
    updateList(listId, (l) => ({
      ...l,
      items: l.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }));
    persist("update the item", () =>
      db()
        .from("grocery_items")
        .update({ name, quantity, checked })
        .eq("id", itemId),
    );
  },

  removeItem: (listId: string, itemId: string) => {
    updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((i) => i.id !== itemId),
    }));
    persist("remove the item", () =>
      db().from("grocery_items").delete().eq("id", itemId),
    );
  },

  clearChecked: (listId: string) => {
    updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((i) => !i.checked),
    }));
    persist("clear checked items", () =>
      db()
        .from("grocery_items")
        .delete()
        .eq("list_id", listId)
        .eq("checked", true),
    );
  },

  /**
   * Adds ingredients to a list. Names already on the list are un-checked
   * instead of duplicated. Returns how many rows were added or restored.
   */
  addIngredients: (listId: string, ingredients: Ingredient[]) => {
    const added: GroceryItem[] = [];
    const restored: string[] = [];
    updateList(listId, (l) => {
      const items = [...l.items];
      for (const ing of ingredients) {
        const existing = items.findIndex((i) => sameName(i.name, ing.name));
        if (existing === -1) {
          const item = {
            id: uid(),
            name: ing.name,
            quantity: ing.quantity,
            checked: false,
          };
          items.push(item);
          added.push(item);
        } else if (items[existing].checked) {
          items[existing] = { ...items[existing], checked: false };
          restored.push(items[existing].id);
        }
      }
      return { ...l, items };
    });

    if (added.length > 0) {
      persist("add the ingredients", () =>
        db()
          .from("grocery_items")
          .insert(added.map((i) => ({ ...i, list_id: listId }))),
      );
    }
    if (restored.length > 0) {
      persist("add the ingredients", () =>
        db()
          .from("grocery_items")
          .update({ checked: false })
          .in("id", restored),
      );
    }
    return added.length + restored.length;
  },
};

/* ---------- Recipes ---------- */

const publicImagePrefix = `/storage/v1/object/public/${IMAGE_BUCKET}/`;

/** Uploads a photo to the signed-in user's folder and returns its URL. */
async function uploadPhoto(photo: Blob) {
  const sb = db();
  const { data: auth } = await sb.auth.getClaims();
  if (!auth) throw new Error("Not signed in");
  const path = `${auth.claims.sub}/${uid()}.jpg`;
  const { error } = await sb.storage
    .from(IMAGE_BUCKET)
    .upload(path, photo, { contentType: photo.type || "image/jpeg" });
  if (error) throw error;
  return sb.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes a photo we uploaded. Other URLs (e.g. bundled images) are left alone. */
function removePhoto(url: string | undefined) {
  const at = url?.indexOf(publicImagePrefix) ?? -1;
  if (!url || at === -1) return;
  const path = decodeURIComponent(url.slice(at + publicImagePrefix.length));
  persist("remove the old photo", () =>
    db().storage.from(IMAGE_BUCKET).remove([path]),
  );
}

export const recipes = {
  /** Saves a recipe; pass `photo` to upload a new image for it. */
  save: async (recipe: Recipe, photo?: Blob) => {
    if (photo) recipe = { ...recipe, image: await uploadPhoto(photo) };
    const previous = state.recipes.find((r) => r.id === recipe.id);

    setState((s) => ({
      ...s,
      recipes: previous
        ? s.recipes.map((r) => (r.id === recipe.id ? recipe : r))
        : [...s.recipes, recipe],
    }));

    const { id, name, minutes, image, instructions, ingredients } = recipe;
    persist("save the recipe", () =>
      db()
        .from("recipes")
        .upsert({
          id,
          name,
          minutes,
          instructions,
          image_url: image ?? null,
          ingredients: ingredients as unknown as Json,
        }),
    );
    if (previous?.image !== image) removePhoto(previous?.image);
  },

  remove: (id: string) => {
    const recipe = state.recipes.find((r) => r.id === id);
    setState((s) => ({ ...s, recipes: s.recipes.filter((r) => r.id !== id) }));
    persist("delete the recipe", () =>
      db().from("recipes").delete().eq("id", id),
    );
    removePhoto(recipe?.image);
  },
};
