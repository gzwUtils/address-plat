import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
})

let csrfToken = ''
let csrfRequest = null

const ensureCsrf = async () => {
  if (csrfToken) return csrfToken
  if (!csrfRequest) {
    csrfRequest = axios.get('/api/csrf', { withCredentials: true })
      .then((response) => response.data?.data?.token || '')
      .finally(() => { csrfRequest = null })
  }
  csrfToken = await csrfRequest
  return csrfToken
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if (!['get', 'head', 'options'].includes(method)) {
    config.headers['X-CSRF-TOKEN'] = await ensureCsrf()
  }
  return config
})

api.interceptors.response.use(undefined, async (error) => {
  const path = error.config?.url || ''
  const method = (error.config?.method || 'get').toLowerCase()
  const adminWrite = !['get', 'head', 'options'].includes(method) &&
    (path.startsWith('/content/resources') || path.startsWith('/ai-assets') ||
      (path.startsWith('/admin/') && path !== '/admin/session'))
  if (error.response?.status === 401 && adminWrite) {
    const { default: router } = await import('@/router')
    if (router.currentRoute.value.path !== '/admin/sign-in') {
      router.push({ path: '/admin/sign-in', query: { next: router.currentRoute.value.fullPath } })
    }
  }
  if (error.response?.status === 403 && error.response?.data?.code !== 403 && !error.config?._csrfRetried) {
    csrfToken = ''
    const config = { ...error.config, _csrfRetried: true }
    return api.request(config)
  }
  return Promise.reject(error)
})
