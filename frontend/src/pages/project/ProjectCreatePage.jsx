import {useState,useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import api from '../../utils/axios'
import {useAuth} from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ProjectCreatePage(){
  const {user} = useAuth()
  const navigate = useNavigate()
  
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [status,setStatus] = useState('planning')
  const [priority,setPriority] = useState('medium')
  const [startDate,setStartDate] = useState('')
  const [endDate,setEndDate] = useState('')
  const [manager,setManager] = useState('')
  
  const [managersList,setManagersList] = useState([])
  const [loading,setLoading] = useState(false)
  const [errors,setErrors] = useState({})

  useEffect(()=>{
    if(user?.role==='admin'){
      api.get('/team/members').then(res=>{
        const m = (res.data.data||[]).filter(x=>x.role==='manager' || x.role==='admin')
        setManagersList(m)
        if(m.length>0) setManager(m[0]._id)
      }).catch(e=>console.log(e))
    }
  },[user])

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setErrors({})
    
    if(!name.trim()){
      setErrors({name:'Project name is required'})
      return
    }
    if(endDate && startDate && new Date(endDate)<new Date(startDate)){
      setErrors({endDate:'End date must be after start date'})
      return
    }
    
    setLoading(true)
    try {
      const payload = {
        name, description, status, priority, 
        startDate: startDate||undefined, 
        endDate: endDate||undefined,
        manager: manager||undefined
      }
      
      const res = await api.post('/projects', payload)
      toast.success('Project created')
      navigate(`/projects/${res.data.data._id}`)
    } catch(err){
      console.log("create err",err)
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">New Project</h2>
        <p className="text-slate-500 text-[14px] mt-1">Create a new project and add members.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Project Name *"
            value={name}
            onChange={e=>setName(e.target.value)}
            error={errors.name}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-slate-700">Description</label>
            <textarea
              className="border border-slate-200 rounded-md px-3 py-2 text-[14px] w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[100px]"
              value={description}
              onChange={e=>setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-slate-700">Status</label>
              <select 
                className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white"
                value={status} onChange={e=>setStatus(e.target.value)}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-slate-700">Priority</label>
              <select 
                className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white"
                value={priority} onChange={e=>setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="date"
              label="Start Date"
              value={startDate}
              onChange={e=>setStartDate(e.target.value)}
            />
            <Input 
              type="date"
              label="End Date"
              value={endDate}
              onChange={e=>setEndDate(e.target.value)}
              error={errors.endDate}
            />
          </div>
          
          {user?.role==='admin' && managersList.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-slate-700">Project Manager</label>
              <select 
                className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white"
                value={manager} onChange={e=>setManager(e.target.value)}
              >
                {managersList.map(m=>(
                  <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={()=>navigate('/projects')}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
