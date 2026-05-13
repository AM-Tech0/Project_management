import { useNotifications } from '../../hooks/useNotifications'
import { useNavigate } from 'react-router-dom'

export default function NotificationPanel({ onClose }) {
    const { notifications, markRead, markAllRead } = useNotifications() || { notifications: [] }
    const nav = useNavigate()

    const handleClick = (n) => {
        markRead(n._id)
        if (n.link) nav(n.link)
        if (onClose) onClose()
    }

    return (
        <div className="absolute right-4 top-12 w-[360px] bg-white border border-slate-200 rounded-lg shadow-sm z-50 max-h-[480px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="font-medium">Notifications</h4>
                <button onClick={markAllRead} className="text-[13px] text-slate-500">Mark all read</button>
            </div>
            <div className="max-h-[420px] overflow-auto">
                {notifications.length === 0 && <div className="p-4 text-[13px] text-slate-500">No notifications</div>}
                {notifications.map(n => (
                    <div key={n._id} onClick={() => handleClick(n)} className={`p-3 border-b border-slate-100 cursor-pointer ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                        <div className="text-[13px] text-slate-700">{n.message || n.title || 'Notification'}</div>
                        <div className="text-[12px] text-slate-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
