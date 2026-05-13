import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-slate-900">ProjectHub</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Project Management</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
