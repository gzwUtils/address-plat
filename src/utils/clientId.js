const CLIENT_ID_KEY = 'portal_client_id'

const buildClientId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `portal-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

export const getClientId = () => {
  try {
    const current = localStorage.getItem(CLIENT_ID_KEY)
    if (current) {
      return current
    }
    const next = buildClientId()
    localStorage.setItem(CLIENT_ID_KEY, next)
    return next
  } catch (error) {
    console.warn('生成匿名客户端标识失败', error)
    return 'portal-anonymous'
  }
}
