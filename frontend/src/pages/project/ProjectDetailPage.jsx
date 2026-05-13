import {useState,useEffect} from 'react'
import {useParams,Link} from 'react-router-dom'
import {useAuth} from '../../hooks/useAuth'
import api from '../../utils/axios'
import {PROJECT_STATUS_COLOR, PRIORITY_COLOR} from '../../utils/constants'
import {fmtDate} from '../../utils/formatters'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
// Note: we'll stub KanbanBoard for now as it's Module 9
// Canvas is Module 12, but we can link to it

export default function ProjectDetailPage(){
  const {id} = useParams()
  const {user} = useAuth()
  
  const [project,setProject] = useState(null)
  const [stats,setStats] = useState(null)
  const [loading,setLoading] = useState(true)
  const [tab,setTab] = useState('overview') // overview, tasks, members

  useEffect(()=>{
    const fetchProject=async()=>{
      setLoading(true)
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`)
        ])
        setProject(pRes.data.data)
        const tasks = tRes.data.data || []
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t=>t.status==='done').length
        })
      } catch(err){
        console.log("err fetch project",err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  },[id])

  if(loading) return <Skeleton className="h-screen w-full" />
  if(!project) return <div className="p-6 text-slate-500">Project not found</div>

  const statusColor = PROJECT_STATUS_COLOR[project.status] || 'bg-slate-100 text-slate-700'
  const priorityColor = PRIORITY_COLOR[project.priority] || 'bg-slate-100 text-slate-700'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
            <Badge className={statusColor}>{(project.status||'').replace('_',' ')}</Badge>
            <Badge className={priorityColor}>{project.priority}</Badge>
          </div>
          <p className="text-slate-500 text-[14px]">{project.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/projects/${id}/canvas`}>
            <Button variant="secondary">Open Canvas</Button>
          </Link>
          {(user?.role==='admin' || user?._id===project.manager?._id) && (
            <Button variant="secondary">Edit Project</Button>
          )}
        </div>
      </div>
      
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {['overview','tasks','members'].map(t=>(
            <button
              key={t}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${tab===t ? 'border-blue-600 text-blue-600':'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={()=>setTab(t)}
            >
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="py-4">
        {tab==='overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="text-[16px] font-medium mb-4">Project Details</h3>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <p className="text-slate-500 mb-1">Start Date</p>
                    <p className="font-medium">{fmtDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">End Date</p>
                    <p className="font-medium">{fmtDate(project.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Manager</p>
                    <p className="font-medium">{project.manager?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Created By</p>
                    <p className="font-medium">{project.createdBy?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              {stats && (
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <h3 className="text-[16px] font-medium mb-4">Task Overview</h3>
                  <div className="flex gap-4">
                    <div className="bg-slate-50 p-4 rounded-md flex-1 text-center border border-slate-100">
                      <p className="text-[20px] font-bold text-slate-700">{stats.totalTasks||0}</p>
                      <p className="text-[12px] text-slate-500">Total Tasks</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md flex-1 text-center border border-blue-100">
                      <p className="text-[20px] font-bold text-blue-700">{stats.completedTasks||0}</p>
                      <p className="text-[12px] text-blue-600">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="text-[16px] font-medium mb-4">Team ({project.members?.length||0})</h3>
                <div className="space-y-3">
                  {project.members?.map(m=>(
                    <div key={m._id} className="flex items-center gap-3">
                      <Avatar name={m.name} size="md" />
                      <div>
                        <p className="text-[14px] font-medium">{m.name}</p>
                        <p className="text-[12px] text-slate-500">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {tab==='tasks' && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-500">
            Kanban Board will be implemented in Module 9.
          </div>
        )}
        
        {tab==='members' && (
          <div className="bg-white border border-slate-200 rounded-lg p-0 overflow-hidden">
             <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-500 text-[13px]">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {project.members?.map(m=>(
                  <tr key={m._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium flex items-center gap-2">
                      <Avatar name={m.name} size="sm" />
                      {m.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.email}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
