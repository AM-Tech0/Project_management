# FRONTEND BUILD GUIDE — Project Management App
### For: Google Antigravity | Context: MERN Stack Industry Assessment
### Backend: Already complete. Notification model exists, controller/routes NOT built.

---

## CRITICAL IDENTITY RULES (READ FIRST, EVERY SESSION)

You are helping a **4th year BTech student** complete a frontend for an industry assessment.

**The code must NOT look AI-generated.**

### Mandatory Coding Style
```js
// GOOD — student style
const getTasks= async()=>{
  const res=await axios.get(`/tasks/project/${id}`)
  setTasks(res.data)
}

// BAD — AI style
const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
  const response = await axios.get(`/tasks/project/${projectId}`);
  return response.data;
};
```

### Style Rules (non-negotiable)
- No semicolons ~90% of the time. Add one occasionally, randomly.
- No Prettier-style uniform spacing. `const x=await thing()` not `const x = await thing()`
- Variable names: `data`, `res`, `info`, `item`, `val`, `temp`, `resData` — NEVER `transformedProjectAnalyticsResponse`
- Mix single and double quotes in same file inconsistently
- Use `for` loops over `.reduce()` or complex `.map()` chains
- Comments are rare and personal: `// todo fix this later` or `// not sure why this works`
- No `.regex` usage — use `.includes()` or `.indexOf()`
- No heavy destructuring patterns
- Use `console.log()` in catch blocks: `console.log("err in fetchTasks", err)`

### Allowed JSX Anti-Patterns (on purpose)
```jsx
// Acceptable: messy but functional
{loading && <div>Loading...</div>}
{!loading && data.length===0 && <p>Nothing here</p>}
```

---

## DESIGN SYSTEM (STRICT — DO NOT DEVIATE)

### Color Tokens (use these class names or inline styles)
```js
// constants/colors or inline
bg: "#FAFAFA"           // page background
surface: "#FFFFFF"      // cards, panels
primary: "#2563EB"      // blue — CTAs, active states, links
success: "#059669"      // green — done status
danger: "#DC2626"       // red — delete, critical, blocked
text: "#111827"         // main text
muted: "#6B7280"        // secondary text, metadata
border: "#E5E7EB"       // all borders
stickyYellow: "#FEF9C3" // canvas sticky
stickyRose: "#FFE4E6"   // canvas sticky alt
```

### Tailwind Class Mappings
- Background: `bg-[#FAFAFA]`, `bg-white`
- Borders: `border border-slate-200` — **never** `border-2` or colored borders except active state
- Shadows: `shadow-sm` only — **never** `shadow-xl`, `shadow-2xl`
- Rounding: `rounded-md`, `rounded-lg` — **never** `rounded-3xl`, `rounded-full` (except avatars)
- Text sizes: titles `text-2xl font-bold`, headers `text-xl font-semibold`, cards `text-[15px] font-medium`, meta `text-[13px] text-slate-500`
- Spacing: multiples of 4 — `p-4 p-5 p-6 gap-4 gap-5`
- Transitions: `transition-all duration-150` — NO spring animations

### Inspiration: Notion, Linear, GitHub Projects
### Avoid: gradients, neon colors, glassmorphism everywhere, huge shadows, rounded-3xl

### Priority Badges
```jsx
// low
<span className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-[12px]">Low</span>
// medium
<span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-[12px]">Medium</span>
// high
<span className="bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-[12px]">High</span>
// critical
<span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[12px]">Critical</span>
```

### Status Colors (task)
```
todo        → slate/gray
in_progress → blue
in_review   → amber/yellow
done        → green
blocked     → red
```

---

## FOLDER STRUCTURE (EXACT)

```
client/src/
├── assets/images/logo.svg
├── components/
│   ├── ui/          Button, Input, Modal, Dropdown, Badge, Avatar,
│   │                Spinner, Skeleton, Tooltip, EmptyState, ConfirmDialog
│   ├── layout/      Sidebar, Topbar, NotificationPanel, Breadcrumb
│   ├── dashboard/   StatsCard, TaskProgressChart, RecentActivity, ProjectSummaryCard
│   ├── projects/    ProjectCard, ProjectForm, ProjectMemberList, ProjectStatusBadge
│   ├── tasks/       KanbanBoard, KanbanColumn, TaskCard, TaskForm,
│   │                TaskDetail, CommentBox, CommentList, TaskFilters
│   ├── team/        MemberCard, MemberTable, InviteMemberForm, RoleBadge
│   ├── canvas/      CanvasBoard, CanvasToolbar, CanvasTextTool,
│   │                CanvasStickyNote, CanvasCollaborators
│   └── settings/    ProfileForm, EmailComposer, TeamSettingsForm
├── layout/          AppLayout, AuthLayout, RoleLayout
├── routes/          AppRoutes, ProtectedRoute, RoleRoute
├── pages/
│   ├── auth/        LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
│   ├── dashboard/   DashboardPage
│   ├── projects/    ProjectsPage, ProjectDetailPage, ProjectCreatePage
│   ├── tasks/       TasksPage, TaskDetailPage
│   ├── team/        TeamPage, MemberDetailPage
│   ├── canvas/      CanvasPage
│   ├── settings/    SettingsPage
│   └── errors/      NotFoundPage, ForbiddenPage, ServerErrorPage
├── utils/           axios.js, socket.js, auth.js, formatters.js,
│                    validators.js, constants.js
├── context/         AuthContext, SocketContext, NotificationContext
├── hooks/           useAuth, useSocket, useNotifications, useDebounce
├── App.jsx
└── main.jsx
```

---

## MODULE 0 — PROJECT SETUP

### Files: `vite.config.js`, `tailwind.config.js`, `main.jsx`, `App.jsx`

