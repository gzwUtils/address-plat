export const portalThemes = [
  { id: 'red', name: '月白朱砂' },
  { id: 'blue', name: '月白霁蓝' },
  { id: 'green', name: '月白竹青' }
]

const STORAGE_KEY = 'portal_color_theme_v2'

export function readPortalTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return portalThemes.some((theme) => theme.id === saved) ? saved : 'red'
  } catch { return 'red' }
}

export function applyPortalTheme(value) {
  const theme = portalThemes.some((item) => item.id === value) ? value : 'red'
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* browser storage may be unavailable */ }
  return theme
}
