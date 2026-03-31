import axios from 'axios'
import { getPortalUserId } from '@/utils/userIdentity'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://101.42.236.45:8089/api',
  timeout: 10000
})

// 请求拦截器，自动添加用户 ID
api.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = getPortalUserId()
  return config
})

const unwrap = (res) => res.data?.data ?? res.data

export const getCategories = () =>
  api.get('/projects/categories').then(unwrap)

export const getProjects = (category) =>
  api.get('/projects', { params: { category } }).then(unwrap)

export const saveProject = (project) =>
  api.post('/projects', project).then(unwrap)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then(unwrap)
