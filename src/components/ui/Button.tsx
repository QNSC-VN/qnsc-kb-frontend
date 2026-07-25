import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-minimaxBlue focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50'
  const variants = {
    primary: 'bg-ink hover:bg-charcoal text-white',
    secondary: 'border border-hairline hover:bg-surface text-ink',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white'
  }
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
