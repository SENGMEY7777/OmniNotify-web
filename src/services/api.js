import { getCookie } from '@/utils/cookies'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
    const token = getCookie('token') || localStorage.getItem('token')
    const headers = new Headers(options.headers || {})
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload.success === false) {
        if (response.status === 401 || response.status === 403) window.dispatchEvent(new CustomEvent('auth-expired'))
        const error = new Error(payload.message || `Request failed (${response.status})`)
        error.status = response.status

        const retryAfter = Number(response.headers.get('Retry-After'))
        if (Number.isFinite(retryAfter) && retryAfter > 0) error.retryAfter = retryAfter

        throw error
    }
    return payload.data ?? payload
}

export const get = (path) => apiRequest(path)
const serializeBody = (body) => body instanceof FormData ? body : JSON.stringify(body)

export const post = (path, body) => apiRequest(path, { method: 'POST', body: serializeBody(body) })
export const put = (path, body) => apiRequest(path, { method: 'PUT', body: serializeBody(body) })
export const patch = (path, body) => apiRequest(path, { method: 'PATCH', body: serializeBody(body) })
export const del = (path) => apiRequest(path, { method: 'DELETE' })
