import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-charcoal">{label}</label>}
      <input
        className={`w-full rounded-lg border border-hairline bg-white px-3 py-1.5 text-ink outline-none transition focus:border-minimaxBlue focus:ring-1 focus:ring-minimaxBlue ${className}`}
        {...props}
      />
    </div>
  )
}
