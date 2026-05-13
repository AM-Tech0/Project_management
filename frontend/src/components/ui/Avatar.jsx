export default function Avatar({src,name,size='md'}){
  const sizes={
    sm:'w-6 h-6 text-[10px]',
    md:'w-8 h-8 text-[12px]',
    lg:'w-10 h-10 text-[14px]'
  }
  
  const initials=name?name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase():'?'

  return (
    <div className={`rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-medium overflow-hidden shrink-0 ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
