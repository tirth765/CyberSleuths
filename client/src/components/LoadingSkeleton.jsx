export default function LoadingSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-border rounded-xl"
          style={{ opacity: Math.max(0.2, 1 - i * 0.15) }}
        />
      ))}
    </div>
  );
}
