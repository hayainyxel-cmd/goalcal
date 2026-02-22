export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--text-primary)" />
              <rect x="8" y="10" width="16" height="2" rx="1" fill="var(--bg)" />
              <rect x="8" y="15" width="10" height="2" rx="1" fill="var(--bg)" />
              <rect x="8" y="20" width="13" height="2" rx="1" fill="var(--bg)" />
              <circle cx="24" cy="22" r="4" fill="var(--accent-green)" />
              <path d="M22 22l1.5 1.5L26 20" stroke="var(--bg)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>GoalCal</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Habit-focused goal tracking</p>
        </div>
        {children}
      </div>
    </div>
  )
}
