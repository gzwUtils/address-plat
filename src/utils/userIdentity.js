const USER_ID_KEY = 'portal_growth_user_id'
const USER_NAME_KEY = 'portal_growth_user_name'
const USER_IP_KEY = 'portal_growth_user_ip'

const buildUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `u-${crypto.randomUUID()}`
  }
  return `u-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

const buildUserName = (userId) => `用户${String(userId).slice(-6).toUpperCase()}`

const getSimpleFingerprint = () => {
  try {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|')
    return fingerprint.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0).toString(16)
  } catch {
    return Math.random().toString(16).slice(2, 8)
  }
}

export const getPortalUserId = () => {
  try {
    const cached = localStorage.getItem(USER_ID_KEY)
    if (cached) {
      return cached
    }
    const fingerprint = getSimpleFingerprint()
    const next = `user-${fingerprint}-${Date.now().toString(36)}`
    localStorage.setItem(USER_ID_KEY, next)
    return next
  } catch (error) {
    console.warn('读取门户用户标识失败', error)
    return 'user-visitor'
  }
}

export const getPortalUserName = () => {
  try {
    const cached = localStorage.getItem(USER_NAME_KEY)
    if (cached) {
      return cached
    }
    const userId = getPortalUserId()
    const shortId = userId.slice(-8).toUpperCase()
    const next = `用户${shortId}`
    localStorage.setItem(USER_NAME_KEY, next)
    return next
  } catch (error) {
    console.warn('读取门户用户名失败', error)
    return '游客用户'
  }
}

export const getPortalUserProfile = () => ({
  userId: getPortalUserId(),
  userName: getPortalUserName()
})

export const getUserDisplayInfo = () => {
  const profile = getPortalUserProfile()
  return {
    id: profile.userId,
    name: profile.userName,
    shortId: profile.userId.slice(-6).toUpperCase()
  }
}
