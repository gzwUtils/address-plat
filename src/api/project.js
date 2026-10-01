import { api } from './client'

const unwrap = (res) => res.data?.data ?? res.data

export const getCategories = () =>
  api.get('/projects/categories').then(unwrap)

export const getProjects = (category, keyword) =>
  api.get('/projects', { params: { category, keyword } }).then(unwrap)

export const saveProject = (project) =>
  api.post('/projects', project).then(unwrap)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then(unwrap)
