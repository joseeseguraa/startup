export default function ClientesLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Toolbar / Search */}
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="h-10 w-full max-w-sm bg-muted animate-pulse rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="h-12 border-b bg-muted/20" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b last:border-0">
            <div className="flex items-center gap-3 w-1/3">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
