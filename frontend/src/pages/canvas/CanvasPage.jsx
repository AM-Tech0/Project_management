import {useParams,Link} from 'react-router-dom'
import {useAuth} from '../../hooks/useAuth'
import CanvasBoard from '../../components/canvas/CanvasBoard'

export default function CanvasPage(){
  const {id} = useParams()
  const {user} = useAuth()

  return (
    <div className="flex flex-col h-full -mx-6 -mt-6">
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${id}`} className="text-[13px] text-blue-600 hover:underline">
            &larr; Back to Project
          </Link>
          <span className="text-slate-300">|</span>
          <h2 className="text-[16px] font-medium text-slate-900">Project Canvas</h2>
        </div>
        <div className="hidden md:block text-[12px] text-slate-500 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
          Whiteboard works best on desktop
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-0 relative">
        {/* On very small screens, show a warning overlay */}
        <div className="md:hidden absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h3 className="font-medium text-slate-900 mb-2">Desktop Recommended</h3>
          <p className="text-[14px] text-slate-600 mb-6 max-w-xs">
            The collaborative canvas is designed for larger screens. Please use a tablet or desktop for the best experience.
          </p>
          <Link to={`/projects/${id}`} className="text-blue-600 hover:underline text-[14px]">
            Go back
          </Link>
        </div>
        
        <div className="h-full w-full">
          <CanvasBoard projectId={id} userRole={user?.role} userName={user?.name} />
        </div>
      </div>
    </div>
  )
}
