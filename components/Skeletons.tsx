import { cn } from "@/lib/utils";

/** Base shimmer block. Honors reduced-motion (globals zeroes the animation). */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-100", className)} />;
}

/**
 * Full-page loading skeleton: a header placeholder plus a body of cards or rows.
 * Used on list pages so a slow / flaky connection shows structure, not a bare spinner.
 */
export function PageSkeleton({
  variant = "rows",
  count = 5,
}: {
  variant?: "cards" | "rows";
  count?: number;
}) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>

      {/* Body */}
      {variant === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBlock key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16" />
          ))}
        </div>
      )}
    </div>
  );
}
