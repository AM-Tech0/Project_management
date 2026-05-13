import { useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationPanel from './NotificationPanel'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'

export default function Topbar() {
    const [open, setOpen] = useState(false)
    const { unread } = useNotifications() || { unread: 0 }
    const { user, logout } = useAuth() || {}

    return (
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-6 h-14 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={() => setOpen(v => !v)} className="p-2 rounded-md hover:bg-slate-100">
                        <Bell />
                        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unread > 99 ? '99+' : unread}</span>}
                    </button>
                    {open && <NotificationPanel onClose={() => setOpen(false)} />}
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">{user?.name?.[0] || 'U'}</div>
                    <div className="text-sm">
                        <div className="font-medium">{user?.name || 'User'}</div>
                        <button onClick={logout} className="text-[13px] text-slate-500">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
