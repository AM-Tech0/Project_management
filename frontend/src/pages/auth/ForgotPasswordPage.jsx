import {useState} from 'react'
import {Link} from 'react-router-dom'
import api from '../../utils/axios'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPasswordPage(){
  const [email,setEmail]=useState('')
  const [loading,setLoading]=useState(false)
  const [sent,setSent]=useState(false)

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password',{email})
    } catch(err){
      console.log("forgot password err",err)
      // always show sent to avoid email enumeration
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Reset Password</h2>
      {sent ? (
        <div className="text-center">
          <p className="text-[14px] text-slate-600 mb-6">
            If this email exists in our system, we have sent a password reset link.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">Back to login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[14px] text-slate-600 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <Input 
            label="Email" 
            type="email" 
            required 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
          />
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[13px] text-blue-600 hover:underline">Back to login</Link>
          </div>
        </form>
      )}
    </div>
  )
}
