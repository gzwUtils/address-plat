import axios from 'axios'
import { dashboardOverview, portalResources } from '@/data/portal'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8089/api',
  timeout: 10000
})

const normalizeList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.records)) {
    return payload.records
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

const buildTags = (items, field) => {
  const counter = new Map()

  items.forEach((item) => {
    const values = Array.isArray(item[field]) ? item[field] : [item[field]].filter(Boolean)
    values.forEach((value) => {
      counter.set(value, (counter.get(value) || 0) + 1)
    })
  })

  return [...counter.entries()].map(([name, count]) => ({ name, count }))
}

const withFallback = async (request, fallback) => {
  try {
    return await request()
  } catch (error) {
    console.warn('内容接口不可用，切换为本地数据兜底', error)
    return fallback()
  }
}

export const getPortalOverview = () =>
  withFallback(
    () => api.get('/portal/overview').then((res) => res.data?.data || res.data),
    () => Promise.resolve(dashboardOverview)
  )

export const getOpsWorkbench = () =>
  api.get('/portal/ops-workbench').then((res) => res.data?.data || res.data)

export const getContentResources = (params = {}) =>
  withFallback(
    () =>
      api.get('/content/resources', { params }).then((res) => normalizeList(res.data?.data || res.data)),
    () => {
      const all = [
        ...portalResources.articles,
        ...portalResources.aiAssets,
        ...portalResources.lifeFeeds
      ]
      const keyword = (params.keyword || '').toLowerCase()
      const type = params.type || ''

      return Promise.resolve(
        all.filter((item) => {
          const typeMatch = !type || item.kind === type
          const raw = Object.values(item).flat().join(' ').toLowerCase()
          const keywordMatch = !keyword || raw.includes(keyword)
          return typeMatch && keywordMatch
        })
      )
    }
  )

export const getContentResourcesWithFallback = async (params = {}) => {
  try {
    const data = await api.get('/content/resources', { params }).then((res) => normalizeList(res.data?.data || res.data))
    return { data, fallback: false }
  } catch (error) {
    console.warn('统一资源接口不可用，切换为本地数据兜底', error)
    return {
      data: [
        ...portalResources.articles,
        ...portalResources.aiAssets,
        ...portalResources.lifeFeeds
      ],
      fallback: true
    }
  }
}

export const getContentTags = () =>
  withFallback(
    () => api.get('/content/tags').then((res) => normalizeList(res.data?.data || res.data)),
    () => {
      const tags = [
        ...buildTags(portalResources.articles, 'category'),
        ...buildTags(portalResources.aiAssets, 'type'),
        ...buildTags(portalResources.lifeFeeds, 'type')
      ]
      return Promise.resolve(tags)
    }
  )

export const getAiAssets = (params = {}) =>
  withFallback(
    () => api.get('/ai-assets', { params }).then((res) => normalizeList(res.data?.data || res.data)),
    () => Promise.resolve(portalResources.aiAssets)
  )

export const getAiAssetsWithFallback = async (params = {}) => {
  try {
    const data = await api.get('/ai-assets', { params }).then((res) => normalizeList(res.data?.data || res.data))
    return { data, fallback: false }
  } catch (error) {
    console.warn('AI 资产接口不可用，切换为本地数据兜底', error)
    return { data: portalResources.aiAssets, fallback: true }
  }
}

export const saveAiAsset = (asset) =>
  api.post('/ai-assets', asset).then((res) => res.data?.data || res.data)

export const deleteAiAsset = (id) =>
  api.delete(`/ai-assets/${id}`).then((res) => res.data?.data || res.data)

export const saveContentResource = (resource) =>
  api.post('/content/resources', resource).then((res) => res.data?.data || res.data)

export const deleteContentResource = (id) =>
  api.delete(`/content/resources/${id}`).then((res) => res.data?.data || res.data)

export const getRecentViews = (clientId) =>
  api.get('/portal/recent-views', { params: { clientId } }).then((res) => normalizeList(res.data?.data || res.data))

export const saveRecentView = (payload) =>
  api.post('/portal/recent-views', payload).then((res) => res.data?.data || res.data)

export const getGrowthCapsuleOverview = (userId) =>
  api.get('/growth-capsule', { params: { userId } }).then((res) => res.data?.data || res.data)

export const addGrowthCapsuleItem = (payload) =>
  api.post('/growth-capsule/items', payload).then((res) => res.data?.data || res.data)

export const updateGrowthCapsuleItemStatus = (itemId, status, note = '') =>
  api.post(`/growth-capsule/items/${itemId}/status`, null, { params: { status, note } }).then((res) => res.data?.data || res.data)

export const addGrowthCapsuleCheckin = (itemId, payload) =>
  api.post(`/growth-capsule/items/${itemId}/checkins`, payload).then((res) => res.data?.data || res.data)

export const portalApiContract = {
  overview: {
    method: 'GET',
    path: '/portal/overview',
    description: '门户总览数据，返回仪表盘指标、焦点卡片和 AI 能力建议'
  },
  resources: {
    method: 'GET',
    path: '/content/resources',
    description: '统一内容资源列表，支持 keyword、type、tag、page、size 查询参数'
  },
  tags: {
    method: 'GET',
    path: '/content/tags',
    description: '统一标签统计，支持门户全局筛选和推荐'
  },
  aiAssets: {
    method: 'GET',
    path: '/ai-assets',
    description: 'AI 资产列表，支持按 type、owner、status 查询'
  },
  recentViews: {
    method: 'GET/POST',
    path: '/portal/recent-views',
    description: '匿名客户端最近浏览记录，支持详情页浏览回流和跨内容类型串联'
  },
  growthCapsule: {
    method: 'GET/POST',
    path: '/growth-capsule',
    description: '个人灵感落地舱，将浏览内容转为行动卡、状态和打卡记录'
  }
}
