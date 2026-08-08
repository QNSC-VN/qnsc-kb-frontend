import React, { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar mobileOpen={mobileNavOpen} onClose={closeMobileNav} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="ops-shell-glow pointer-events-none absolute inset-x-0 top-0 h-64" />
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="app-scroll relative min-h-0 min-w-0 flex-1 overflow-y-auto bg-canvas p-4 sm:p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
