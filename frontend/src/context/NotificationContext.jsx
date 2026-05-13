import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/axios'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState(0)

    const fetchUnread = useCallback(async () => {
        if (!user) return
        try {
            const res = await api.get('/notifications/unread-count')
            setUnread(res.data.data?.count || 0)
        } catch (e) { console.log(e) }
    }, [user])

    const fetchNotifications = useCallback(async () => {
        if (!user) return
        try {
            const res = await api.get('/notifications?limit=20')
            setNotifications(res.data.data || [])
        } catch (e) { console.log(e) }
    }, [user])

    useEffect(() => {
        fetchUnread()
        fetchNotifications()
    }, [fetchUnread, fetchNotifications])

    useEffect(() => {
        if (!socket) return
        socket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev])
            setUnread(prev => prev + 1)
        })
        return () => socket.off('new_notification')
    }, [socket])

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
            setUnread(prev => Math.max(0, prev - 1))
        } catch (e) { console.log(e) }
    }

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnread(0)
        } catch (e) { console.log(e) }
    }

    return (
        <NotificationContext.Provider value={{ notifications, unread, markRead, markAllRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    )
}
