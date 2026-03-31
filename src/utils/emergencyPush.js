const NOTICE_KEY = 'portal_emergency_notice'
const ACK_KEY = 'portal_emergency_notice_ack'

export const getEmergencyNotice = () => {
  try {
    const raw = localStorage.getItem(NOTICE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('读取紧急推送失败', error)
    return null
  }
}

export const saveEmergencyNotice = (notice) => {
  try {
    localStorage.setItem(NOTICE_KEY, JSON.stringify(notice))
    return notice
  } catch (error) {
    console.warn('保存紧急推送失败', error)
    return null
  }
}

export const clearEmergencyNotice = () => {
  try {
    localStorage.removeItem(NOTICE_KEY)
  } catch (error) {
    console.warn('清理紧急推送失败', error)
  }
}

const readAckMap = () => {
  try {
    return JSON.parse(localStorage.getItem(ACK_KEY) || '{}')
  } catch (error) {
    console.warn('读取紧急推送确认记录失败', error)
    return {}
  }
}

export const hasEmergencyNoticeAck = (noticeId, userId) => {
  if (!noticeId || !userId) {
    return false
  }
  const ackMap = readAckMap()
  return Boolean(ackMap[`${noticeId}:${userId}`])
}

export const ackEmergencyNotice = (noticeId, userId) => {
  if (!noticeId || !userId) {
    return
  }
  try {
    const ackMap = readAckMap()
    ackMap[`${noticeId}:${userId}`] = new Date().toISOString()
    localStorage.setItem(ACK_KEY, JSON.stringify(ackMap))
  } catch (error) {
    console.warn('保存紧急推送确认记录失败', error)
  }
}
