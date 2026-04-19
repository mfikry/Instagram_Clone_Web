export default function PostSkeleton() {
  return (
    // Class "animate-pulse" adalah kunci sihir dari Tailwind
    <div className="mb-6 w-full max-w-117.5 animate-pulse rounded-lg border border-gray-200 bg-white pb-4 sm:mb-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 p-3">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>

      {/* Image Box Skeleton */}
      <div className="aspect-square w-full bg-gray-100"></div>

      {/* Actions & Caption Skeleton */}
      <div className="p-3">
        <div className="mb-4 flex gap-4">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        </div>
        <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
