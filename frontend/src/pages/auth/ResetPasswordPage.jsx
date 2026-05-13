import {useState} from 'react'
import {useNavigate,useParams,Link} from 'react-router-dom'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPasswordPage(){
  const {token} = useParams()
  const navigate = useNavigate()
  
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setError('')
    
    if(password.length < 8){
      return setError('Password must be at least 8 characters')
    }
    if(password !== confirmPassword){
      return setError('Passwords do not match')
    }
    
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`,{password})
      toast.success('Password reset successfully')
      navigate('/login',{replace:true})
    } catch(err){
      console.log("reset err",err)
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.')
    }
    setLoading(false)
  }

  if(!token){
    return <div className="text-center text-red-500">Invalid reset token</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="New Password" 
          type="password" 
          required 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
        />
        <Input 
          label="Confirm New Password" 
          type="password" 
          required 
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
        />
        
        {error && <p className="text-red-500 text-[13px]">{error}</p>}
        
        <Button type="submit" loading={loading} className="w-full">
          Reset Password
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/login" className="text-[13px] text-blue-600 hover:underline">Back to login</Link>
      </div>
    </div>
  )
}
