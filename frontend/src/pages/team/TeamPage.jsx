import {useState,useEffect} from 'react'
import api from '../../utils/axios'
import {useAuth} from '../../hooks/useAuth'
import MemberTable from '../../components/team/MemberTable'
import InviteMemberForm from '../../components/team/InviteMemberForm'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import {UserPlus} from 'lucide-react'

export default function TeamPage(){
  const {user} = useAuth()
  const [members,setMembers] = useState([])
  const [loading,setLoading] = useState(true)
  const [inviteOpen,setInviteOpen] = useState(false)

  const fetchTeam=async()=>{
    setLoading(true)
    try {
      const res = await api.get('/team/members')
      setMembers(res.data.data||[])
    } catch(err){
      console.log("err team fetch",err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchTeam()
  },[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Members</h2>
          <p className="text-[14px] text-slate-500 mt-1">Manage people in your workspace</p>
        </div>
        {user?.role==='admin' && (
          <Button onClick={()=>setInviteOpen(true)}>
            <UserPlus size={16} /> Invite Member
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <MemberTable members={members} userRole={user?.role} />
      )}

      {inviteOpen && (
        <InviteMemberForm 
          isOpen={inviteOpen} 
          onClose={()=>setInviteOpen(false)} 
          onInvited={fetchTeam} 
        />
      )}
    </div>
  )
}
