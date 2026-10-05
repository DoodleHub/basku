import { Card, LoadingRegion, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Placeholder matching GroceryListView's layout while lists load. */
export function GroceryListSkeleton() {
  return (
    <LoadingRegion
      label="Loading your list…"
      className="mx-auto w-full max-w-[546px] px-4 pt-12 pb-16"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-8 w-9" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>

      <Skeleton className="mt-6 h-[52px] rounded-field" />

      <Card className="mt-[22px] py-0.5">
        {["w-32", "w-24", "w-40", "w-28"].map((width, i) => (
          <div key={i} className="flex items-center pl-[18px]">
            <Skeleton className="size-7 rounded-full" />
            <div
              className={cn(
                "ml-3.5 flex min-h-[59px] flex-1 items-center gap-3 pr-4 pl-[15px]",
                i > 0 && "border-t border-line-subtle",
              )}
            >
              <Skeleton className={cn("h-4", width)} />
              <Skeleton className="mr-[60px] ml-auto h-4 w-8" />
            </div>
          </div>
        ))}
      </Card>

      <Skeleton className="mt-[26px] h-3.5 w-36" />
    </LoadingRegion>
  );
}
