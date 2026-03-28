const USER_ID_KEY = 'portal_growth_user_id'

const buildUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `u-${crypto.randomUUID()}`
  }
  return `u-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

export const getPortalUserId = () => {
  try {
    const cached = localStorage.getItem(USER_ID_KEY)
    if (cached) {
      return cached
    }
    const next = buildUserId()
    localStorage.setItem(USER_ID_KEY, next)
    return next
  } catch (error) {
    console.warn('读取门户用户标识失败', error)
    return 'u-visitor'
  }
}
