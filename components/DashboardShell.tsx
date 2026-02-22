'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Sun, Moon, LogOut, Target, Settings, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Props {
  profile: Profile | null
  user: { id: string; email?: string }
  children: React.ReactNode
}

export default function DashboardShell({ profile, user, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [theme, setTheme] = useState<'light' | 'dark'>(profile?.theme || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  async function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    await supabase.from('profiles').update({ theme: next }).eq('id', user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const name = profile?.display_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--text-primary)" />
              <rect x="8" y="10" width="16" height="2" rx="1" fill="var(--bg)" />
              <rect x="8" y="15" width="10" height="2" rx="1" fill="var(--bg)" />
              <rect x="8" y="20" width="13" height="2" rx="1" fill="var(--bg)" />
              <circle cx="24" cy="22" r="4" fill="var(--accent-green)" />
              <path d="M22 22l1.5 1.5L26 20" stroke="var(--bg)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>GoalCal</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            <NavLink href="/dashboard" active={pathname === '/dashboard'} icon={<LayoutGrid size={15} />} label="Calendar" />
            <NavLink href="/dashboard/goals" active={pathname === '/dashboard/goals'} icon={<Target size={15} />} label="Goals" />
            <NavLink href="/dashboard/settings" active={pathname === '/dashboard/settings'} icon={<Settings size={15} />} label="Settings" />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {name}
            </span>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'light'
                ? <Moon size={14} style={{ color: 'var(--text-secondary)' }} />
                : <Sun size={14} style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-secondary)' }}
              title="Sign out"
            >
              <LogOut size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t" style={{ borderColor: 'var(--border)' }}>
          <MobileNavLink href="/dashboard" active={pathname === '/dashboard'} label="Calendar" />
          <MobileNavLink href="/dashboard/goals" active={pathname === '/dashboard/goals'} label="Goals" />
          <MobileNavLink href="/dashboard/settings" active={pathname === '/dashboard/settings'} label="Settings" />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={{
        background: active ? 'var(--bg-secondary)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      }}
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className="flex-1 text-center py-2 text-xs font-medium transition-colors"
      style={{ color: active ? 'var(--accent-green)' : 'var(--text-muted)' }}
    >
      {label}
    </Link>
  )
}
