import {useState,useEffect} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import Avatar from '../../components/ui/Avatar'
import RoleBadge from '../../components/team/RoleBadge'
import Skeleton from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import {fmtDate} from '../../utils/formatters'

export default function MemberDetailPage(){
  const {id} = useParams()
  const navigate = useNavigate()
  
  const [member,setMember] = useState(null)
  const [loading,setLoading] = useState(true)
  const [changingRole,setChangingRole] = useState(false)
  const [newRole,setNewRole] = useState('')
  
  const fetchMember=async()=>{
    setLoading(true)
    try {
      const res = await api.get(`/team/members/${id}`)
      const found = res.data.data
      if(found){
        setMember(found)
        setNewRole(found.role)
      } else {
        setMember(null)
      }
    } catch(err){
      console.log("err member detail",err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchMember()
  },[id])

  const handleRoleChange=async()=>{
    setChangingRole(true)
    try {
      await api.put(`/users/${id}`,{role:newRole})
      toast.success('Role updated')
      setMember({...member, role:newRole})
    } catch(err){
      console.log("err role change",err)
      toast.error('Failed to change role')
    }
    setChangingRole(false)
  }

  if(loading) return <Skeleton className="h-64" />
  if(!member) return <div className="text-slate-500">Member not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={()=>navigate(-1)} className="text-[14px] text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Team
      </button>
      
      <div className="bg-white border border-slate-200 rounded-lg p-8">
        <div className="flex items-start gap-6">
          <Avatar name={member.name} size="lg" className="w-20 h-20 text-[24px]" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
              <RoleBadge role={member.role} />
            </div>
            <p className="text-slate-500">{member.email}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-[14px]">
              <div>
                <span className="text-slate-500 block mb-1">Joined</span>
                <span className="font-medium text-slate-900">{fmtDate(member.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-[16px] font-medium text-slate-900 mb-4">Admin Controls</h3>
        <div className="flex items-end gap-4 max-w-sm">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-slate-700">Change Role</label>
            <select 
              className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white"
              value={newRole}
              onChange={e=>setNewRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button 
            onClick={handleRoleChange} 
            disabled={newRole===member.role} 
            loading={changingRole}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
