import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import { useSocket } from '../hooks/useSocket'

const AppLayout = () => {
    const { connected } = useSocket() || {}
    return (
        <div className="flex h-screen bg-[#FAFAFA]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                {!connected && (
                    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1.5 text-[13px] text-yellow-800">
                        You are offline. Real-time updates paused.
                    </div>
                )}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout;
