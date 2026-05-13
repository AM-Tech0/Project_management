import {X} from 'lucide-react'

export default function Modal({isOpen,onClose,title,children,size='md'}){
  if(!isOpen) return null
  
  const sizes={
    sm:'max-w-md',
    md:'max-w-lg',
    lg:'max-w-3xl'
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className={`bg-white border border-slate-200 rounded-lg w-full ${sizes[size]} shadow-sm flex flex-col max-h-[90vh]`}>
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
