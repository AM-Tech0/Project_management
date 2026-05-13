import { createContext, useState, useEffect } from 'react'
import api from '../utils/axios'
import { getToken, setToken, clearToken } from '../utils/auth'
import { initSocket, disconnectSocket } from '../utils/socket'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = getToken()
        if (token) {
            api.get('/auth/me').then(res => {
                setUser(res.data.data)
                initSocket(token)
            }).catch(() => {
                clearToken()
            }).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { accessToken, user: u } = res.data.data
        setToken(accessToken)
        setUser(u)
        initSocket(accessToken)
        return u
    }

    const logout = async () => {
        try { await api.post('/auth/logout') } catch (e) { console.log(e) }
        clearToken()
        disconnectSocket()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
