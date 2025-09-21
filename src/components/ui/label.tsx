export function Label({ htmlFor, children, className = "" }: any) {
  return <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>;
}
