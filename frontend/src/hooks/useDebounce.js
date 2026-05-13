import { useState, useEffect } from 'react'
export const useDebounce = (val, delay = 400) => {
    const [debounced, setDebounced] = useState(val)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(val), delay)
        return () => clearTimeout(t)
    }, [val, delay])
    return debounced
}
