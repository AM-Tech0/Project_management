import { useEffect, useState } from 'react'
import api from '../../utils/axios'
import { fmtDate } from '../../utils/formatters'

export default function TasksPage() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const res = await api.get('/tasks/my')
                setTasks(res.data.data || [])
            } catch (err) {
                console.log('err fetch my tasks', err)
            }
            setLoading(false)
        }
        fetch()
    }, [])

    if (loading) return <div className="p-6"><div className="animate-pulse bg-slate-200 h-6 w-48 mb-4" /><div className="space-y-3"><div className="h-12 bg-white border border-slate-200 rounded-md" /></div></div>

    if (!loading && tasks.length === 0) return <div className="p-6 text-slate-500">No tasks assigned to you</div>

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
            <div className="space-y-3">
                {tasks.map(t => (
                    <div key={t._id} className="bg-white border border-slate-200 rounded-md p-4">
                        <div className="flex items-start justify-between">
                            <p className="text-[15px] font-medium text-slate-900">{t.title}</p>
                            <span className="text-[13px] text-slate-400">{t.status}</span>
                        </div>
                        <p className="text-[13px] text-slate-500 mt-2">{t.description}</p>
                        <div className="flex items-center justify-between mt-3">
                            <div className="text-[13px] text-slate-500">{t.assignedTo?.map(a => a.name).join(', ')}</div>
                            <div className="text-[13px] text-slate-400">{t.dueDate ? fmtDate(t.dueDate) : 'No due'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
