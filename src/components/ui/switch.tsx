import { useState } from "react";

export function Switch({ id, checked, onCheckedChange }: { id: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`w-10 h-5 rounded-full ${checked ? "bg-indigo-600" : "bg-gray-300"} relative`}
    >
      <span className={`block w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}
