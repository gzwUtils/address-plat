import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://101.42.236.45:8089/api',
  timeout: 10000
})

export const getCategories = () =>
  api.get('/projects/categories').then((res) => res.data)

export const getProjects = (category) =>
  api.get('/projects', { params: { category } }).then((res) => res.data)

export const saveProject = (project) =>
  api.post('/projects', project).then((res) => res.data)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then((res) => res.data)
