import {useEffect,useRef,useState} from 'react'
import * as fabric from 'fabric'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import {useSocket} from '../../hooks/useSocket'
import CanvasToolbar from './CanvasToolbar'
import CanvasCollaborators from './CanvasCollaborators'

export default function CanvasBoard({projectId, userRole, userName}){
  const canvasRef=useRef(null)
  const containerRef=useRef(null)
  const [canvas,setCanvas]=useState(null)
  const [activeTool,setActiveTool]=useState('select')
  const saveTimer=useRef(null)
  const [collaborators,setCollaborators]=useState([])
  
  const {socket} = useSocket()

  useEffect(()=>{
    if(!containerRef.current || !canvasRef.current) return
    
    // Using classic fabric initialization instead of newer v6 due to common setup issues.
    // If fabric requires canvas element instead of id:
    const c=new fabric.Canvas(canvasRef.current,{
      backgroundColor:'#FAFAFA',
      width:containerRef.current.clientWidth - 52, // minus toolbar
      height:containerRef.current.clientHeight
    })
    setCanvas(c)

    // load from API
    api.get(`/canvas/project/${projectId}`).then(res=>{
      const data=res.data.data?.data
      if(data) c.loadFromJSON(data,()=>c.renderAll())
    }).catch(e=>console.log("canvas load err",e))

    return ()=>{
      c.dispose()
    }
  },[projectId])

  // auto-save
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
      if(socket) socket.emit('canvas_update',{projectId, fullData:json})
    } catch(err){
      console.log("canvas save err",err)
      if(err.response?.status===409){
        toast.error('Canvas was updated by someone else. Reload?')
      }
    }
  }

  // Socket
  useEffect(()=>{
    if(!socket || !projectId) return
    
    socket.emit('join_project',{projectId, userName})
    
    const onCanvasUpdated = (data)=>{
      if(data.fullData && canvas){
        canvas.loadFromJSON(data.fullData,()=>canvas.renderAll())
      }
    }
    
    const onUserJoined = (users)=>{
      setCollaborators(users||[])
    }
    
    socket.on('canvas_updated', onCanvasUpdated)
    socket.on('project_users', onUserJoined)
    
    return ()=>{
      socket.off('canvas_updated', onCanvasUpdated)
      socket.off('project_users', onUserJoined)
    }
  },[socket, projectId, canvas, userName])

  // tool handlers
  const addStickyNote=(color='#FEF9C3')=>{
    if(!canvas) return
    const rect=new fabric.Rect({width:160,height:120,fill:color,rx:4,ry:4,left:100,top:100})
    const text=new fabric.IText('Note...',{fontSize:14,left:110,top:115,fill:'#374151',width:140})
    
    const group = new fabric.Group([rect,text], {
      left: 100,
      top: 100
    })
    
    canvas.add(group)
    canvas.setActiveObject(group)
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

  const clearCanvas=()=>{
    if(!canvas) return
    if(window.confirm('Clear the entire canvas?')){
      canvas.clear()
      canvas.backgroundColor='#FAFAFA'
      canvas.renderAll()
      saveCanvas(canvas)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] border border-slate-200 rounded-lg overflow-hidden relative" ref={containerRef}>
      <CanvasToolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        onAddText={addText} 
        onAddSticky={addStickyNote} 
        onAddRect={addRect} 
        onDraw={enableDraw} 
        onClear={clearCanvas} 
        userRole={userRole} 
      />
      <div className="flex-1 bg-[#FAFAFA] relative">
        <CanvasCollaborators users={collaborators} />
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
