import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-xs">
      {label && <label className="block text-body font-medium text-foreground">{label}</label>}
      <input
        className={`ui-control ui-control-md ${className}`}
        {...props}
      />
    </div>
  )
}
