import {MousePointer2, Type, StickyNote, Square, Pencil, Eraser} from 'lucide-react'

export default function CanvasToolbar({activeTool,setActiveTool,onAddText,onAddSticky,onAddRect,onDraw,onClear,userRole}){
  
  const tools = [
    {id:'select', icon:<MousePointer2 size={18} />, label:'Select', action:()=>setActiveTool('select'), roles:['admin','manager','member']},
    {id:'text', icon:<Type size={18} />, label:'Text', action:()=>onAddText(), roles:['admin','manager','member']},
    {id:'sticky', icon:<StickyNote size={18} />, label:'Sticky Note', action:()=>onAddSticky('#FEF9C3'), roles:['admin','manager','member']},
    {id:'rect', icon:<Square size={18} />, label:'Rectangle', action:()=>onAddRect(), roles:['admin','manager']},
    {id:'draw', icon:<Pencil size={18} />, label:'Draw', action:()=>{setActiveTool('draw');onDraw(true)}, roles:['admin','manager']},
    {id:'clear', icon:<Eraser size={18} />, label:'Clear All', action:onClear, roles:['admin','manager']}
  ]

  const visibleTools = tools.filter(t=>t.roles.includes(userRole))

  return (
    <div className="w-[52px] flex-shrink-0 bg-white/90 backdrop-blur border-r border-slate-200 flex flex-col items-center py-4 gap-3 z-10 relative">
      {visibleTools.map(t=>(
        <button
          key={t.id}
          title={t.label}
          onClick={()=>{
            if(t.id!=='draw') onDraw(false)
            if(t.action) t.action()
          }}
          className={`w-9 h-9 flex items-center justify-center rounded-md transition-all ${
            activeTool===t.id 
              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
          }`}
        >
          {t.icon}
        </button>
      ))}
      
      {/* Sticky color sub-tools */}
      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 w-full items-center">
        <button onClick={()=>onAddSticky('#FEF9C3')} className="w-5 h-5 rounded-full bg-[#FEF9C3] border border-yellow-300 shadow-sm" title="Yellow Sticky" />
        <button onClick={()=>onAddSticky('#FFE4E6')} className="w-5 h-5 rounded-full bg-[#FFE4E6] border border-rose-300 shadow-sm" title="Rose Sticky" />
      </div>
    </div>
  )
}
