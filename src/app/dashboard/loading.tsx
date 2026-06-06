export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-xl shadow-sm bg-card">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-0">
          <div className="h-10 border-b bg-muted/20" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b last:border-0">
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded mr-4" />
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded mr-4" />
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
