<template>
  <div class="discovery-page">
    <section class="page-intro">
      <div class="intro-copy">
        <span class="eyebrow">RESOURCE LIBRARY</span>
        <h1>资源广场</h1>
        <p>搜索项目、社区讨论、实践文章、AI 能力和团队内容。结果来自门户实时数据。</p>
      </div>
      <form class="search-bar" role="search" @submit.prevent="submitSearch">
        <label class="sr-only" for="discovery-search">搜索门户资源</label>
        <input id="discovery-search" v-model="searchDraft" type="search" placeholder="试试搜索项目名、关键词或负责人" />
        <button type="submit">搜索资源</button>
      </form>
    </section>

    <section class="browse-shell" aria-label="资源浏览">
      <div class="toolbar">
        <div class="type-tabs" role="tablist" aria-label="资源类型">
          <button
            v-for="tab in tabs"
            :key="tab.type"
            type="button"
            role="tab"
            :aria-selected="current.type === tab.type"
            :class="{ active: current.type === tab.type }"
            @click="openType(tab.type)"
          >
            {{ tab.label }}
            <span v-if="tabCount(tab.type) !== null">{{ tabCount(tab.type) }}</span>
          </button>
        </div>
        <div v-if="current.type === 'project'" class="category-control">
          <label for="project-category">项目分类</label>
          <select id="project-category" v-model="categoryDraft" @change="changeCategory">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
      </div>

      <p v-if="current.keyword" class="query-summary">
        正在搜索「{{ current.keyword }}」
        <button type="button" @click="clearSearch">清除关键词</button>
      </p>

      <p v-if="categoryError && current.type === 'project'" class="minor-error">
        分类加载失败。<button type="button" @click="loadCategories">重试</button>
      </p>

      <template v-if="current.type === 'all'">
        <section v-for="kind in discoveryKinds" :key="kind" class="result-section">
          <div class="section-heading">
            <div>
              <span class="section-index">{{ sectionIndex(kind) }}</span>
              <h2>{{ labelFor(kind) }}</h2>
              <span v-if="allGroups[kind]?.data" class="result-count">{{ allGroups[kind].data.total }} 条结果</span>
            </div>
            <button type="button" class="text-action" @click="openType(kind)">查看全部 <span aria-hidden="true">↗</span></button>
          </div>

          <div v-if="allLoading || retrying[kind]" class="card-grid" aria-live="polite">
            <div v-for="index in 4" :key="index" class="card-skeleton" aria-hidden="true" />
            <span class="sr-only">正在加载{{ labelFor(kind) }}</span>
          </div>
          <div v-else-if="allGroups[kind]?.error" class="state-panel" role="alert">
            <p>{{ labelFor(kind) }}暂时无法加载。</p>
            <button type="button" @click="retryGroup(kind)">重试此分类</button>
          </div>
          <div v-else-if="allGroups[kind]?.data?.records.length" class="card-grid">
            <DiscoveryCard v-for="item in allGroups[kind].data.records" :key="`${kind}-${item.id}`" :kind="kind" :item="item" />
          </div>
          <div v-else class="state-panel">{{ current.keyword ? '这个关键词暂无匹配结果。' : '暂无内容。' }}</div>
        </section>
      </template>

      <section v-else class="result-section">
        <div class="section-heading">
          <div>
            <span class="section-index">RESULTS</span>
          <h2>{{ labelFor(current.type) }}</h2>
            <span v-if="selectedData" class="result-count">{{ selectedData.total }} 条结果</span>
          </div>
        </div>

        <div v-if="selectedLoading" class="card-grid" aria-live="polite">
          <div v-for="index in 6" :key="index" class="card-skeleton" aria-hidden="true" />
          <span class="sr-only">正在加载资源</span>
        </div>
        <div v-else-if="selectedError" class="state-panel" role="alert">
          <p>资源暂时无法加载，请检查连接后重试。</p>
          <button type="button" @click="loadDiscovery">重新加载</button>
        </div>
        <div v-else-if="selectedData?.records.length" class="card-grid">
          <DiscoveryCard v-for="item in selectedData.records" :key="`${current.type}-${item.id}`" :kind="current.type" :item="item" />
        </div>
        <div v-else class="state-panel">
          <p>没有找到匹配的{{ labelFor(current.type) }}。</p>
          <button v-if="current.keyword || current.category" type="button" @click="clearFilters">清除筛选</button>
        </div>

        <nav v-if="!selectedLoading && selectedData && totalPages > 1" class="pager" aria-label="结果分页">
          <button type="button" :disabled="current.page <= 1" @click="setPage(current.page - 1)">上一页</button>
          <span>第 {{ current.page }} / {{ totalPages }} 页</span>
          <button type="button" :disabled="current.page >= totalPages" @click="setPage(current.page + 1)">下一页</button>
        </nav>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DiscoveryCard from '@/components/DiscoveryCard.vue'
