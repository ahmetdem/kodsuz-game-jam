import * as React from 'react'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={`w-full rounded-lg border px-3 py-2 text-sm ${props.className||''}`} />
}
