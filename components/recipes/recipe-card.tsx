"use client";

import Image from "next/image";
import { useState } from "react";
import { ClockIcon, LeafIcon, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Recipe } from "@/lib/store";

export function RecipeCard({
  recipe,
  onOpen,
}: {
  recipe: Recipe;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group w-full cursor-pointer rounded-card border-[1.5px] border-line bg-surface p-1.5 text-left transition-colors hover:border-brand-200"
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
  sizes = "(min-width: 640px) 240px, 100vw",
}: {
  recipe: Pick<Recipe, "name" | "image">;
  /** How wide the photo renders, for picking an image size. */
  sizes?: string;
}) {
  return (
    <div className="relative aspect-[1.8] overflow-hidden rounded-control bg-brand-50">
      {recipe.image ? (
        <Photo
          key={recipe.image}
          src={recipe.image}
          alt={recipe.name}
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-brand-200">
          <LeafIcon size={40} />
        </div>
      )}
    </div>
  );
}

/** Shows a shimmer until the photo has loaded, then fades it in. */
function Photo({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "object-cover transition-opacity duration-300",
          !loaded && "opacity-0",
        )}
      />
    </>
  );
}
