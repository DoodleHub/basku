"use client";

import { useSyncExternalStore } from "react";

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
  instructions: string;
};

export type State = {
  lists: GroceryList[];
  activeListId: string;
  recipes: Recipe[];
};

const STORAGE_KEY = "basku:v1";

export const uid = () => crypto.randomUUID();

const item = (
  id: string,
  name: string,
  quantity: string,
  checked = false,
): GroceryItem => ({ id, name, quantity, checked });

const ing = (id: string, name: string, quantity: string): Ingredient => ({
  id,
  name,
  quantity,
});

const seed: State = {
  activeListId: "weekly",
  lists: [
    {
      id: "weekly",
      name: "Weekly groceries",
      items: [
        item("i1", "Bananas", "1 bunch", true),
        item("i2", "Avocados", "3"),
        item("i3", "Eggs", "12"),
        item("i4", "Oat milk", "1 carton"),
        item("i5", "Baby spinach", "1 bag"),
        item("i6", "Sourdough", "1 loaf"),
      ],
    },
  ],
  recipes: [
    {
      id: "r1",
      name: "Lemon chicken",
      minutes: 30,
      image: "/recipes/lemon-chicken.jpg",
      ingredients: [
        ing("g1", "Chicken breast", "2 pieces"),
        ing("g2", "Lemon", "1"),
        ing("g3", "Olive oil", "2 tbsp"),
      ],
      instructions:
        "Season the chicken, sear until golden, then finish with lemon.",
    },
    {
      id: "r2",
      name: "Creamy tomato pasta",
      minutes: 20,
      image: "/recipes/creamy-tomato-pasta.jpg",
      ingredients: [
        ing("g4", "Penne", "250 g"),
        ing("g5", "Crushed tomatoes", "1 can"),
        ing("g6", "Heavy cream", "100 ml"),
        ing("g7", "Parmesan", "30 g"),
        ing("g8", "Fresh basil", "1 handful"),
      ],
      instructions:
        "Cook the penne. Simmer tomatoes with cream, toss with pasta, top with parmesan and basil.",
    },
    {
      id: "r3",
      name: "Avocado toast",
      minutes: 10,
      image: "/recipes/avocado-toast.jpg",
      ingredients: [
        ing("g9", "Sourdough", "2 slices"),
        ing("g10", "Avocados", "1"),
        ing("g11", "Microgreens", "1 handful"),
        ing("g12", "Chili flakes", "1 pinch"),
      ],
      instructions:
        "Toast the bread, mash the avocado with salt, spread and top with microgreens and chili.",
    },
  ],
};

let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? (JSON.parse(raw) as State) : seed;
  } catch {
    state = seed;
  }
  return state;
}

export function setState(update: (s: State) => State) {
  state = update(load());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — keep the in-memory copy.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(load()),
    () => select(seed),
  );
}

/* ---------- Grocery lists ---------- */

const updateList = (listId: string, fn: (l: GroceryList) => GroceryList) =>
  setState((s) => ({
    ...s,
    lists: s.lists.map((l) => (l.id === listId ? fn(l) : l)),
  }));

export const groceries = {
  setActive: (id: string) => setState((s) => ({ ...s, activeListId: id })),

  createList: (name: string) => {
    const id = uid();
    setState((s) => ({
      ...s,
      activeListId: id,
      lists: [...s.lists, { id, name, items: [] }],
    }));
  },

  renameList: (id: string, name: string) =>
    updateList(id, (l) => ({ ...l, name })),

  deleteList: (id: string) =>
    setState((s) => {
      const lists = s.lists.filter((l) => l.id !== id);
      if (lists.length === 0)
        lists.push({ id: uid(), name: "Groceries", items: [] });
      return {
        ...s,
        lists,
        activeListId: s.activeListId === id ? lists[0].id : s.activeListId,
      };
    }),

  addItem: (listId: string, name: string, quantity = "") =>
    updateList(listId, (l) => ({
      ...l,
      items: [...l.items, { id: uid(), name, quantity, checked: false }],
    })),

  updateItem: (listId: string, itemId: string, patch: Partial<GroceryItem>) =>
    updateList(listId, (l) => ({
      ...l,
      items: l.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    })),

  removeItem: (listId: string, itemId: string) =>
    updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((i) => i.id !== itemId),
    })),

  clearChecked: (listId: string) =>
    updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((i) => !i.checked),
    })),

  /**
   * Adds ingredients to a list. Names already on the list are un-checked
   * instead of duplicated. Returns how many rows were added or restored.
   */
  addIngredients: (listId: string, ingredients: Ingredient[]) => {
    let changed = 0;
    updateList(listId, (l) => {
      const items = [...l.items];
      for (const ing of ingredients) {
        const existing = items.findIndex(
          (i) => i.name.trim().toLowerCase() === ing.name.trim().toLowerCase(),
        );
        if (existing === -1) {
          items.push({
            id: uid(),
            name: ing.name,
            quantity: ing.quantity,
            checked: false,
          });
          changed++;
        } else if (items[existing].checked) {
          items[existing] = { ...items[existing], checked: false };
          changed++;
        }
      }
      return { ...l, items };
    });
    return changed;
  },
};

/* ---------- Recipes ---------- */

export const recipes = {
  save: (recipe: Recipe) =>
    setState((s) => ({
      ...s,
      recipes: s.recipes.some((r) => r.id === recipe.id)
        ? s.recipes.map((r) => (r.id === recipe.id ? recipe : r))
        : [...s.recipes, recipe],
    })),

  remove: (id: string) =>
    setState((s) => ({ ...s, recipes: s.recipes.filter((r) => r.id !== id) })),
};
