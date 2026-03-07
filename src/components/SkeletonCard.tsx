export default function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg bg-card p-4 shadow-card animate-pulse-soft">
          <div className="h-4 w-2/3 rounded bg-muted mb-3" />
          <div className="h-3 w-1/2 rounded bg-muted mb-2" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
