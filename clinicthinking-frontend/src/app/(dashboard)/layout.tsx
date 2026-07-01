'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query-client'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient())
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
    <div className="flex h-screen w-screen overflow-hidden bg-[#e8f1f2]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - set h-full shrink-0 */}
      <div className="h-full shrink-0">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-10 shrink-0"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#2c9ca0] hover:bg-[#2c9ca0]/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif font-bold text-gray-900 text-lg">CliniThink</span>
        </header>

        {/* main area - ONLY this container should scroll */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </QueryClientProvider>
  )
}