**vite.config.js**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

**tailwind.config.js**
```js
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif']
      }
    }
  }
}
```

**index.html** — Add Inter font via Google Fonts link tag.

**main.jsx** — Wrap App in BrowserRouter + AuthProvider + SocketProvider + NotificationProvider + Toaster from react-hot-toast.

---

## MODULE 1 — UTILS & CONSTANTS

### `src/utils/constants.js`
```js
export const TASK_STATUS=['todo','in_progress','in_review','done','blocked']

export const STATUS_LABEL={
  todo:'To Do',
  in_progress:'In Progress',
  in_review:'In Review',
  done:'Done',
  blocked:'Blocked'
}

export const STATUS_COLOR={
  todo:'bg-slate-100 text-slate-700',
  in_progress:'bg-blue-100 text-blue-700',
  in_review:'bg-yellow-100 text-yellow-800',
  done:'bg-green-100 text-green-800',
  blocked:'bg-red-100 text-red-700'
}

export const PRIORITY_COLOR={
  low:'bg-slate-100 text-slate-700',
  medium:'bg-yellow-100 text-yellow-800',
  high:'bg-orange-100 text-orange-800',
  critical:'bg-red-100 text-red-700'
}

export const PROJECT_STATUS_COLOR={
  planning:'bg-purple-100 text-purple-700',
  active:'bg-green-100 text-green-800',
  on_hold:'bg-yellow-100 text-yellow-800',
  completed:'bg-blue-100 text-blue-700',
  archived:'bg-slate-100 text-slate-600'
}

export const ROLES=['admin','manager','member']
```

### `src/utils/auth.js`
```js
// simple token helpers
export const getToken=()=>localStorage.getItem('token')
export const setToken=(t)=>localStorage.setItem('token',t)
export const clearToken=()=>localStorage.removeItem('token')
```

### `src/utils/formatters.js`
```js
import { format, formatDistanceToNow } from 'date-fns'

export const fmtDate=(d)=>{
  if(!d) return '—'
  return format(new Date(d),'MMM d, yyyy')
}

export const fmtRelative=(d)=>{
  if(!d) return ''
  return formatDistanceToNow(new Date(d),{addSuffix:true})
}

export const truncate=(str,n=60)=>{
  if(!str) return ''
  if(str.length<=n) return str
  return str.slice(0,n)+'...'
}
```

### `src/utils/axios.js`
```js
import axios from 'axios'
import { getToken, setToken, clearToken } from './auth'

const api=axios.create({
  baseURL:'/api/v1',
  withCredentials:true
})

// attach token
api.interceptors.request.use((config)=>{
  const token=getToken()
  if(token){
    config.headers['Authorization']=`Bearer ${token}`
  }
  return config
})

let refreshing=false
let queue=[]

const processQueue=(err,token=null)=>{
  queue.forEach(p=>{
    if(err) p.reject(err)
    else p.resolve(token)
  })
  queue=[]
}

api.interceptors.response.use(
  (res)=>res,
  async(err)=>{
    const original=err.config
    if(err.response?.status===401 && !original._retry){
      if(refreshing){
        return new Promise((resolve,reject)=>{
          queue.push({resolve,reject})
        }).then(token=>{
          original.headers['Authorization']=`Bearer ${token}`
          return api(original)
        })
      }
      original._retry=true
      refreshing=true
      try {
        const res=await axios.post('/api/v1/auth/refresh',{},{withCredentials:true})
        const newToken=res.data.data?.accessToken
        setToken(newToken)
        processQueue(null,newToken)
        original.headers['Authorization']=`Bearer ${newToken}`
        return api(original)
      } catch(e) {
        console.log("refresh failed",e)
        processQueue(e,null)
        clearToken()
        window.location.href='/login'
        return Promise.reject(e)
      } finally {
        refreshing=false
      }
    }
    return Promise.reject(err)
  }
)

export default api
```

### `src/utils/socket.js`
```js
import {io} from 'socket.io-client'

let socket=null

export const getSocket=()=>socket

export const initSocket=(token)=>{
  if(socket) return socket
  socket=io('http://localhost:5000',{
    auth:{token},
    transports:['websocket']
  })
  return socket
}

export const disconnectSocket=()=>{
  if(socket){
    socket.disconnect()
    socket=null
  }
}
```

---

## MODULE 2 — CONTEXT & HOOKS

### `src/context/AuthContext.jsx`
```jsx
import {createContext,useState,useEffect} from 'react'
import api from '../utils/axios'
import { getToken,setToken,clearToken } from '../utils/auth'
import { initSocket,disconnectSocket } from '../utils/socket'

export const AuthContext=createContext(null)

export function AuthProvider({children}){
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    const token=getToken()
    if(token){
      api.get('/auth/me').then(res=>{
        setUser(res.data.data)
        initSocket(token)
      }).catch(()=>{
        clearToken()
      }).finally(()=>setLoading(false))
    } else {
      setLoading(false)
    }
  },[])

  const login=async(email,password)=>{
    const res=await api.post('/auth/login',{email,password})
    const {accessToken,user:u}=res.data.data
    setToken(accessToken)
    setUser(u)
    initSocket(accessToken)
    return u
  }

  const logout=async()=>{
    try { await api.post('/auth/logout') } catch(e){ console.log(e) }
    clearToken()
    disconnectSocket()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user,setUser,login,logout,loading}}>
      {children}
    </AuthContext.Provider>
  )
}
```

