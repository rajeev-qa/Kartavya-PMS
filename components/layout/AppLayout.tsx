"use client"

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}