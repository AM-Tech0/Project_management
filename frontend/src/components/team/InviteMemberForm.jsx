import {useState} from 'react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function InviteMemberForm({isOpen, onClose, onInvited}){
  const [email,setEmail]=useState('')
  const [role,setRole]=useState('member')
  const [loading,setLoading]=useState(false)

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/users/invite',{email,role})
      toast.success('Invitation sent')
      if(onInvited) onInvited()
      setEmail('')
      setRole('member')
      onClose()
    } catch(err){
      console.log("invite err",err)
      toast.error(err.response?.data?.message || 'Failed to send invite')
    }
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite New Member" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email Address" 
          type="email" 
          required 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-slate-700">Role</label>
          <select 
            className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white w-full"
            value={role} 
            onChange={e=>setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Send Invite</Button>
        </div>
      </form>
    </Modal>
  )
}