### `src/context/SocketContext.jsx`
```jsx
import {createContext,useEffect,useState} from 'react'
import { getSocket } from '../utils/socket'
import { useAuth } from '../hooks/useAuth'

export const SocketContext=createContext(null)

export function SocketProvider({children}){
  const {user}=useAuth()
  const [socket,setSocket]=useState(null)
  const [connected,setConnected]=useState(false)

  useEffect(()=>{
    if(!user) return
    const s=getSocket()
    if(!s) return
    setSocket(s)
    s.on('connect',()=>setConnected(true))
    s.on('disconnect',()=>setConnected(false))
    return ()=>{
      s.off('connect')
      s.off('disconnect')
    }
  },[user])

  return (
    <SocketContext.Provider value={{socket,connected}}>
      {children}
    </SocketContext.Provider>
  )
}
```

### `src/context/NotificationContext.jsx`
```jsx
import {createContext,useState,useEffect,useCallback} from 'react'
import api from '../utils/axios'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'

export const NotificationContext=createContext(null)

export function NotificationProvider({children}){
  const {user}=useAuth()
  const {socket}=useSocket()
  const [notifications,setNotifications]=useState([])
  const [unread,setUnread]=useState(0)

  const fetchUnread=useCallback(async()=>{
    if(!user) return
    try {
      const res=await api.get('/notifications/unread-count')
      setUnread(res.data.data?.count||0)
    } catch(e){ console.log(e) }
  },[user])

  const fetchNotifications=useCallback(async()=>{
    if(!user) return
    try {
      const res=await api.get('/notifications?limit=20')
      setNotifications(res.data.data||[])
    } catch(e){ console.log(e) }
  },[user])

  useEffect(()=>{
    fetchUnread()
    fetchNotifications()
  },[fetchUnread,fetchNotifications])

  useEffect(()=>{
    if(!socket) return
    socket.on('new_notification',(notif)=>{
      setNotifications(prev=>[notif,...prev])
      setUnread(prev=>prev+1)
    })
    return ()=>socket.off('new_notification')
  },[socket])

  const markRead=async(id)=>{
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev=>prev.map(n=>n._id===id?{...n,isRead:true}:n))
      setUnread(prev=>Math.max(0,prev-1))
    } catch(e){ console.log(e) }
  }

  const markAllRead=async()=>{
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev=>prev.map(n=>({...n,isRead:true})))
      setUnread(0)
    } catch(e){ console.log(e) }
  }

  return (
    <NotificationContext.Provider value={{notifications,unread,markRead,markAllRead,fetchNotifications}}>
      {children}
    </NotificationContext.Provider>
  )
}
```

### `src/hooks/useAuth.js`
```js
import {useContext} from 'react'
import {AuthContext} from '../context/AuthContext'
export const useAuth=()=>useContext(AuthContext)
```

### `src/hooks/useSocket.js`
```js
import {useContext} from 'react'
import {SocketContext} from '../context/SocketContext'
export const useSocket=()=>useContext(SocketContext)
```

### `src/hooks/useNotifications.js`
```js
import {useContext} from 'react'
import {NotificationContext} from '../context/NotificationContext'
export const useNotifications=()=>useContext(NotificationContext)
```

### `src/hooks/useDebounce.js`
```js
import {useState,useEffect} from 'react'
export const useDebounce=(val,delay=400)=>{
  const [debounced,setDebounced]=useState(val)
  useEffect(()=>{
    const t=setTimeout(()=>setDebounced(val),delay)
    return ()=>clearTimeout(t)
  },[val,delay])
  return debounced
}
```

---

## MODULE 3 — ROUTING

### `src/routes/ProtectedRoute.jsx`
```jsx
import {Navigate,Outlet,useLocation} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute(){
  const {user,loading}=useAuth()
  const location=useLocation()
  if(loading) return <div className="flex items-center justify-center h-screen"><span className="text-slate-400 text-sm">Loading...</span></div>
  if(!user) return <Navigate to="/login" state={{from:location}} replace />
  return <Outlet />
}
```

### `src/routes/RoleRoute.jsx`
```jsx
import {Navigate,Outlet} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RoleRoute({allowedRoles}){
  const {user}=useAuth()
  if(!user) return <Navigate to="/login" replace />
  if(!allowedRoles.includes(user.role)) return <Navigate to="/403" replace />
  return <Outlet />
}
```

