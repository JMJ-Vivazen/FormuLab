import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FlaskConical, TestTube2, MessageSquare, FolderOpen, Package, GitMerge, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/projects',   label: 'Projects',     icon: FolderOpen },
  { to: '/formulations', label: 'Formulations', icon: FlaskConical },
  { to: '/samples',    label: 'Samples',      icon: TestTube2 },
  { to: '/feedback',   label: 'Feedback',     icon: MessageSquare },
  { to: '/materials',  label: 'Materials',    icon: Package },
  { to: '/gates',      label: 'Gate Reviews', icon: GitMerge },
  { to: '/reports',    label: 'Reports',      icon: BarChart3 },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  return (
    <aside className="w-56 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm leading-none">FormuLab</div>
            <div className="text-xs text-slate-400 mt-0.5">R&D QMS Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100 space-y-2">
        {user && (
          <div className="text-xs text-slate-500 truncate" title={user.email ?? ''}>
            {user.email}
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800"
        >
          <LogOut size={12} />
          Sign out
        </button>
        <p className="text-xs text-slate-400">Vivazen R&D</p>
      </div>
    </aside>
  )
}
