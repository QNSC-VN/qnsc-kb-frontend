import React from 'react'

export function Textarea({ className = '', size = 'md', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { size?: 'sm' | 'md' | 'lg' }) {
  return <textarea className={`ui-control ui-control-${size} min-h-24 resize-none py-sm ${className}`} {...props} />
}
