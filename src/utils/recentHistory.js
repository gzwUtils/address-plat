const RECENT_HISTORY_KEY = 'portal_recent_history'
const MAX_HISTORY_SIZE = 8

export const getRecentHistory = () => {
  try {
    const raw = localStorage.getItem(RECENT_HISTORY_KEY)
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('读取最近浏览记录失败', error)
    return []
  }
}

export const pushRecentHistory = (item) => {
  try {
    const current = getRecentHistory()
    const filtered = current.filter((entry) => !(entry.kind === item.kind && String(entry.id) === String(item.id)))
    const next = [item, ...filtered].slice(0, MAX_HISTORY_SIZE)
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(next))
    return next
  } catch (error) {
    console.warn('写入最近浏览记录失败', error)
    return getRecentHistory()
  }
}
