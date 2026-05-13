export default function Badge({children,className=''}){
  return (
    <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${className || 'bg-slate-100 text-slate-700'}`}>
      {children}
    </span>
  )
}