import { getCategories } from '@/api/project'
import {
  discoveryKinds,
  fetchAllDiscoveryGroups,
  fetchDiscoveryGroup,
  readDiscoveryQuery
} from '@/composables/useResourceDiscovery'

const route = useRoute()
const router = useRouter()
const tabs = [
  { type: 'all', label: '全部' },
  { type: 'project', label: '项目' },
  { type: 'topic', label: '讨论' },
  { type: 'article', label: '文章' },
  { type: 'ai', label: 'AI 资产' },
  { type: 'life', label: '生活内容' }
]
const current = computed(() => readDiscoveryQuery(route.query))
const searchDraft = ref(current.value.keyword)
const categoryDraft = ref(current.value.category)
const categories = ref([])
const categoryError = ref(false)
const allGroups = ref(Object.fromEntries(discoveryKinds.map((kind) => [kind, { data: null, error: null }])))
const allLoading = ref(false)
const retrying = reactive(Object.fromEntries(discoveryKinds.map((kind) => [kind, false])))
const selectedData = ref(null)
const selectedError = ref(null)
const selectedLoading = ref(false)
let requestId = 0

const totalPages = computed(() => selectedData.value
  ? Math.max(1, Math.ceil(selectedData.value.total / selectedData.value.size))
  : 1)

const labelFor = (kind) => tabs.find((tab) => tab.type === kind)?.label || '资源'
const sectionIndex = (kind) => String(discoveryKinds.indexOf(kind) + 1).padStart(2, '0')
const tabCount = (type) => {
  if (type === 'all') return null
  if (current.value.type === 'all') return allGroups.value[type]?.data?.total ?? null
  return current.value.type === type ? selectedData.value?.total ?? null : null
}

const navigate = (updates) => {
  const next = { ...current.value, ...updates }
  router.push({
    path: '/explore',
    query: {
      keyword: next.keyword || undefined,
      type: next.type === 'all' ? undefined : next.type,
      page: next.page > 1 ? String(next.page) : undefined,
      category: next.type === 'project' && next.category ? next.category : undefined
    }
  })
}

const submitSearch = () => navigate({ keyword: searchDraft.value.trim(), type: 'all', category: '', page: 1 })
const clearSearch = () => navigate({ keyword: '', page: 1 })
const clearFilters = () => navigate({ keyword: '', category: '', page: 1 })
const openType = (type) => navigate({ type, category: type === 'project' ? current.value.category : '', page: 1 })
const changeCategory = () => navigate({ category: categoryDraft.value, page: 1 })
const setPage = (page) => navigate({ page })

async function loadCategories() {
  categoryError.value = false
  try {
    const result = await getCategories()
    categories.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.warn('加载项目分类失败', error)
    categoryError.value = true
  }
}

async function loadDiscovery() {
  const id = ++requestId
  const query = current.value
  if (query.type === 'all') {
    allLoading.value = true
    const groups = await fetchAllDiscoveryGroups(query.keyword)
    if (id === requestId) {
      allGroups.value = groups
      allLoading.value = false
    }
    return
  }

  selectedLoading.value = true
  selectedError.value = null
  selectedData.value = null
  try {
    const result = await fetchDiscoveryGroup(query.type, query)
    if (id === requestId) {
      const lastPage = Math.max(1, Math.ceil(result.total / result.size))
      if (query.page > lastPage) {
        navigate({ page: lastPage })
        return
      }
      selectedData.value = result
    }
  } catch (error) {
    if (id === requestId) selectedError.value = error
  } finally {
    if (id === requestId) selectedLoading.value = false
  }
}

async function retryGroup(kind) {
  retrying[kind] = true
  try {
    const data = await fetchDiscoveryGroup(kind, { keyword: current.value.keyword, size: 4 })
    allGroups.value = { ...allGroups.value, [kind]: { data, error: null } }
  } catch (error) {
    allGroups.value = { ...allGroups.value, [kind]: { data: null, error } }
  } finally {
    retrying[kind] = false
  }
}

watch(current, (value) => {
  searchDraft.value = value.keyword
  categoryDraft.value = value.category
  if (value.type === 'project' && !categories.value.length) loadCategories()
  loadDiscovery()
}, { immediate: true })
</script>

