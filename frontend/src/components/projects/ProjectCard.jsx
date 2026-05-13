import {Link} from 'react-router-dom'
import {fmtDate, truncate} from '../../utils/formatters'
import {PROJECT_STATUS_COLOR, PRIORITY_COLOR, STATUS_LABEL} from '../../utils/constants'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'

export default function ProjectCard({project}){
  const statusColor = PROJECT_STATUS_COLOR[project.status] || 'bg-slate-100 text-slate-700'
  const priorityColor = PRIORITY_COLOR[project.priority] || 'bg-slate-100 text-slate-700'
  
  return (
    <Link to={`/project/${project._id}`} className="block">
      <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-150 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">
            {truncate(project.name, 40)}
          </h3>
          <Badge className={statusColor}>
            {(project.status||'').replace('_',' ')}
          </Badge>
        </div>
        
        <div className="mb-4">
          <Badge className={priorityColor}>{project.priority}</Badge>
        </div>
        
        <p className="text-[13px] text-slate-500 mb-6 flex-1">
          {truncate(project.description, 80)}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-[12px] text-slate-500 mb-1">
            <span>Progress</span>
            <span>{project.progress||0}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{width:`${project.progress||0}%`}} />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="text-[12px] text-slate-400">
            Due: {fmtDate(project.endDate)}
          </div>
          <div className="flex -space-x-1.5">
            {project.members?.slice(0,3).map(m=>(
              <div key={m._id} className="ring-2 ring-white rounded-full">
                <Avatar name={m.name} size="sm" />
              </div>
            ))}
            {project.members?.length > 3 && (
              <div className="ring-2 ring-white rounded-full bg-slate-100 text-slate-500 text-[10px] w-6 h-6 flex items-center justify-center font-medium">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
