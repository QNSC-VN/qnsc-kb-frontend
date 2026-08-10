import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = 'ui-button'
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'border border-border bg-surface hover:bg-surface-soft text-foreground',
    danger: 'bg-destructive text-primary-foreground hover:bg-destructive/90'
  }
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
