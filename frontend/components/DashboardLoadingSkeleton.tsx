"use client";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading">
      <div>
        <div className="skeleton mb-3 h-10 w-1/3" />
        <div className="skeleton h-5 w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6">
            <div className="skeleton mb-4 h-4 w-1/2" />
            <div className="skeleton h-9 w-1/3" />
          </div>
        ))}
      </div>
      <div>
        <div className="skeleton mb-5 h-6 w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 p-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
