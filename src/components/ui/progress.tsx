export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full bg-gray-200 rounded ${className}`}>
      <div className="h-2 bg-indigo-600 rounded" style={{ width: `${value}%` }} />
    </div>
  );
}
