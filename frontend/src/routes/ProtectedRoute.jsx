import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
    const { user, loading } = useAuth()
    const location = useLocation()
    if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-slate-400 text-sm">Loading...</span></div>
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />
    return <Outlet />
}

