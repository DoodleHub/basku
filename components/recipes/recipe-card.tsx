import Image from "next/image";
import { ClockIcon, LeafIcon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Recipe } from "@/lib/store";

export function RecipeCard({
  recipe,
  selected,
  onSelect,
}: {
  recipe: Recipe;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group w-full cursor-pointer rounded-card border-[1.5px] bg-surface p-1.5 text-left transition-colors",
        selected ? "border-brand-600" : "border-line hover:border-brand-200",
      )}
    >
      <RecipeImage recipe={recipe} />
      <div className="px-[11px] pt-[11px] pb-3">
        <p className="truncate text-body font-semibold text-ink-900">
          {recipe.name}
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-label text-ink-600">
          <ClockIcon size={18} className="text-ink-800" />
          {recipe.minutes} min
        </p>
      </div>
    </button>
  );
}

export function RecipeImage({
  recipe,
}: {
  recipe: Pick<Recipe, "name" | "image">;
}) {
  return (
    <div className="relative aspect-[1.8] overflow-hidden rounded-control bg-brand-50">
      {recipe.image ? (
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          sizes="(min-width: 640px) 240px, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-brand-200">
          <LeafIcon size={40} />
        </div>
      )}
    </div>
  );
}
