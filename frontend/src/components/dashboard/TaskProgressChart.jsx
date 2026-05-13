import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,Tooltip} from 'recharts'
import EmptyState from '../ui/EmptyState'
import {BarChart2} from 'lucide-react'

export default function TaskProgressChart({data}){
  if(!data || data.length === 0){
    return <EmptyState icon={<BarChart2 />} title="No task data" desc="Create tasks to see your progress chart" />
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top:20,right:20,left:0,bottom:0}}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#6B7280'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#6B7280'}} />
          <Tooltip 
            cursor={{fill:'transparent'}}
            contentStyle={{borderRadius:'8px',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px 0 rgb(0 0 0 / 0.05)'}}
          />
          <Bar dataKey="count" fill="#2563EB" radius={[4,4,0,0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
