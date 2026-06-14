import { NavLink, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Apple, TrendingUp, Settings } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/train', label: 'Train', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-pageBg">
      <main className="flex-1 pb-24 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-surface2">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)

            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-accent' : 'text-textMuted'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={`text-[10px] font-body font-medium ${
                    isActive ? 'text-accent' : 'text-textMuted'
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