### `src/routes/AppRoutes.jsx`
```jsx
import {Routes,Route,Navigate} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import AppLayout from '../layout/AppLayout'
import AuthLayout from '../layout/AuthLayout'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import ProjectsPage from '../pages/projects/ProjectsPage'
import ProjectDetailPage from '../pages/projects/ProjectDetailPage'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage'
import TasksPage from '../pages/tasks/TasksPage'
import TaskDetailPage from '../pages/tasks/TaskDetailPage'
import TeamPage from '../pages/team/TeamPage'
import MemberDetailPage from '../pages/team/MemberDetailPage'
import SettingsPage from '../pages/settings/SettingsPage'
import CanvasPage from '../pages/canvas/CanvasPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import ForbiddenPage from '../pages/errors/ForbiddenPage'
import ServerErrorPage from '../pages/errors/ServerErrorPage'

export default function AppRoutes(){
  return (
    <Routes>
      {/* public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/canvas" element={<CanvasPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* admin + manager only */}
          <Route element={<RoleRoute allowedRoles={['admin','manager']} />}>
            <Route path="/projects/new" element={<ProjectCreatePage />} />
            <Route path="/team/:id" element={<MemberDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

---

## MODULE 4 — LAYOUTS

### `src/layout/AuthLayout.jsx`
Clean centered card. No sidebar.
```jsx
import {Outlet} from 'react-router-dom'
export default function AuthLayout(){
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">ProjectHub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Project Management</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
```

### `src/layout/AppLayout.jsx`
Main layout: sidebar (240px fixed) + topbar (sticky) + content area.
- Import Sidebar, Topbar, NotificationPanel
- Show offline banner if socket disconnected
- `<Outlet />` is the page content

**Structure:**
```jsx
<div className="flex h-screen bg-[#FAFAFA]">
  <Sidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Topbar />
    {/* offline banner */}
    {!connected && (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1.5 text-[13px] text-yellow-800">
        You are offline. Real-time updates paused.
      </div>
    )}
    <main className="flex-1 overflow-y-auto p-6">
      <Outlet />
    </main>
  </div>
</div>
```

### `src/components/layout/Sidebar.jsx`
Design specs:
- `bg-[#FAFAFA] border-r border-slate-200 w-[240px] flex-shrink-0 flex flex-col`
- Logo at top (16px padding)
- Nav items from lucide-react icons
- Active: `bg-blue-50 border-l-2 border-blue-600 text-blue-700`
- Inactive: `text-slate-600 hover:bg-slate-100`
- Bottom: user avatar + name + role badge

Nav items by role:
- admin: Dashboard, Projects, Tasks, Team, Settings
- manager: Dashboard, Projects, Tasks, Team, Settings
- member: Dashboard, Tasks (My Tasks), Team, Settings

Icons: `LayoutDashboard, FolderKanban, CheckSquare, Users, Settings` from lucide-react.

### `src/components/layout/Topbar.jsx`
- `bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-6 h-14 flex items-center justify-between`
- Left: page breadcrumb or empty
- Right: notification bell (with unread badge) + avatar dropdown (profile link, logout)
- Notification bell opens `NotificationPanel` as absolute panel

### `src/components/layout/NotificationPanel.jsx`
- `absolute right-4 top-12 w-[360px] bg-white border border-slate-200 rounded-lg shadow-sm z-50 max-h-[480px] overflow-hidden`
- Header: "Notifications" + "Mark all read" button
- List: compact notification rows
  - unread: `bg-blue-50/50`
  - read: `bg-white`
  - each has: dot indicator, message text (text-[13px]), relative time (text-[12px] text-slate-400)
- Empty state if no notifications

---

## MODULE 5 — UI PRIMITIVES

Build these in `src/components/ui/`

### `Button.jsx`
```jsx
// variants: primary (blue), secondary (white border), danger (red), ghost (no border)
// sizes: sm, md (default)
// loading prop → shows spinner, disabled
export default function Button({children,variant='primary',size='md',loading,disabled,...props}){
  const base="inline-flex items-center gap-2 font-medium rounded-md transition-all duration-150 disabled:opacity-60"
  const variants={
    primary:"bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
    secondary:"bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    danger:"bg-red-600 text-white hover:bg-red-700 border border-red-600",
    ghost:"text-slate-600 hover:bg-slate-100 border border-transparent"
  }
  const sizes={sm:"px-3 py-1.5 text-[13px]",md:"px-4 py-2 text-[14px]"}
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} disabled={disabled||loading} {...props}>
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
```

### `Input.jsx`
```jsx
// label, error, helper props
// className: border border-slate-200 rounded-md px-3 py-2 text-[14px] w-full
// focus: outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100
// error state: border-red-400
```

### `Modal.jsx`
```jsx
// isOpen, onClose, title, children, size (sm/md/lg)
// backdrop: fixed inset-0 bg-black/30 z-50 flex items-center justify-center
// panel: bg-white border border-slate-200 rounded-lg
// header: px-5 py-4 border-b border-slate-200 flex justify-between
// body: p-5
```

### `Badge.jsx`
```jsx
// Generic badge — accepts className override
// Default: rounded-full px-2 py-0.5 text-[12px] font-medium
```

### `Avatar.jsx`
```jsx
// Shows initials if no image. rounded-full bg-slate-200 text-slate-600
// sizes: sm (w-6 h-6 text-[10px]), md (w-8 h-8 text-[12px]), lg (w-10 h-10 text-[14px])
```

### `Skeleton.jsx`
```jsx
// animate-pulse bg-slate-200 rounded-md
// Use as: <Skeleton className="h-4 w-32" /> etc
export default function Skeleton({className=''}){
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
}
```

### `EmptyState.jsx`
```jsx
// icon (lucide), title, description, optional action button
// centered, compact, no stock illustrations
// Example:
// <EmptyState icon={<CheckSquare />} title="No tasks yet" desc="Create your first task to get started" />
```

### `ConfirmDialog.jsx`
```jsx
// Wraps Modal. Props: isOpen, onClose, onConfirm, title, message, confirmLabel, danger
// Two buttons: Cancel (secondary), Confirm (danger or primary)
```

### `Spinner.jsx`
```jsx
// Small centered spinner for full-page loading states
// w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin
```

---

## MODULE 6 — AUTH PAGES

### `src/pages/auth/LoginPage.jsx`
- Title: "Sign in"
- Fields: email, password
- Submit calls `login()` from AuthContext
- On success redirect to `/dashboard` (or `state.from`)
- Error: inline red text below form
- Link to `/forgot-password`
- Student-style: no fancy animations, just a form

```jsx
// student-style example
const handleSubmit=async(e)=>{
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const u=await login(email,password)
    navigate(from||'/dashboard',{replace:true})
  } catch(err){
    console.log("login err",err)
    setError('Invalid email or password')
  }
  setLoading(false)
}
```

### `src/pages/auth/RegisterPage.jsx`
- Check `GET /auth/setup-status` on mount; if `setupRequired: false`, redirect to `/login`
- Fields: name, email, password, confirm password
- Basic validation: passwords match, password min 8 chars (use `.length`, not regex)
- On success: redirect to `/dashboard`

### `src/pages/auth/ForgotPasswordPage.jsx`
- Single email field
- On submit, call `POST /auth/forgot-password`
- Always show: "If this email exists, we sent a reset link."
- Button disabled + spinner during request

### `src/pages/auth/ResetPasswordPage.jsx`
- On mount: could validate token presence (just check params exist)
- Fields: new password, confirm password
- Call `POST /auth/reset-password/:token`
- On success: redirect to `/login` with success toast

---

## MODULE 7 — DASHBOARD PAGE

**File:** `src/pages/dashboard/DashboardPage.jsx`

### Layout
```
┌──────────────────────────────────────┐
│ Page title: "Dashboard"              │
│ Subtitle: "Good morning, [name]"     │
├──────────┬───────────┬───────────────┤
│ StatsCard│ StatsCard │ StatsCard ... │
├──────────┴───────────┴───────────────┤
│ Task Status Chart  │ Recent Activity │
├────────────────────┴─────────────────┤
│ My Projects (cards row)              │
└──────────────────────────────────────┘
```

### Stats (Admin/Manager)
Fetch from `/projects` and `/tasks/my` to compute:
- Total Projects
- Active Tasks (status: in_progress)
- Team Members (from `/team/members`)
- Overdue Tasks (dueDate < today, not done)

### Stats (Member)
- My Tasks Today (due today)
- Due This Week
- Completed This Month

### `StatsCard.jsx`
```jsx
<div className="bg-white border border-slate-200 rounded-lg p-5">
  <p className="text-[13px] text-slate-500 mb-1">{label}</p>
  <p className="text-3xl font-bold text-slate-900">{value}</p>
  {/* optional: tiny icon right-aligned */}
</div>
```

### `TaskProgressChart.jsx`
Use Recharts `PieChart` or `BarChart`.
- No grid lines: `CartesianGrid` omitted
- Muted colors from constants
- Lots of whitespace

```jsx
// Example: simple bar chart of tasks by status
import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,Tooltip} from 'recharts'
// No CartesianGrid, no Legend (optional), simple tooltip
```

### `RecentActivity.jsx`
- List of last 10 notifications from NotificationContext
- Small rows: dot + message + timestamp
- "No recent activity" empty state

### Loading states: Use `<Skeleton />` for each card and chart area.

---

## MODULE 8 — PROJECTS MODULE

### `src/pages/projects/ProjectsPage.jsx`

**API:** `GET /projects?status=&priority=&search=`

Layout:
- Header row: "Projects" title + "New Project" button (admin/manager only)
- Filter bar: status select, priority select, search input
- Toggle: grid/list view (simple state)
- Project cards grid (3 cols desktop, 2 tablet, 1 mobile)
- Pagination (simple prev/next, `?page=1&limit=12`)

**Filter bar student style:**
```jsx
<div className="flex flex-wrap gap-3 items-center">
  <input
    className="border border-slate-200 rounded-md px-3 py-1.5 text-[14px] w-56 outline-none focus:border-slate-300"
    placeholder="Search projects..."
    value={search}
    onChange={e=>setSearch(e.target.value)}
  />
  <select className="border border-slate-200 rounded-md px-3 py-1.5 text-[14px] outline-none" value={status} onChange={e=>setStatus(e.target.value)}>
    <option value="">All Status</option>
    <option value="active">Active</option>
    ...
  </select>
</div>
```

### `ProjectCard.jsx`
```jsx
<div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-all duration-150">
  {/* top row: title + status badge */}
  {/* priority badge */}
  {/* description truncated 80 chars */}
  {/* progress bar: h-1.5 bg-slate-100 rounded-full, fill bg-blue-600 */}
  {/* bottom row: due date | member avatars (stacked, max 3 shown) */}
</div>
```

### `src/pages/projects/ProjectDetailPage.jsx`

**API:** `GET /projects/:id` + `GET /projects/:id/stats`

Layout:
- Header: name + status badge + edit button (admin/manager)
- Tabs: Overview | Tasks | Canvas | Members
- Tab content renders conditionally (not React Router tabs)

**Overview tab:**
- Description, dates, manager info
- Stats row: tasks by status (small count badges)
- Progress bar
- Members list

**Tasks tab:**
- Renders `<KanbanBoard projectId={id} />`

**Canvas tab:**
- Link or inline `<CanvasPage />` — navigate to `/projects/:id/canvas`

**Members tab:**
- List of members with roles
- Add/remove buttons (admin/manager only)
- Calls `POST /projects/:id/members` and `DELETE /projects/:id/members/:userId`

### `src/pages/projects/ProjectCreatePage.jsx`

**API:** `POST /projects`

Form fields: name*, description, status, priority, startDate, endDate, manager (admin only — dropdown of managers), initial members (multi-select)

Validation:
```js
// student style validation
if(!name.trim()){
  setErrors({name:'Project name is required'})
  return
}
if(endDate && startDate && new Date(endDate)<new Date(startDate)){
  setErrors({endDate:'End date must be after start date'})
  return
}
```

On success: `navigate('/projects/'+res.data.data._id)`

---

## MODULE 9 — TASK / KANBAN MODULE

**This is the most important UI. Keep it calm and lightweight.**

### `src/components/tasks/KanbanBoard.jsx`

**API:** `GET /tasks/project/:projectId?view=kanban`

- Groups tasks by status columns
- Uses `@dnd-kit/core` for drag and drop
- Real-time: listen for `task_created`, `task_updated`, `task_deleted` socket events
- On drop: optimistic UI update first, then `PATCH /tasks/:id/status`, revert on error

```jsx
import {DndContext,closestCenter,PointerSensor,useSensor,useSensors} from '@dnd-kit/core'

// columns in order:
const COLS=['todo','in_progress','in_review','done','blocked']
```

**Student-style drag handler:**
```jsx
const handleDragEnd=async(event)=>{
  const {active,over}=event
  if(!over) return
  const taskId=active.id
  const newStatus=over.id

  // optimistic update
  const prev=[...tasks]
  setTasks(tasks.map(t=>t._id===taskId?{...t,status:newStatus}:t))

  try {
    await api.patch(`/tasks/${taskId}/status`,{status:newStatus})
    socket?.emit('task_update',{taskId,projectId,changes:{status:newStatus}})
  } catch(e){
    console.log("drag failed",e)
    setTasks(prev) // revert
    toast.error('Failed to update task')
  }
}
```

### `src/components/tasks/KanbanColumn.jsx`

```jsx
// SortableContext wrapper + useDroppable
<div className="min-w-[300px] flex-shrink-0">
  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-medium text-slate-700">{STATUS_LABEL[status]}</span>
      <span className="text-[12px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{tasks.length}</span>
    </div>
    {/* + add task button (admin/manager only) */}
  </div>
  <div className="space-y-2">
    {tasks.map(t=><TaskCard key={t._id} task={t} />)}
  </div>
</div>
```

### `src/components/tasks/TaskCard.jsx`

```jsx
<div className="bg-white border border-slate-200 rounded-md p-4 hover:shadow-sm hover:border-slate-300 transition-all duration-150 cursor-pointer">
  {/* priority badge top right */}
  <p className="text-[15px] font-medium text-slate-900 mb-2">{task.title}</p>
  {/* labels (small tags) */}
  <div className="flex items-center justify-between mt-3">
    <div className="flex -space-x-1">
      {/* assignee avatars stacked */}
    </div>
    <span className="text-[12px] text-slate-400">{fmtDate(task.dueDate)}</span>
  </div>
  {/* overdue indicator */}
  {isOverdue && <span className="text-[11px] text-red-600 mt-1 block">Overdue</span>}
</div>
```

Click opens TaskDetail modal.

### `src/components/tasks/TaskDetail.jsx`

Modal layout: two-column on desktop (md+), single column on mobile.

Left column:
- Title (editable inline for admin/manager)
- Description
- Status dropdown
- Priority badge + dropdown
- Due date
- Assignees (multi-select)
- Labels

Right column:
- Comments list `<CommentList />`
- Comment input `<CommentBox />`
- Typing indicator (from socket)

**API calls:**
- `GET /tasks/:id` on mount
- `PUT /tasks/:id` for edits (admin/manager)
- `PATCH /tasks/:id/status` for status (assigned members too)
- `POST /tasks/:id/comments` for comment

**Socket integration:**
```jsx
useEffect(()=>{
  if(!socket||!task) return
  socket.on('typing_indicator',(data)=>{
    if(data.taskId===task._id) setTypingUser(data.user)
  })
  return ()=>socket.off('typing_indicator')
},[socket,task])
```

### `src/components/tasks/CommentBox.jsx`
```jsx
// textarea + send button
// on focus: emit typing event (debounced 300ms)
// on submit: call POST /tasks/:id/comments
// clear input after send
const handleTyping=()=>{
  socket?.emit('typing',{projectId,taskId:task._id,user:{name:user.name}})
}
```

### `src/components/tasks/TaskForm.jsx`
Modal form for create/edit task.
- Fields: title, description, status, priority, dueDate, assignedTo (multi-select), labels
- Warning if dueDate > project endDate (yellow border, warning text) — don't block
- `POST /tasks/project/:projectId` to create
- Emits `task_created` event after success (or let backend socket do it)

### `src/pages/tasks/TasksPage.jsx`
"My Tasks" view — `GET /tasks/my?status=&dueDate=`
- Simple table or card list (not kanban)
- Filters: status, due date
- Click → task detail modal

---

## MODULE 10 — TEAM MODULE

### `src/pages/team/TeamPage.jsx`

**API:** `GET /team/members`

Layout:
- Header: "Team" + "Invite Member" button (admin only)
- Member table or grid

**MemberTable.jsx** columns:
| Name | Role | Email | Last Seen | Active Tasks | Status |

```jsx
<table className="w-full text-[14px]">
  <thead>
    <tr className="border-b border-slate-200 text-[13px] text-slate-500">
      <th className="text-left pb-3 font-medium">Name</th>
      <th className="text-left pb-3 font-medium">Role</th>
      ...
    </tr>
  </thead>
  <tbody>
    {members.map(m=>(
      <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-100">
        ...
      </tr>
    ))}
  </tbody>
</table>
```

**RoleBadge.jsx:**
- admin: `bg-red-100 text-red-700`
- manager: `bg-blue-100 text-blue-700`
- member: `bg-slate-100 text-slate-600`

### `src/pages/team/MemberDetailPage.jsx`
**API:** `GET /team/members/:id`

- Profile card (avatar, name, email, role, joined, last seen)
- Assigned tasks list (from task filter)
- Admin actions: change role, deactivate/activate

### `InviteMemberForm.jsx`
Modal. Fields: email, role select.
- `POST /users/invite`
- Success toast: "Invitation sent"
- Error: "User already in team" (handle 400 response)

---

## MODULE 11 — SETTINGS PAGE

### `src/pages/settings/SettingsPage.jsx`

Tabbed layout with vertical tabs on left, content on right.

```jsx
// tabs based on role
const tabs=['Profile']
if(user.role==='admin') tabs.push('Team','Email','General')
else tabs.push('General')
```

**Profile Tab** (all roles):
- Edit name, avatar URL
- Change password section (current, new, confirm)
- `PUT /users/:id` to save

**Team Tab** (admin only):
- Edit team name, description: `PUT /team`
- Danger zone: clear archived projects (confirm dialog first)

**Email Tab** (admin only) — `EmailComposer.jsx`:
- Recipient dropdown (all team members from `GET /team/members`)
- Subject input
- Message textarea (max 2000 chars)
- Send button → `POST /email/send`
- Sent emails log table below → `GET /email/logs`

**General Tab**:
- Notification preferences toggles (stubbed ok)
- Theme toggle (stubbed or basic)

---

## MODULE 12 — CANVAS PAGE

### `src/pages/canvas/CanvasPage.jsx`

**API:** `GET /canvas/project/:projectId` on mount, `PUT /canvas/project/:projectId` for save

Full-page canvas (minus topbar):
```
┌──────────────┬──────────────────────────────────┐
│  Toolbar     │         Canvas Area               │
│  (left,fixed)│    bg-[#FAFAFA] full height       │
└──────────────┴──────────────────────────────────┘
```

### `CanvasBoard.jsx`

```jsx
import {useEffect,useRef,useState} from 'react'
import * as fabric from 'fabric'

export default function CanvasBoard({projectId}){
  const canvasRef=useRef(null)
  const [canvas,setCanvas]=useState(null)
  const [activeTool,setActiveTool]=useState('select')
  const saveTimer=useRef(null)

  useEffect(()=>{
    const c=new fabric.Canvas(canvasRef.current,{
      backgroundColor:'#FAFAFA',
      width:window.innerWidth-240-64,
      height:window.innerHeight-56
    })
    setCanvas(c)

    // load from API
    api.get(`/canvas/project/${projectId}`).then(res=>{
      const data=res.data.data?.data
      if(data) c.loadFromJSON(data,()=>c.renderAll())
    }).catch(e=>console.log("canvas load err",e))

    return ()=>c.dispose()
  },[projectId])

  // auto-save every 5s if dirty
  useEffect(()=>{
    if(!canvas) return
    const onModified=()=>{
      clearTimeout(saveTimer.current)
      saveTimer.current=setTimeout(()=>saveCanvas(canvas),5000)
    }
    canvas.on('object:modified',onModified)
    canvas.on('object:added',onModified)
    canvas.on('object:removed',onModified)
    return ()=>{
      canvas.off('object:modified',onModified)
      clearTimeout(saveTimer.current)
    }
  },[canvas])

  const saveCanvas=async(c)=>{
    try {
      const json=c.toJSON()
      await api.put(`/canvas/project/${projectId}`,{data:json})
    } catch(err){
      console.log("canvas save err",err)
      if(err.response?.status===409){
        toast.error('Canvas was updated by someone else. Reload?')
      }
    }
  }

  // tool handlers
  const addStickyNote=(color='#FEF9C3')=>{
    if(!canvas) return
    const rect=new fabric.Rect({width:160,height:120,fill:color,rx:4,ry:4,left:100,top:100})
    const text=new fabric.IText('Note...',{fontSize:14,left:110,top:115,fill:'#374151',width:140})
    canvas.add(rect,text)
    canvas.renderAll()
  }

  const addText=()=>{
    if(!canvas) return
    const t=new fabric.IText('Text here',{left:150,top:150,fontSize:16,fill:'#111827'})
    canvas.add(t)
    canvas.setActiveObject(t)
    canvas.renderAll()
  }

  const addRect=()=>{
    if(!canvas) return
    const r=new fabric.Rect({width:120,height:80,fill:'transparent',stroke:'#6B7280',strokeWidth:1.5,left:200,top:200})
    canvas.add(r)
    canvas.renderAll()
  }

  const enableDraw=(active)=>{
    if(!canvas) return
    canvas.isDrawingMode=active
    if(active){
      canvas.freeDrawingBrush.width=2
      canvas.freeDrawingBrush.color='#374151'
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <CanvasToolbar activeTool={activeTool} setActiveTool={setActiveTool} onAddText={addText} onAddSticky={addStickyNote} onAddRect={addRect} onDraw={enableDraw} onClear={()=>canvas?.clear()} userRole={user.role} />
      <div className="flex-1 overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
```

### `CanvasToolbar.jsx`
```jsx
// Fixed left panel: 52px wide, vertical icon buttons
// bg-white/90 backdrop-blur border-r border-slate-200
// Tools: Select (MousePointer2), Text (Type), Sticky (StickyNote), 
//        Rectangle (Square), Draw (Pencil), Eraser (Eraser)
// Active tool: bg-blue-50 text-blue-600 border border-blue-200 rounded-md
// Member restriction: show only Text + StickyNote for member role

// Color selector for sticky: two swatches (#FEF9C3, #FFE4E6) — small circles below sticky icon
```

### `CanvasCollaborators.jsx`
```jsx
// Shows avatars of users currently in the canvas room (from socket room join events)
// Top-right floating: "In this canvas: [Avatar][Avatar]..."
// Max 4 shown, +N for rest
```

### Socket integration for canvas:
```jsx
// in CanvasBoard after canvas init:
socket?.emit('join_project',{projectId})

socket?.on('canvas_updated',(data)=>{
  // apply delta — for simplicity, reload full canvas JSON
  if(data.fullData){
    canvas.loadFromJSON(data.fullData,()=>canvas.renderAll())
  }
})
```

---

## MODULE 13 — NOTIFICATION PANEL (FRONTEND)

**Note:** Backend notification routes ARE built. Only backend notification controller and routes for sending exist (triggered by task/project events). The frontend reads them.

### `NotificationPanel.jsx` (already referenced in Topbar)

Reads from NotificationContext. Renders:
- Bell icon with `unread` count badge (red dot, max 99+)
- Click → toggle panel
- Panel: list of notifications, mark-all-read button
- Each row: click calls `markRead(id)` then navigate to `notif.link`

---

## MODULE 14 — ERROR PAGES

### `NotFoundPage.jsx`
```jsx
<div className="flex flex-col items-center justify-center h-full gap-4">
  <p className="text-6xl font-bold text-slate-200">404</p>
  <p className="text-[15px] text-slate-600">Page not found</p>
  <Link to="/dashboard" className="text-blue-600 text-[14px] hover:underline">Back to dashboard</Link>
</div>
```

### `ForbiddenPage.jsx`
```jsx
// Same style, message: "You don't have permission to view this page."
// CTA: "Go back" button
```

### `ServerErrorPage.jsx`
```jsx
// 500 style page
// "Something went wrong on our end."
```

---

## MODULE 15 — MOBILE RESPONSIVENESS

Apply at these breakpoints: `375px (default/sm)`, `768px (md)`, `1280px (lg)`

- Sidebar: hidden on mobile (`hidden md:flex`), hamburger drawer on mobile
- Kanban board: `flex overflow-x-auto gap-4` with `snap-x snap-mandatory` for mobile
- Tables collapse to cards on mobile: use `hidden md:table-header-group` pattern
- Modals: full-width on mobile (`w-full md:max-w-lg`)
- Stats cards: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Canvas: warn user on mobile that it's best on desktop

---

## COMMON PATTERNS TO USE EVERYWHERE

### Loading state pattern
```jsx
if(loading) return (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
)
```

### Error handling in pages
```jsx
} catch(err){
  console.log("err in fetchProjects",err)
  toast.error('Something went wrong')
}
```

### Pagination pattern
```jsx
const [page,setPage]=useState(1)
const [total,setTotal]=useState(0)
const limit=12

// in fetch:
const res=await api.get(`/projects?page=${page}&limit=${limit}`)
setProjects(res.data.data)
setTotal(res.data.total)

// render:
<div className="flex items-center justify-between mt-6">
  <p className="text-[13px] text-slate-500">{total} projects</p>
  <div className="flex gap-2">
    <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="...">Prev</button>
    <span className="text-[13px] text-slate-600">Page {page}</span>
    <button disabled={page*limit>=total} onClick={()=>setPage(p=>p+1)} className="...">Next</button>
  </div>
</div>
```

### Toast usage
```jsx
import toast from 'react-hot-toast'
toast.success('Project created')
toast.error('Failed to save')
// no custom styling — keep default react-hot-toast
```

---

## WHAT NOT TO BUILD (REMINDERS)

- ❌ No gradients anywhere (no `bg-gradient-to-*`)
- ❌ No `shadow-xl` or `shadow-2xl`
- ❌ No `rounded-3xl`
- ❌ No neon or purple colors
- ❌ No glassmorphism panels everywhere (only topbar gets it)
- ❌ No stock illustrations in empty states
- ❌ No `.reduce()` or complex method chains in logic
- ❌ No TypeScript — plain `.jsx` and `.js`
- ❌ No Prettier formatting — keep it slightly uneven
- ❌ No obvious AI comment patterns (`// This function handles...`)
- ❌ No `rounded-full` except avatars
- ❌ Do NOT build backend notification controller — it's not there

---

## BUILD ORDER FOR SESSIONS

**Session 1 — Foundation**
Module 0 → 1 → 2 → 3 → 4 (setup + context + routing + layouts)

**Session 2 — Auth + Dashboard**
Module 5 (UI primitives) → Module 6 (auth pages) → Module 7 (dashboard)

**Session 3 — Core Features**
Module 8 (projects) → Module 9 (tasks/kanban)

**Session 4 — Team + Settings**
Module 10 (team) → Module 11 (settings)

**Session 5 — Canvas + Polish**
Module 12 (canvas) → Module 13 (notifications wiring) → Module 14 (error pages) → Module 15 (mobile)

---

## QUICK API REFERENCE

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/auth/login` |
| Me | GET | `/auth/me` |
| Refresh | POST | `/auth/refresh` |
| Logout | POST | `/auth/logout` |
| Setup status | GET | `/auth/setup-status` |
| Register | POST | `/auth/register` |
| Forgot pw | POST | `/auth/forgot-password` |
| Reset pw | POST | `/auth/reset-password/:token` |
| All users | GET | `/users` |
| Invite user | POST | `/users/invite` |
| User by id | GET/PUT | `/users/:id` |
| All projects | GET | `/projects` |
| Create project | POST | `/projects` |
| Project by id | GET | `/projects/:id` |
| Project stats | GET | `/projects/:id/stats` |
| Update project | PUT | `/projects/:id` |
| Add member | POST | `/projects/:id/members` |
| Remove member | DELETE | `/projects/:id/members/:userId` |
| Project tasks | GET | `/tasks/project/:projectId` |
| Create task | POST | `/tasks/project/:projectId` |
| Task by id | GET | `/tasks/:id` |
| Update task | PUT | `/tasks/:id` |
| Task status | PATCH | `/tasks/:id/status` |
| Add comment | POST | `/tasks/:id/comments` |
| Task order | PATCH | `/tasks/:id/order` |
| My tasks | GET | `/tasks/my` |
| Team info | GET | `/team` |
| Team members | GET | `/team/members` |
| Member by id | GET | `/team/members/:id` |
| Change role | PATCH | `/team/members/:id/role` |
| Canvas get | GET | `/canvas/project/:projectId` |
| Canvas save | PUT | `/canvas/project/:projectId` |
| Notifications | GET | `/notifications` |
| Unread count | GET | `/notifications/unread-count` |
| Mark read | PATCH | `/notifications/:id/read` |
| Mark all read | PATCH | `/notifications/read-all` |
| Send email | POST | `/email/send` |
| Email logs | GET | `/email/logs` |

---

*End of guide. Build module by module. Functionality over polish. Code like a smart student, not a framework.*