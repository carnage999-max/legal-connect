"use client";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-100 rounded w-1/2"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-lcborder rounded-lg p-4 md:p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Section skeleton */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-lcborder rounded-lg p-4 h-24"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
