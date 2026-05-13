export default function Button({children,variant='primary',size='md',loading,disabled,...props}){
  const base="inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 disabled:opacity-60"
  const variants={
    primary:"bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
    secondary:"bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    danger:"bg-red-600 text-white hover:bg-red-700 border border-red-600",
    ghost:"text-slate-600 hover:bg-slate-100 border border-transparent"
  }
  const sizes={sm:"px-3 py-1.5 text-[13px]",md:"px-4 py-2 text-[14px]"}
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} disabled={disabled||loading} {...props}>
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
