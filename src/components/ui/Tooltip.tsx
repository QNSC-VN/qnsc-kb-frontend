import React from 'react'

export function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  return <span className="group relative inline-flex">{children}<span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-[90] mb-xs w-max max-w-56 -translate-x-1/2 rounded-control bg-foreground px-sm py-xxs text-caption font-medium text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{content}</span></span>
}
