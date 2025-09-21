import * as React from "react";

export function Tabs({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function TabsList({ children, className = "" }: any) {
  return <div className={`inline-flex rounded-md ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children }: any) {
  return <button className="px-3 py-1 text-sm">{children}</button>;
}
export function TabsContent({ value, children, className = "" }: any) {
  return <div className={className}>{children}</div>;
}
