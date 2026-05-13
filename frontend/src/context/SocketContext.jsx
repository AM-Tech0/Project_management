import { createContext, useEffect, useState } from 'react'
import { getSocket } from '../utils/socket'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext(null)

export function SocketProvider({ children }) {
    const { user } = useAuth()
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!user) return
        const s = getSocket()
        if (!s) return
        setSocket(s)
        s.on('connect', () => setConnected(true))
        s.on('disconnect', () => setConnected(false))
        return () => {
            s.off('connect')
            s.off('disconnect')
        }
    }, [user])

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    )
}
