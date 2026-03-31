export const getResourceOwnerId = (item) =>
  item?.ownerId || item?.creatorId || item?.createdBy || item?.userId || ''

export const getResourceOwnerName = (item) =>
  item?.ownerName || item?.creatorName || item?.createdByName || item?.userName || ''

export const isOwnedByUser = (item, userId) => {
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
