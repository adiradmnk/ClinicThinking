'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, ClipboardList, User, Brain, LogOut,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, excludePrefix: '' },
  { label: 'Mulai Sesi',   href: '/dashboard/sessions/new', icon: BookOpen,        excludePrefix: '' },
  { label: 'Riwayat Sesi', href: '/dashboard/sessions',     icon: ClipboardList,   excludePrefix: '/dashboard/sessions/new' },
  { label: 'DTI',          href: '/dashboard/dti',          icon: Brain,           excludePrefix: '' },
  { label: 'Profil',       href: '/dashboard/profile',      icon: User,            excludePrefix: '' },
]

type Props = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col min-h-screen z-30 transition-all duration-200',
        'fixed inset-y-0 left-0 md:relative md:inset-auto',
        'w-64',
        collapsed ? 'md:w-14' : 'md:w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
      style={{
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 0 24px rgba(8,106,125,0.06)',
      }}
    >
      {/* Logo + mobile close */}
      <div className={cn(
        'flex items-center justify-between px-4 py-6 transition-all duration-200',
        collapsed && 'md:px-0 md:justify-center'
      )}>
        <div className={cn(
          'overflow-hidden transition-all duration-200',
          collapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'
        )}>
          <h1 className="text-xl font-serif font-bold text-[#2c9ca0] whitespace-nowrap pl-2">CliniThink</h1>
          <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap pl-2">Clinical Reasoning</p>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-[#2c9ca0]/10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Desktop */}
        {collapsed && (
          <div className="hidden md:flex w-8 h-8 rounded-lg bg-[#2c9ca0] items-center justify-center">
            <span className="text-white text-xs font-bold font-serif">C</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        'flex-1 space-y-0.5 transition-all duration-200',
        collapsed ? 'md:flex md:flex-col md:items-center md:px-0 px-2' : 'px-2'
      )}>
        {navItems.map(({ label, href, icon: Icon, excludePrefix }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' &&
              pathname.startsWith(href) &&
              (!excludePrefix || !pathname.startsWith(excludePrefix)))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all',
                collapsed
                  ? 'md:w-10 md:h-10 md:justify-center md:gap-0 gap-3 px-3 py-2.5 w-full'
                  : 'gap-3 px-3 py-2.5 w-full',
                active
                  ? 'bg-[#2c9ca0] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#2c9ca0]/8 hover:text-[#2c9ca0]',
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
              <span className={cn(
                'whitespace-nowrap overflow-hidden transition-all duration-200',
                collapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1">
        <div className="border-t border-[#2c9ca0]/10 pt-2">
          <div className={cn(collapsed ? 'md:flex md:justify-center' : '')}>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Keluar' : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium text-gray-400 hover:bg-rose-50/60 hover:text-rose-500 transition-all',
                collapsed
                  ? 'md:w-10 md:h-10 md:justify-center md:gap-0 gap-3 px-3 py-2.5 w-full'
                  : 'gap-3 px-3 py-2.5 w-full',
              )}
            >
              <LogOut size={17} strokeWidth={1.8} className="shrink-0" />
              <span className={cn(
                'whitespace-nowrap overflow-hidden transition-all duration-200',
                collapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'
              )}>
                Keluar
              </span>
            </button>
          </div>
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'hidden md:flex items-center gap-3 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-[#2c9ca0]/8 hover:text-gray-600 transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
          )}
        >
          {collapsed
            ? <ChevronRight size={15} strokeWidth={1.8} />
            : <>
                <ChevronLeft size={15} strokeWidth={1.8} />
                <span className="text-xs">Tutup</span>
              </>
          }
        </button>
      </div>
    </aside>
  )
}
