import { format, formatDistanceToNow } from 'date-fns'

export const fmtDate=(d)=>{
  if(!d) return '—'
  return format(new Date(d),'MMM d, yyyy')
}

export const fmtRelative=(d)=>{
  if(!d) return ''
  return formatDistanceToNow(new Date(d),{addSuffix:true})
}

export const truncate=(str,n=60)=>{
  if(!str) return ''
  if(str.length<=n) return str
  return str.slice(0,n)+'...'
}
