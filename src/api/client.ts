import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function refreshSession(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken }, { headers: { 'Content-Type': 'application/json' } })
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return true
  } catch {
    return false
  }
}

export function clearExpiredSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  if (window.location.pathname !== '/login') window.location.assign('/login?expired=1')
}

client.interceptors.request.use((config) => {
  // Let the browser/Axios generate the multipart boundary for file uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type']
  }
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (typeof error.config & { _authRetry?: boolean }) | undefined
    if (error.response?.status === 401 && request && !request._authRetry && !String(request.url || '').includes('/auth/refresh')) {
      request._authRetry = true
      if (await refreshSession()) {
        request.headers = request.headers || {}
        request.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return client(request)
      }
      clearExpiredSession()
    }
    return Promise.reject(error)
  },
)

export default client
