"use client";

import { useState } from "react";
import { Button, Modal, PlusIcon, SearchInput } from "@/components/ui";
import { LoadState, SyncError } from "@/components/sync-status";
import { useStore } from "@/lib/store";
import { RecipeCard } from "./recipe-card";
import { RecipeDetail } from "./recipe-detail";
import { RecipeEditor } from "./recipe-editor";
import { RecipesSkeleton } from "./recipes-skeleton";

type Mode = "view" | "edit" | "create";

export function RecipesView() {
  const recipes = useStore((s) => s.recipes);
  const status = useStore((s) => s.status);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  /** Whether the new-recipe form has input that an outside tap would lose. */
  const [draftDirty, setDraftDirty] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = q
    ? recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
      )
    : recipes;

  const selected = recipes.find((r) => r.id === selectedId) ?? recipes[0];

  if (status !== "ready") return <LoadState skeleton={<RecipesSkeleton />} />;

  return (
    <div className="mx-auto w-full max-w-[766px] px-4 pt-[34px] pb-16">
      <SyncError />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-display text-ink-900">My recipes</h1>
        <Button
          size="lg"
          icon={<PlusIcon size={22} />}
          onClick={() => {
            setDraftDirty(false);
            setMode("create");
          }}
        >
          Create recipe
        </Button>
      </div>

      <SearchInput
        className="mt-[15px]"
        placeholder="Search recipes..."
        aria-label="Search recipes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {visible.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-[15px] min-[480px]:grid-cols-2 sm:grid-cols-3">
          {visible.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                selected={recipe.id === selected?.id}
                onSelect={() => {
                  setSelectedId(recipe.id);
                  setMode("view");
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-center text-label text-ink-500">
          {recipes.length === 0
            ? "No recipes yet. Create your first one."
            : `No recipes match “${query}”.`}
        </p>
      )}

      <div className="mt-[15px]">
        {selected && mode === "edit" ? (
          <RecipeEditor
            key={selected.id}
            recipe={selected}
            onCancel={() => setMode("view")}
            onSaved={() => setMode("view")}
            onDeleted={() => {
              setSelectedId(null);
              setMode("view");
            }}
          />
        ) : selected ? (
          <RecipeDetail
            key={selected.id}
            recipe={selected}
            onEdit={() => setMode("edit")}
          />
        ) : null}
      </div>

      <Modal
        open={mode === "create"}
        onClose={() => setMode("view")}
        dismissible={!draftDirty}
        className="w-[min(640px,calc(100vw-32px))]"
      >
        {mode === "create" && (
          <RecipeEditor
            bare
            onDirtyChange={setDraftDirty}
            onCancel={() => setMode("view")}
            onSaved={(id) => {
              setSelectedId(id);
              setMode("view");
            }}
          />
        )}
      </Modal>
    </div>
  );
}