<style scoped>
.discovery-page { max-width: 1440px; margin: 0 auto; display: grid; gap: 24px; }
.page-intro, .browse-shell { border: 1px solid var(--portal-line); border-radius: 28px; background: var(--portal-surface); box-shadow: var(--portal-shadow); }
.page-intro { padding: clamp(27px, 3.5vw, 45px); display: grid; gap: 20px; background: linear-gradient(125deg, var(--portal-glow), transparent 65%), var(--portal-surface); }
.eyebrow, .section-index { color: var(--portal-accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; }
h1 { max-width: 800px; margin: 10px 0; font-size: clamp(36px, 4vw, 52px); line-height: 1.15; letter-spacing: -.035em; }
.intro-copy p { color: var(--portal-text-soft); font-size: 16px; line-height: 1.7; margin: 0; }
.search-bar { display: flex; max-width: 860px; padding: 6px; border: 1px solid var(--portal-line); border-radius: 16px; background: var(--portal-surface); box-shadow: 0 8px 22px rgba(38, 52, 66, .05); }
.search-bar input { min-width: 0; flex: 1; padding: 14px 17px; border: 0; outline: 0; background: transparent; color: var(--portal-text); font: inherit; }
.search-bar input::placeholder { color: var(--portal-text-soft); }
.search-bar:focus-within { border-color: var(--portal-accent); box-shadow: 0 0 0 3px var(--portal-glow); }
.search-bar button, .state-panel button { border: 0; border-radius: 11px; background: var(--portal-accent); color: var(--portal-accent-ink); padding: 12px 22px; font: inherit; font-weight: 700; cursor: pointer; }
.browse-shell { padding: clamp(18px, 3vw, 34px); }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-bottom: 1px solid var(--portal-line); padding-bottom: 18px; }
.type-tabs { display: flex; gap: 8px; overflow-x: auto; }
.type-tabs button { flex-shrink: 0; border: 1px solid transparent; border-radius: 10px; padding: 10px 14px; color: var(--portal-text-soft); background: transparent; font: inherit; cursor: pointer; }
.type-tabs button.active { color: var(--portal-accent); border-color: var(--portal-accent); background: var(--portal-bg-soft); }
.type-tabs span { margin-left: 7px; font-size: 12px; }
.category-control { display: flex; align-items: center; gap: 9px; white-space: nowrap; color: var(--portal-text-soft); font-size: 13px; }
.category-control select { max-width: 180px; border: 1px solid var(--portal-line); border-radius: 9px; background: var(--portal-bg-soft); color: var(--portal-text); padding: 10px; font: inherit; }
.query-summary { color: var(--portal-text-soft); }
.query-summary button, .minor-error button { border: 0; background: transparent; color: var(--portal-accent); font: inherit; cursor: pointer; text-decoration: underline; }
.minor-error { color: var(--portal-accent); }
.result-section { padding-top: 28px; }
.result-section + .result-section { margin-top: 28px; border-top: 1px solid var(--portal-line); }
.section-heading, .section-heading > div { display: flex; align-items: baseline; gap: 12px; }
.section-heading { justify-content: space-between; margin-bottom: 19px; }
.section-heading h2 { margin: 0; font-size: 24px; }
.result-count { color: var(--portal-text-soft); font-size: 13px; }
.text-action { background: transparent; border: 0; color: var(--portal-accent); font: inherit; cursor: pointer; white-space: nowrap; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.card-skeleton { min-height: 230px; border: 1px solid var(--portal-line); border-radius: 20px; background: linear-gradient(100deg, #f6f4ef 25%, #fffefa 50%, #f6f4ef 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.state-panel { display: grid; justify-items: start; gap: 12px; padding: 28px; border: 1px dashed var(--portal-line); border-radius: 17px; color: var(--portal-text-soft); }
.state-panel p { margin: 0; }
.pager { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 28px; color: var(--portal-text-soft); }
.pager button { border: 1px solid var(--portal-line); border-radius: 9px; padding: 9px 14px; background: var(--portal-bg-soft); color: var(--portal-text); font: inherit; cursor: pointer; }
.pager button:disabled { opacity: .4; cursor: not-allowed; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (max-width: 720px) { .toolbar { align-items: stretch; flex-direction: column; } .type-tabs { width: 100%; } .section-heading > div { flex-wrap: wrap; } .search-bar { flex-direction: column; } .search-bar button { width: 100%; } .section-heading h2 { font-size: 21px; } }
@media (prefers-reduced-motion: reduce) { .card-skeleton { animation: none; } }
</style>
