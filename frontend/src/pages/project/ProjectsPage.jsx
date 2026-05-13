import {useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../../hooks/useAuth'
import api from '../../utils/axios'
import Button from '../../components/ui/Button'
import ProjectCard from '../../components/projects/ProjectCard'
import Skeleton from '../../components/ui/Skeleton'
import {Plus} from 'lucide-react'

export default function ProjectsPage(){
  const {user} = useAuth()
  const [projects,setProjects] = useState([])
  const [loading,setLoading] = useState(true)
  
  const [search,setSearch] = useState('')
  const [status,setStatus] = useState('')
  const [priority,setPriority] = useState('')
  const [page,setPage] = useState(1)
  const [total,setTotal] = useState(0)
  
  const limit=12

  useEffect(()=>{
    const fetchProjects=async()=>{
      setLoading(true)
      try {
        const query = new URLSearchParams()
        if(search) query.append('search', search)
        if(status) query.append('status', status)
        if(priority) query.append('priority', priority)
        query.append('page', page)
        query.append('limit', limit)
        
        const res=await api.get(`/projects?${query.toString()}`)
        setProjects(res.data.data||[])
        setTotal(res.data.total||0)
      } catch(err){
        console.log("err in fetchProjects",err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  },[search,status,priority,page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        {(user?.role==='admin' || user?.role==='manager') && (
          <Link to="/projects/new">
            <Button><Plus size={16} /> New Project</Button>
          </Link>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <input
          className="border border-slate-200 rounded-md px-3 py-1.5 text-[14px] w-56 outline-none focus:border-slate-300"
          placeholder="Search projects..."
          value={search}
          onChange={e=>{setSearch(e.target.value);setPage(1)}}
        />
        <select 
          className="border border-slate-200 rounded-md px-3 py-1.5 text-[14px] outline-none bg-white" 
          value={status} 
          onChange={e=>{setStatus(e.target.value);setPage(1)}}
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <select 
          className="border border-slate-200 rounded-md px-3 py-1.5 text-[14px] outline-none bg-white" 
          value={priority} 
          onChange={e=>{setPriority(e.target.value);setPage(1)}}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i=><Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p=>(
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
          
          {projects.length===0 && (
            <div className="text-center py-12 text-slate-500">
              No projects found matching your criteria.
            </div>
          )}
          
          {total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-[13px] text-slate-500">{total} projects</p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page===1} 
                  onClick={()=>setPage(p=>p-1)}
                >
                  Prev
                </Button>
                <span className="text-[13px] text-slate-600 px-2">Page {page}</span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page*limit>=total} 
                  onClick={()=>setPage(p=>p+1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
