import { Card, LoadingRegion, Skeleton } from "@/components/ui";

/** Placeholder matching RecipesView's layout while recipes load. */
export function RecipesSkeleton() {
  return (
    <LoadingRegion
      label="Loading recipes…"
      className="mx-auto w-full max-w-[766px] px-4 pt-[34px] pb-16"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[46px] w-[164px] rounded-field" />
      </div>

      <Skeleton className="mt-[15px] h-[50px] rounded-field" />

      <div className="mt-4 grid grid-cols-1 gap-[15px] min-[480px]:grid-cols-2 sm:grid-cols-3">
        {/* One card per visible grid column. */}
        {["", "max-[479px]:hidden", "max-sm:hidden"].map((hide, i) => (
          <Card key={i} className={`border-[1.5px] p-1.5 ${hide}`}>
            <Skeleton className="aspect-[1.8]" />
            <div className="px-[11px] pt-[11px] pb-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2.5 h-4 w-16" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-[15px] px-[22px] pt-[18px] pb-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-4 w-24" />
        <div className="mt-3 flex max-w-[345px] flex-col gap-3">
          {["w-40", "w-32", "w-44"].map((width) => (
            <Skeleton key={width} className={`h-4 ${width}`} />
          ))}
        </div>
        <Skeleton className="mt-4 h-9 max-w-[345px]" />
      </Card>
    </LoadingRegion>
  );
}
