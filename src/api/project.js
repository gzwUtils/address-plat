import { api } from './client'

const unwrap = (res) => res.data?.data ?? res.data

export const getCategories = () =>
  api.get('/projects/categories').then(unwrap)

export const getProjects = (category, keyword) =>
  api.get('/projects', { params: { category, keyword } }).then(unwrap)

export const getOpenSourceProjects = () =>
  api.get('/open-source/featured').then(unwrap)

export const saveProject = (project) =>
  api.post('/projects', project).then(unwrap)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then(unwrap)

export const listExternalSources = () => api.get('/admin/external-sources').then(unwrap)
export const saveExternalSource = (source) => api.post('/admin/external-sources', source).then(unwrap)
export const runExternalSource = (id) => api.post(`/admin/external-sources/${id}/run`, null, { timeout: 15000 }).then(unwrap)
