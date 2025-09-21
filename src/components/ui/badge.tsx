export function Badge({ children, className = "", variant }: any) {
  let style = variant === "secondary" ? "bg-gray-100 text-gray-700" : "border";
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${style} ${className}`}>{children}</span>;
}
