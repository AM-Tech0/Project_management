import {useState,useEffect} from 'react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function EmailComposer(){
  const [members,setMembers] = useState([])
  const [recipient,setRecipient] = useState('')
  const [subject,setSubject] = useState('')
  const [message,setMessage] = useState('')
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    api.get('/team/members').then(res=>{
      setMembers(res.data.data||[])
    }).catch(e=>console.log(e))
  },[])

  const handleSend=async(e)=>{
    e.preventDefault()
    if(!recipient || !subject || !message) return
    setLoading(true)
    try {
      await api.post('/email/send',{to:recipient, subject, text:message})
      toast.success('Email sent successfully')
      setRecipient('')
      setSubject('')
      setMessage('')
    } catch(err){
      console.log("email err",err)
      toast.error('Failed to send email')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-[16px] font-medium text-slate-900 mb-4">Compose Email</h3>
        <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-slate-700">Recipient</label>
            <select 
              className="border border-slate-200 rounded-md px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white"
              value={recipient}
              onChange={e=>setRecipient(e.target.value)}
              required
            >
              <option value="">Select a team member</option>
              {members.map(m=>(
                <option key={m._id} value={m.email}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          
          <Input 
            label="Subject" 
            required 
            value={subject} 
            onChange={e=>setSubject(e.target.value)} 
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-slate-700">Message</label>
            <textarea
              required
              className="border border-slate-200 rounded-md px-3 py-2 text-[14px] w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[150px]"
              maxLength={2000}
              value={message}
              onChange={e=>setMessage(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Send Email</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
