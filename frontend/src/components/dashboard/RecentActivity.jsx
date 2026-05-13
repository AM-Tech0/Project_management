import {fmtRelative} from '../../utils/formatters'
import EmptyState from '../ui/EmptyState'
import {Bell} from 'lucide-react'

export default function RecentActivity({activities}){
  if(!activities || activities.length===0){
    return <EmptyState icon={<Bell />} title="No recent activity" desc="You're all caught up!" />
  }

  return (
    <div className="space-y-4">
      {activities.map(act=>(
        <div key={act._id} className="flex gap-3">
          <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
          <div>
            <p className="text-[13px] text-slate-900">{act.message}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{fmtRelative(act.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
