import { api } from './client'

const unwrap = (response) => response.data?.data ?? response.data

export const listBoards = () => api.get('/community/boards').then(unwrap)
export const listTopics = (params = {}) => api.get('/community/topics', { params }).then(unwrap)
export const getTopic = (id) => api.get(`/community/topics/${id}`).then(unwrap)
export const createTopic = (payload) => api.post('/community/topics', payload).then(unwrap)
export const updateTopic = (id, payload) => api.patch(`/community/topics/${id}`, payload).then(unwrap)
export const deleteTopic = (id) => api.delete(`/community/topics/${id}`).then(unwrap)
export const listReplies = (id, page = 1, size = 20) =>
  api.get(`/community/topics/${id}/replies`, { params: { page, size } }).then(unwrap)
export const countNewReplies = (id, afterId) =>
  api.get(`/community/topics/${id}/replies/new-count`, { params: { afterId } }).then(unwrap)
export const createReply = (id, payload) => api.post(`/community/topics/${id}/replies`, payload).then(unwrap)
export const updateReply = (id, body) => api.patch(`/community/replies/${id}`, { body }).then(unwrap)
export const deleteReply = (id) => api.delete(`/community/replies/${id}`).then(unwrap)
export const getMyDiscussions = (page = 1) => api.get('/me/discussions', { params: { page, size: 20 } }).then(unwrap)
export const reportContent = (targetType, targetId, reason) =>
  api.post('/community/reports', { targetType, targetId, reason }).then(unwrap)
export const adminSignIn = (password) => api.post('/admin/session', { password }).then(unwrap)
export const adminMe = () => api.get('/admin/me').then(unwrap)
export const listOpenReports = (page = 1) =>
  api.get('/admin/community/reports', { params: { page, size: 20 } }).then(unwrap)
export const resolveReport = (id, hideTarget) =>
  api.patch(`/admin/community/reports/${id}`, { hideTarget }).then(unwrap)
export const assignLegacyProjectOwner = (id, publicId) =>
  api.patch(`/admin/projects/${id}/owner`, { publicId }).then(unwrap)
