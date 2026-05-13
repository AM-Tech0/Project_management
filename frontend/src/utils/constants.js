export const TASK_STATUS = ['todo', 'in_progress', 'in_review', 'done', 'blocked']

export const STATUS_LABEL = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
    blocked: 'Blocked'
}

export const STATUS_COLOR = {
    todo: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    in_review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-700'
}

export const PRIORITY_COLOR = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-700'
}

export const ROLES = ['admin', 'manager', 'member']

export const PROJECT_STATUS_COLOR = {
    planning: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-slate-100 text-slate-600'
}
