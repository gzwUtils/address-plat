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
  if (error.response?.status === 403 && error.response?.data?.code !== 403 && !error.config?._csrfRetried) {
    csrfToken = ''
    const config = { ...error.config, _csrfRetried: true }
    return api.request(config)
  }
  return Promise.reject(error)
})
