import {useState,useEffect} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import api from '../../utils/axios'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function RegisterPage(){
  const navigate = useNavigate()
  
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  useEffect(()=>{
    // Check if setup is allowed/required
    api.get('/auth/setup-status').then(res=>{
      if(res.data.data?.setupRequired===false){
        // Setup not required or admin already exists? Usually implies registration is restricted.
        // But let's let them register or redirect based on logic.
      }
    }).catch(e=>console.log(e))
  },[])

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
      await api.post('/auth/register',{name,email,password})
      // Usually redirects to login or auto-logs in. Let's redirect to login.
      navigate('/login',{replace:true})
    } catch(err){
      console.log("register err",err)
      setError(err.response?.data?.message || 'Failed to register')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Full Name" 
          type="text" 
          required 
          value={name} 
          onChange={e=>setName(e.target.value)} 
        />
        <Input 
          label="Email" 
          type="email" 
          required 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
        />
        <Input 
          label="Password" 
          type="password" 
          required 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          required 
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
        />
        
        {error && <p className="text-red-500 text-[13px]">{error}</p>}
        
        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </form>
      <div className="mt-6 text-center text-[13px] text-slate-500">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </div>
    </div>
  )
}
