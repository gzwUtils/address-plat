import { api } from './client'

const unwrap = (response) => response.data?.data ?? response.data

export const getMe = () => api.get('/me').then(unwrap)
export const createAccount = () => api.post('/guest-sessions').then(unwrap)
export const restoreAccount = (publicId, recoveryCode) =>
  api.post('/guest-sessions/restore', { publicId, recoveryCode }).then(unwrap)
export const updateNickname = (nickname) => api.patch('/me', { nickname }).then(unwrap)
export const rotateRecoveryCode = () => api.post('/me/recovery-code/rotate').then(unwrap)
