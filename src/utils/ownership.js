export const getResourceOwnerId = (item) =>
  item?.ownerId || item?.creatorId || item?.createdBy || item?.userId || ''

export const getResourceOwnerName = (item) =>
  item?.ownerName || item?.creatorName || item?.createdByName || item?.userName || ''

const ADMIN_TOKEN_KEY = 'portal_admin_token'
const ADMIN_SECRET = 'gzw-admin-2026'

export const isAdmin = () => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) === ADMIN_SECRET
  } catch {
    return false
  }
}

export const isOwnedByUser = (item, userId) => {
  if (isAdmin()) return true
  const ownerId = getResourceOwnerId(item)
  if (!ownerId || !userId) {
    return false
  }
  return String(ownerId) === String(userId)
}

export const withOwnership = (item, userProfile) => ({
  ...item,
  ownerId: item?.ownerId || userProfile.userId,
  ownerName: item?.ownerName || userProfile.userName
})
