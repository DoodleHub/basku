"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  CloseIcon,
  CompactInput,
  Divider,
  Field,
  IconButton,
  ImageIcon,
  PlusIcon,
  Textarea,
  TrashIcon,
} from "@/components/ui";
import { recipes, uid, type Ingredient, type Recipe } from "@/lib/store";
import { RecipeImage } from "./recipe-card";

/** Downscale a chosen photo to a JPEG small enough for quick uploads. */
async function downscale(file: File, maxWidth = 1200): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      "image/jpeg",
      0.82,
    ),
  );
}

const blankIngredient = (): Ingredient => ({
  id: uid(),
  name: "",
  quantity: "",
});

export function RecipeEditor({
  recipe,
  onCancel,
  onSaved,
  onDeleted,
}: {
  recipe?: Recipe;
  onCancel: () => void;
  onSaved: (id: string) => void;
  onDeleted?: () => void;
}) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [minutes, setMinutes] = useState(String(recipe?.minutes ?? ""));
  const [image, setImage] = useState(recipe?.image);
  /** A newly chosen photo, uploaded on save. `image` holds its preview URL. */
  const [photo, setPhoto] = useState<Blob>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [instructions, setInstructions] = useState(recipe?.instructions ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients.length ? recipe.ingredients : [blankIngredient()],
  );

  const updateIngredient = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((list) =>
      list.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = recipe?.id ?? uid();
    setSaving(true);
    setError("");
    try {
      await recipes.save(
        {
          id,
          name: name.trim(),
          minutes: Math.min(10000, Math.max(0, parseInt(minutes, 10) || 0)),
          image: photo ? undefined : image,
          instructions: instructions.trim(),
          ingredients: ingredients
            .filter((i) => i.name.trim())
            .map((i) => ({
              ...i,
              name: i.name.trim(),
              quantity: i.quantity.trim(),
            })),
        },
        photo,
      );
      onSaved(id);
    } catch (err) {
      console.error(err);
      setError("Couldn't upload the photo. Try again.");
      setSaving(false);
    }
  };

  const remove = () => {
    if (!recipe || !confirm(`Delete “${recipe.name}”?`)) return;
    recipes.remove(recipe.id);
    onDeleted?.();
  };

  return (
    <Card className="px-[22px] pt-[18px] pb-5">
      <form onSubmit={save}>
        <h2 className="text-title text-ink-900">
          {recipe ? `Edit ${recipe.name}` : "New recipe"}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-2">
            <RecipeImage recipe={{ name, image }} />
            <div className="flex gap-2">
              <label className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-line text-label font-medium text-ink-800 transition-colors hover:bg-muted has-focus-visible:outline-2 has-focus-visible:outline-brand-500">
                <ImageIcon size={16} />
                {image ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const blob = await downscale(file);
                    setPhoto(blob);
                    setImage(URL.createObjectURL(blob));
                  }}
                />
              </label>
              {image && (
                <IconButton
                  label="Remove photo"
                  className="size-9 border border-line"
                  onClick={() => {
                    setImage(undefined);
                    setPhoto(undefined);
                  }}
                >
                  <CloseIcon size={16} />
                </IconButton>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Name" htmlFor="recipe-name">
              <CompactInput
                id="recipe-name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lemon chicken"
              />
            </Field>
            <Field label="Time (minutes)" htmlFor="recipe-minutes">
              <CompactInput
                id="recipe-minutes"
                type="number"
                min={0}
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="30"
                className="max-w-32"
              />
            </Field>
          </div>
        </div>

        <h3 className="mt-5 text-label font-semibold text-ink-900">
          Ingredients
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          {ingredients.map((ing, i) => (
            <li key={ing.id} className="flex items-center gap-2">
              <CompactInput
                aria-label={`Ingredient ${i + 1}`}
                placeholder="Ingredient"
                value={ing.name}
                onChange={(e) =>
                  updateIngredient(ing.id, { name: e.target.value })
                }
                className="min-w-0 flex-[2]"
              />
              <CompactInput
                aria-label={`Quantity for ingredient ${i + 1}`}
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) =>
                  updateIngredient(ing.id, { quantity: e.target.value })
                }
                className="min-w-0 flex-1"
              />
              <IconButton
                label={`Remove ingredient ${i + 1}`}
                className="size-10"
                onClick={() =>
                  setIngredients((list) => list.filter((x) => x.id !== ing.id))
                }
              >
                <TrashIcon size={18} />
              </IconButton>
            </li>
          ))}
        </ul>
        <Button
          variant="link"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={() => setIngredients((list) => [...list, blankIngredient()])}
          className="mt-3 font-semibold"
        >
          Add ingredient
        </Button>

        <Divider className="mt-5" />

        <Field
          label="Instructions"
          htmlFor="recipe-instructions"
          className="mt-4"
        >
          <Textarea
            id="recipe-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="How do you make it?"
          />
        </Field>

        {error && (
          <p role="alert" className="mt-4 text-label text-danger-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2">
          {recipe && (
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon size={16} />}
              onClick={remove}
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving
                ? "Saving…"
                : recipe
                  ? "Save changes"
                  : "Create recipe"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
