// src/components/ui/tabs.tsx
import * as React from "react";

type Ctx = { value: string; setValue: (v: string) => void };
const TabsCtx = React.createContext<Ctx | null>(null);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  // Controlled vs uncontrolled
  const currentValue = value !== undefined ? value : internalValue;
  const setValue = onValueChange || setInternalValue;

  return <TabsCtx.Provider value={{ value: currentValue, setValue }}>{children}</TabsCtx.Provider>;
}

// Diğer componentler aynı kalıyor
export function TabsList({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`inline-flex items-center gap-1 rounded-xl border bg-white p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`rounded-lg px-3 py-1 text-sm ${active ? "bg-indigo-600 text-white" : "text-gray-700"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsCtx)!;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
