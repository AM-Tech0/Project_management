import axios from 'axios'
import { getToken, setToken, clearToken } from './auth'

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

const normalizeExpiresIn = (val, fallback) => {
    if (val === undefined || val === null) return fallback
    let v = String(val).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim()
    if (/^\d+$/.test(v)) return Number(v)
    if (/^\d+(ms|s|m|h|d)$/.test(v)) return v
    if (/^\d+s$/.test(v)) return Number(v.slice(0, -1))
    return fallback
}

let refreshing = false
let queue = []

const processQueue = (err, token = null) => {
    queue.forEach(p => {
        if (err) p.reject(err)
        else p.resolve(token)
    })
    queue = []
}

api.interceptors.response.use(
    (res) => {
        try {
            if (res?.data?.data?.expiresIn !== undefined) {
                res.data.data.expiresIn = normalizeExpiresIn(res.data.data.expiresIn, res.data.data.expiresIn)
            }
        } catch (e) {/* ignore */ }
        return res
    },
    async (err) => {
        const original = err.config
        if (err.response?.status === 401 && !original?._retry) {
            if (refreshing) {
                return new Promise((resolve, reject) => {
                    queue.push({ resolve, reject })
                }).then(token => {
                    original.headers['Authorization'] = `Bearer ${token}`
                    return api(original)
                })
            }
            original._retry = true
            refreshing = true
            try {
                const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
                const newToken = res.data.data?.accessToken
                setToken(newToken)
                processQueue(null, newToken)
                original.headers['Authorization'] = `Bearer ${newToken}`
                return api(original)
            } catch (e) {
                console.log('refresh failed', e)
                processQueue(e, null)
                clearToken()
                window.location.href = '/login'
                return Promise.reject(e)
            } finally {
                refreshing = false
            }
        }
        return Promise.reject(err)
    }
)

export default api
