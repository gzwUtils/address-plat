import { api } from './client'

const unwrap = (res) => res.data?.data ?? res.data

export const getCategories = () =>
  api.get('/projects/categories').then(unwrap)

export const getProjects = (category, keyword) =>
  api.get('/projects', { params: { category, keyword } }).then(unwrap)

export const getOpenSourceProjects = () =>
  api.get('/open-source/featured').then(unwrap)

export const getPublishedProjectReadingGuides = () =>
  api.get('/open-source/reading-guides').then(unwrap)

export const getOpenSourceProject = (id) =>
  api.get(`/open-source/${id}`).then(unwrap)

export const getProjectReadingGuide = (id) =>
  api.get(`/open-source/${id}/reading-guide`).then(unwrap)

export const updateProjectHighlight = (id, payload) =>
  api.post(`/admin/external-projects/${id}/highlight`, payload).then(unwrap)

export const queueProjectReadingGuide = (id) =>
  api.post(`/admin/open-source/${id}/reading-guide`).then(unwrap)

export const getAdminProjectReadingGuide = (id) =>
  api.get(`/admin/open-source/${id}/reading-guide`).then(unwrap)

export const listProjectReadingCandidates = () =>
  api.get('/admin/open-source/reading-guides').then(unwrap)

export const listProjectReadingEngines = () =>
  api.get('/admin/project-reading/engines').then(unwrap)

export const saveProjectReadingEngine = (profile) =>
  api.post('/admin/project-reading/engines', profile).then(unwrap)

export const testProjectReadingEngine = (id) =>
  api.post(`/admin/project-reading/engines/${id}/test`).then(unwrap)

export const saveProject = (project) =>
  api.post('/projects', project).then(unwrap)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then(unwrap)

export const listExternalSources = () => api.get('/admin/external-sources').then(unwrap)
export const saveExternalSource = (source) => api.post('/admin/external-sources', source).then(unwrap)
export const runExternalSource = (id) => api.post(`/admin/external-sources/${id}/run`, null, { timeout: 15000 }).then(unwrap)
