export default function Input({label,error,helper,...props}){
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-[14px] font-medium text-slate-700">{label}</label>}
      <input 
        className={`border rounded-md px-3 py-2 text-[14px] w-full outline-none transition-all duration-150
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'}
        `}
        {...props}
      />
      {error && <span className="text-[12px] text-red-500">{error}</span>}
      {helper && !error && <span className="text-[12px] text-slate-500">{helper}</span>}
    </div>
  )
}
