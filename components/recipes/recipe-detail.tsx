"use client";

import { useRef, useState } from "react";
import { Button, Card, CartIcon, Divider, PencilIcon } from "@/components/ui";
import {
  groceries,
  instructionSteps,
  useStore,
  type Recipe,
} from "@/lib/store";

export function RecipeDetail({
  recipe,
  onEdit,
}: {
  recipe: Recipe;
  onEdit: () => void;
}) {
  const list = useStore(
    (s) => s.lists.find((l) => l.id === s.activeListId) ?? s.lists[0],
  );
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const steps = instructionSteps(recipe.instructions);

  const addToList = () => {
    const added = groceries.addIngredients(list.id, recipe.ingredients);
    setStatus(
      added === 0
        ? `Already on ${list.name}`
        : `Added ${added} ${added === 1 ? "item" : "items"} to ${list.name}`,
    );
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 3500);
  };

  return (
    <Card className="px-[22px] pt-[18px] pb-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title text-ink-900">{recipe.name}</h2>
        <Button
          variant="link"
          size="sm"
          icon={<PencilIcon size={16} />}
          onClick={onEdit}
          className="gap-2"
        >
          Edit
        </Button>
      </div>

      <h3 className="mt-3 text-label font-semibold text-ink-900">
        Ingredients
      </h3>
      {recipe.ingredients.length > 0 ? (
        <table className="mt-1.5 w-full max-w-[345px] text-label">
          <tbody>
            {recipe.ingredients.map((ing, i) => (
              <tr
                key={ing.id}
                className={i > 0 ? "border-t border-line-subtle" : ""}
              >
                <td className="h-[29px] pr-4 text-ink-600">{ing.name}</td>
                <td className="w-[64px] text-ink-600">{ing.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-1.5 text-label text-ink-500">No ingredients yet.</p>
      )}

      <div className="mt-[11px] flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          variant="outline"
          size="sm"
          icon={<CartIcon size={20} />}
          onClick={addToList}
          disabled={recipe.ingredients.length === 0}
          className="w-full max-w-[345px]"
        >
          Add ingredients to grocery list
        </Button>
        <p role="status" className="text-caption font-medium text-brand-700">
          {status}
        </p>
      </div>

      <Divider className="mt-[19px]" />

      <h3 className="mt-[15px] text-label font-semibold text-ink-900">
        Instructions
      </h3>
      {steps.length > 0 ? (
        <ol className="mt-1.5 flex list-decimal flex-col gap-1.5 pl-5 text-label text-ink-600 marker:font-semibold marker:text-ink-500">
          {steps.map((step, i) => (
            <li key={i} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-1 text-label text-ink-500">No instructions yet.</p>
      )}
    </Card>
  );
}
