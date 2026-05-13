import {useState} from 'react'
import {useNavigate,useLocation,Link} from 'react-router-dom'
import {useAuth} from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage(){
  const {login} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email,password)
      navigate(from,{replace:true})
    } catch(err){
      console.log("login err",err)
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        {error && <p className="text-red-500 text-[13px]">{error}</p>}
        
        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>
      <div className="mt-6 text-center text-[13px] text-slate-500">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot your password?</Link>
        <span className="mx-2">•</span>
        <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link>
      </div>
    </div>
  )
}
