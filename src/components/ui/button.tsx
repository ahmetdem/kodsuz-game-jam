import * as React from "react";

export function Button({ className = "", variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  let base = "px-4 py-2 rounded font-medium";
  let style = variant === "secondary" ? "bg-gray-100 hover:bg-gray-200" : "bg-indigo-600 text-white hover:bg-indigo-700";
  return <button className={`${base} ${style} ${className}`} {...props} />;
}
