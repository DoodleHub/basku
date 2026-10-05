import type { Metadata } from "next";
import { RecipesView } from "@/components/recipes/recipes-view";

export const metadata: Metadata = { title: "Recipes · basku" };

export default function RecipesPage() {
  return <RecipesView />;
}
