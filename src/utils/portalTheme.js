export const portalThemes = [
  { id: 'blue', name: '霁蓝' },
  { id: 'red', name: '朱砂' },
  { id: 'green', name: '竹青' }
]

const STORAGE_KEY = 'portal_color_theme'

export function readPortalTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return portalThemes.some((theme) => theme.id === saved) ? saved : 'blue'
  } catch { return 'blue' }
}

export function applyPortalTheme(value) {
  const theme = portalThemes.some((item) => item.id === value) ? value : 'blue'
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* browser storage may be unavailable */ }
  return theme
}
