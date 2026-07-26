import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <Header />
        <main className="app-scroll min-h-0 flex-1 overflow-y-auto bg-canvas p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
