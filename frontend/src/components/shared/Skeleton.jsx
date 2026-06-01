/**
 * Skeleton — shimmer loading primitives.
 *
 * These replace content while data is loading, giving users
 * a visual hint of what's coming (better than a blank screen or spinner).
 *
 * Usage:
 *   <Skeleton className="h-4 w-[200px]" />       // Text line
 *   <Skeleton className="h-12 w-12 rounded-full" /> // Avatar
 *   <Skeleton className="h-[200px] w-full" />     // Image placeholder
 */

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded-md ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * JobCardSkeleton — loading placeholder for job cards.
 * Matches the exact layout of the Job component.
 */
function JobCardSkeleton() {
  return (
    <div className="p-5 rounded-md shadow-xl bg-card border border-border">
      {/* Date + Bookmark */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Company info */}
      <div className="flex items-center gap-2 my-2">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Title + Description */}
      <div className="space-y-2 mt-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

/**
 * JobListSkeleton — renders a grid of job card skeletons.
 */
function JobListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * TableRowSkeleton — for admin table loading states.
 */
function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === 0 ? "w-10 rounded-full h-10" : "flex-1"}`}
        />
      ))}
    </div>
  );
}

/**
 * ProfileSkeleton — for profile page loading.
 */
function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  JobCardSkeleton,
  JobListSkeleton,
  TableRowSkeleton,
  ProfileSkeleton,
};
