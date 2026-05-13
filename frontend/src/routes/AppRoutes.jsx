import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

import DashboardPage from '../pages/dashboard/DashboardPage'
import ProjectsPage from '../pages/project/ProjectsPage'
import ProjectDetailPage from '../pages/project/ProjectDetailPage'
import ProjectCreatePage from '../pages/project/ProjectCreatePage'
import TasksPage from '../pages/tasks/TasksPage'

import TeamPage from '../pages/team/TeamPage'
import MemberDetailPage from '../pages/team/MemberDetailPage'

import SettingsPage from '../pages/settings/SettingsPage'
import CanvasPage from '../pages/canvas/CanvasPage'

import { useParams } from 'react-router-dom'

const LegacyProjectRedirect = () => {
    const { id } = useParams()
    return <Navigate to={`/projects/${id}`} replace />
}

const TaskDetailPage = () => <div className="p-6">Task Detail Page</div>

export default function AppRoutes() {
    return (
        <Routes>
            {/* public */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* protected */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/projects/:id/canvas" element={<CanvasPage />} />
                    <Route path="/project/:id" element={<LegacyProjectRedirect />} />

                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/:id" element={<TaskDetailPage />} />

                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* admin + manager only */}
                    <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
                        <Route path="/projects/new" element={<ProjectCreatePage />} />
                        <Route path="/team/:id" element={<MemberDetailPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="/403" element={<div className="p-6">Forbidden</div>} />
            <Route path="/500" element={<div className="p-6">Server Error</div>} />
            <Route path="*" element={<div className="flex flex-col items-center justify-center h-full gap-4 pt-20"><h1 className="text-6xl font-bold text-slate-200">404</h1><p className="text-slate-600">Page not found</p></div>} />
        </Routes>
    )
}
