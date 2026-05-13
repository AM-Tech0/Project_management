export default function EmptyState({icon,title,desc,action}){
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-lg">
      {icon && <div className="text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-[15px] font-medium text-slate-900">{title}</h3>
      {desc && <p className="text-[13px] text-slate-500 mt-1 max-w-sm">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
