import Avatar from '../ui/Avatar'

export default function CanvasCollaborators({users=[]}){
  if(!users || users.length===0) return null

  const max = 4
  const visible = users.slice(0,max)
  const remaining = users.length - max

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
      <span className="text-[12px] text-slate-500 font-medium mr-1">In this canvas:</span>
      <div className="flex -space-x-1.5">
        {visible.map((u,i)=>(
          <div key={i} className="ring-2 ring-white rounded-full">
            <Avatar name={u.name} size="sm" />
          </div>
        ))}
        {remaining > 0 && (
          <div className="ring-2 ring-white rounded-full bg-slate-100 text-slate-500 text-[10px] w-6 h-6 flex items-center justify-center font-medium">
            +{remaining}
          </div>
        )}
      </div>
    </div>
  )
}
