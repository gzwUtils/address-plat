const CONTENT_DRAFT_PREFIX = 'portal_content_draft'

const safeStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

const buildKey = (kind, id = 'new') => `${CONTENT_DRAFT_PREFIX}:${kind || 'resource'}:${id}`

export const loadContentDraft = (kind, id) => {
  const storage = safeStorage()
  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(buildKey(kind, id))
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('读取内容草稿失败', error)
    return null
  }
}

export const saveContentDraft = (kind, id, payload) => {
  const storage = safeStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(
      buildKey(kind, id),
      JSON.stringify({
        ...payload,
        savedAt: new Date().toISOString()
      })
    )
  } catch (error) {
    console.warn('保存内容草稿失败', error)
  }
}

export const clearContentDraft = (kind, id) => {
  const storage = safeStorage()
  if (!storage) {
    return
  }

  storage.removeItem(buildKey(kind, id))
}
