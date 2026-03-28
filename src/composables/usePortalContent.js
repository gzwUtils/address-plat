import { computed } from 'vue'
import { dashboardOverview, portalResources } from '@/data/portal'
import { contentKinds } from '@/data/portal-contract'

const buildSearchText = (item) => {
  switch (item.kind) {
    case 'article':
      return [item.title, item.excerpt, item.category, item.tags.join(' ')].join(' ')
    case 'ai':
      return [item.name, item.desc, item.type, item.owner, item.tags.join(' ')].join(' ')
    case 'life':
      return [item.title, item.desc, item.type, item.meta].join(' ')
    default:
      return ''
  }
}

export const usePortalContent = (keywordRef) => {
  const keyword = computed(() => keywordRef?.value?.trim().toLowerCase() || '')

  const includesKeyword = (item) => {
    if (!keyword.value) {
      return true
    }

    return buildSearchText(item).toLowerCase().includes(keyword.value)
  }

  const filteredArticles = computed(() => portalResources.articles.filter(includesKeyword))
  const filteredAiAssets = computed(() => portalResources.aiAssets.filter(includesKeyword))
  const filteredLifeFeeds = computed(() => portalResources.lifeFeeds.filter(includesKeyword))

  const searchSummary = computed(() => [
    {
      key: contentKinds.article,
      label: '文章',
      value: filteredArticles.value.length
    },
    {
      key: contentKinds.ai,
      label: 'AI 资产',
      value: filteredAiAssets.value.length
    },
    {
      key: contentKinds.life,
      label: '生活内容',
      value: filteredLifeFeeds.value.length
    }
  ])

  return {
    dashboardOverview,
    portalResources,
    filteredArticles,
    filteredAiAssets,
    filteredLifeFeeds,
    searchSummary
  }
}
