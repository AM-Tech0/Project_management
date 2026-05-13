import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
    const { user } = useAuth() || {}
    const loc = useLocation()
    const nav = [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/projects', label: 'Projects', icon: <FolderKanban size={16} /> },
        { to: '/tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
        { to: '/team', label: 'Team', icon: <Users size={16} /> },
        { to: '/settings', label: 'Settings', icon: <Settings size={16} /> }
    ]

    const allowed = (item) => {
        if (user?.role === 'member' && item.to === '/projects') return false
        return true
    }

    return (
        <aside className="bg-[#FAFAFA] border-r border-slate-200 w-[240px] flex-shrink-0 flex flex-col">
            <div className="p-4 text-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold">ProjectHub</h2>
                </div>
                <nav className="space-y-1">
                    {nav.map(item => {
                        if (!allowed(item)) return null
                        const active = loc.pathname.startsWith(item.to)
                        return (
                            <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? 'bg-blue-50 border-l-2 border-blue-600 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                {item.icon}
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">{user?.name?.[0] || 'U'}</div>
                    <div>
                        <div className="text-sm font-medium">{user?.name || 'User'}</div>
                        <div className="text-[13px] text-slate-500">{user?.role || 'member'}</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
