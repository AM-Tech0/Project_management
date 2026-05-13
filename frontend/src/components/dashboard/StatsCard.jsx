export default function StatsCard({label,value,icon}){
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[13px] text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      {icon && <div className="text-slate-400">{icon}</div>}
    </div>
  )
}
