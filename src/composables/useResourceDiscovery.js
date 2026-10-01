import { getContentResourcePage } from '@/api/content'
import { getProjects } from '@/api/project'

export const discoveryKinds = ['project', 'article', 'ai', 'life']

const positiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const queryString = (value) => typeof value === 'string' ? value.trim() : ''

const matchesProjectKeyword = (project, keyword) => {
  if (!keyword) return true
  const searchable = [
    project.projectName, project.shortName, project.description,
    project.category, project.type, project.platformUrl
  ].filter(Boolean).join(' ').toLocaleLowerCase()
  return searchable.includes(keyword.toLocaleLowerCase())
}

export const readDiscoveryQuery = (query) => {
  const type = queryString(query.type)
  return {
    keyword: queryString(query.keyword),
    type: discoveryKinds.includes(type) ? type : 'all',
    page: positiveInt(query.page),
    category: queryString(query.category)
  }
}

const normalizePage = (value, page, size) => ({
  records: Array.isArray(value?.records) ? value.records : [],
  total: Number.isFinite(Number(value?.total)) ? Number(value.total) : 0,
  page: positiveInt(value?.page, page),
  size: positiveInt(value?.size, size)
})

export const fetchDiscoveryGroup = async (kind, options = {}) => {
  const keyword = queryString(options.keyword)
  const category = queryString(options.category)
  const page = positiveInt(options.page)
  const size = positiveInt(options.size, 12)

  if (kind === 'project') {
    const projects = await getProjects(category || undefined, keyword || undefined)
    if (!Array.isArray(projects)) {
      throw new Error('项目接口返回格式不正确')
    }
    const filtered = projects.filter((project) => matchesProjectKeyword(project, keyword))
    const start = (page - 1) * size
    return { records: filtered.slice(start, start + size), total: filtered.length, page, size }
  }

  if (!discoveryKinds.includes(kind)) {
    throw new Error(`不支持的资源类型：${kind}`)
  }

  const response = await getContentResourcePage({ type: kind, keyword, page, size })
  if (!response || !Array.isArray(response.records)) {
    throw new Error('内容接口返回格式不正确')
  }
  return normalizePage(response, page, size)
}

export const fetchAllDiscoveryGroups = async (keyword = '') => {
  const results = await Promise.allSettled(
    discoveryKinds.map((kind) => fetchDiscoveryGroup(kind, { keyword, page: 1, size: 4 }))
  )

  return Object.fromEntries(discoveryKinds.map((kind, index) => {
    const result = results[index]
    return [kind, result.status === 'fulfilled'
      ? { data: result.value, error: null }
      : { data: null, error: result.reason }]
  }))
}
