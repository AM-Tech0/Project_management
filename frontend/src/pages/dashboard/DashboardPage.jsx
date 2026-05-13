import {useState,useEffect} from 'react'
import {useAuth} from '../../hooks/useAuth'
import {useNotifications} from '../../hooks/useNotifications'
import api from '../../utils/axios'
import StatsCard from '../../components/dashboard/StatsCard'
import TaskProgressChart from '../../components/dashboard/TaskProgressChart'
import RecentActivity from '../../components/dashboard/RecentActivity'
import ProjectCard from '../../components/projects/ProjectCard'
import Skeleton from '../../components/ui/Skeleton'
import {LayoutDashboard, FolderKanban, CheckSquare, Users} from 'lucide-react'

export default function DashboardPage(){
  const {user} = useAuth()
  const {notifications} = useNotifications()
  const [stats,setStats] = useState({projects:0, activeTasks:0, teamMembers:0, overdue:0})
  const [tasksByStatus,setTasksByStatus] = useState([])
  const [myProjects,setMyProjects] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    const fetchDashboard=async()=>{
      try {
        const [projRes, tasksRes, teamRes] = await Promise.all([
          api.get('/projects?limit=4'),
          api.get('/tasks/my'),
          user.role!=='member' ? api.get('/team/members') : Promise.resolve({data:{data:[]}})
        ])
        
        const projects = projRes.data.data || []
        const tasks = tasksRes.data.data || []
        const members = teamRes.data.data || []
        
        setMyProjects(projects)
        
        const activeTasks = tasks.filter(t=>t.status==='in_progress').length
        const overdue = tasks.filter(t=>t.dueDate && new Date(t.dueDate)<new Date() && t.status!=='done').length
        
        setStats({
          projects: projects.length, // approximation without total endpoint
          activeTasks,
          teamMembers: members.length,
          overdue
        })
        
        // compute chart data
        const counts = {todo:0, in_progress:0, in_review:0, done:0, blocked:0}
        tasks.forEach(t=>{ if(counts[t.status]!==undefined) counts[t.status]++ })
        setTasksByStatus([
          {name:'To Do', count:counts.todo},
          {name:'In Progress', count:counts.in_progress},
          {name:'Review', count:counts.in_review},
          {name:'Done', count:counts.done},
          {name:'Blocked', count:counts.blocked}
        ])
        
      } catch(err){
        console.log("dash fetch err",err)
      } finally {
        setLoading(false)
      }
    }
    if(user) fetchDashboard()
  },[user])

  if(loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[350px] lg:col-span-2" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">Good morning, {user?.name}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Projects" value={stats.projects} icon={<FolderKanban />} />
        <StatsCard label="Active Tasks" value={stats.activeTasks} icon={<CheckSquare />} />
        {user.role!=='member' ? (
          <StatsCard label="Team Members" value={stats.teamMembers} icon={<Users />} />
        ) : (
          <StatsCard label="Completed Tasks" value={tasksByStatus.find(t=>t.name==='Done')?.count||0} icon={<CheckSquare />} />
        )}
        <StatsCard label="Overdue" value={stats.overdue} icon={<LayoutDashboard />} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-[16px] font-medium text-slate-900 mb-6">Task Status</h3>
          <TaskProgressChart data={tasksByStatus} />
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col max-h-[420px]">
          <h3 className="text-[16px] font-medium text-slate-900 mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <RecentActivity activities={notifications.slice(0,8)} />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-[16px] font-medium text-slate-900 mb-4">My Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProjects.length>0 ? myProjects.map(p=>(
            <ProjectCard key={p._id} project={p} />
          )) : (
            <p className="text-slate-500 text-[14px]">No projects found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
