<template>
  <div class="board-page">
    <nav class="breadcrumbs"><router-link to="/community">社区</router-link><span>/</span><strong>{{ boardName }}</strong></nav>
    <header class="board-header">
      <div><h1>{{ boardName }}</h1><p>{{ boardDescription }}</p></div>
      <el-button type="primary" @click="composerOpen = true">发布主题</el-button>
    </header>
    <div class="board-layout">
      <section class="board-feed" aria-label="板块主题">
        <div class="feed-toolbar">
          <form class="filters" role="search" @submit.prevent="applySearch">
            <el-input v-model="draftKeyword" placeholder="搜索这个板块" clearable aria-label="搜索主题" />
            <button type="submit">搜索</button>
          </form>
          <div class="feed-subbar">
            <span v-if="!loading && !error">{{ total }} 个主题</span>
            <div class="sort-tabs" role="group" aria-label="主题排序">
              <button type="button" :class="{ active: sort === 'recent' }" :aria-pressed="sort === 'recent'" @click="setSort('recent')">最近回复</button>
              <button type="button" :class="{ active: sort === 'new' }" :aria-pressed="sort === 'new'" @click="setSort('new')">最新发布</button>
            </div>
          </div>
        </div>
        <p v-if="projectId" class="project-filter">正在查看项目 #{{ projectId }} 的讨论 <router-link :to="`/community/boards/${code}`">清除筛选</router-link></p>
        <div v-if="error" class="feed-state" role="alert">{{ error }} <button type="button" @click="load">重试</button></div>
        <div v-else-if="loading" class="feed-state">正在加载主题…</div>
        <div v-else-if="topics.length" class="topic-list"><TopicRow v-for="topic in topics" :key="topic.id" :topic="topic" /></div>
        <div v-else class="feed-state empty-state"><strong>还没有匹配的主题</strong><span>可以换个关键词，或者发起一个新讨论。</span></div>
        <el-pagination v-if="total > 20" class="topic-pagination" background layout="prev, pager, next" :current-page="page" :page-size="20" :total="total" @current-change="changePage" />
      </section>
      <aside class="board-sidebar" aria-label="其他板块">
        <h2>交流板块</h2>
        <router-link v-for="item in displayBoards" :key="item.code" :to="`/community/boards/${item.code}`" :class="{ active: item.code === code }">{{ item.name }}<span v-if="item.topicCount != null">{{ item.topicCount }}</span></router-link>
        <router-link class="all-link" to="/community">全部讨论 <span aria-hidden="true">↗</span></router-link>
      </aside>
    </div>
    <CommunityComposer v-model="composerOpen" :board-code="code" :project-id="projectId" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listBoards, listTopics } from '@/api/community'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'
import { fallbackBoards } from '@/utils/communityBoards'

const route = useRoute()
const router = useRouter()
const code = computed(() => String(route.params.code || ''))
const page = computed(() => {
  const value = Number.parseInt(route.query.page, 10)
  return Number.isFinite(value) && value > 0 ? value : 1
})
const keyword = computed(() => String(route.query.keyword || ''))
const sort = computed(() => route.query.sort === 'new' ? 'new' : 'recent')
const projectId = computed(() => route.query.projectId ? Number(route.query.projectId) : null)
const draftKeyword = ref('')
const boards = ref([])
const displayBoards = computed(() => boards.value.length ? boards.value : fallbackBoards)
const topics = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)
const board = computed(() => displayBoards.value.find((item) => item.code === code.value))
const boardName = computed(() => board.value?.name || '社区板块')
const boardDescription = computed(() => board.value?.description || '')
let loadVersion = 0

async function load() {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  draftKeyword.value = keyword.value
  const [boardResult, topicResult] = await Promise.allSettled([
    listBoards(), listTopics({ board: code.value, projectId: projectId.value,
      keyword: keyword.value, sort: sort.value, page: page.value, size: 20 })
  ])
  if (version !== loadVersion) return
  if (boardResult.status === 'fulfilled') boards.value = Array.isArray(boardResult.value) ? boardResult.value : []
  if (topicResult.status === 'fulfilled') {
    topics.value = topicResult.value?.records || []
    total.value = topicResult.value?.total || 0
  } else {
    topics.value = []
    total.value = 0
    error.value = '主题暂时无法加载。'
  }
  loading.value = false
}

function applySearch() {
  router.push({ path: route.path, query: { ...(projectId.value ? { projectId: projectId.value } : {}),
    ...(draftKeyword.value.trim() ? { keyword: draftKeyword.value.trim() } : {}),
    ...(sort.value === 'new' ? { sort: 'new' } : {}), page: 1 } })
}
function setSort(value) {
  if (value !== sort.value) router.push({ path: route.path, query: { ...route.query, sort: value, page: 1 } })
}
function changePage(next) { router.push({ path: route.path, query: { ...route.query, page: next } }) }
function handleSaved(topic) { ElMessage.success('主题已发布'); router.push(`/community/topics/${topic.id}`) }

onMounted(() => { composerOpen.value = route.query.compose === '1'; load() })
watch(() => route.fullPath, () => { composerOpen.value = route.query.compose === '1'; load() })
</script>

<style scoped>
.board-page { max-width: 1240px; margin: 0 auto; display: grid; gap: 20px; }
.breadcrumbs { display: flex; align-items: center; gap: 8px; color: var(--portal-text-soft); font-size: 12px; }
.breadcrumbs a:hover { color: var(--portal-accent); }
.board-header { display: flex; align-items: end; justify-content: space-between; gap: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--portal-line); }
.board-header h1 { margin: 0 0 5px; font-family: inherit; font-size: 32px; font-weight: 750; }
.board-header p { margin: 0; color: var(--portal-text-soft); font-size: 14px; }
.board-header .el-button { min-height: 38px; padding: 0 18px; font-weight: 650; }
.board-layout { display: grid; grid-template-columns: minmax(0, 1fr) 230px; align-items: start; gap: 24px; }
.board-feed, .board-sidebar { min-width: 0; border: 1px solid var(--portal-line); border-radius: 8px; background: var(--portal-surface); }
.board-feed { overflow: hidden; }
.feed-toolbar { padding: 16px 20px 11px; border-bottom: 1px solid var(--portal-line); }
.filters { display: flex; gap: 8px; }
.filters .el-input { flex: 1; min-width: 0; }
.filters button { min-width: 64px; border: 1px solid var(--portal-line); border-radius: 4px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 13px; cursor: pointer; }
.filters button:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
.feed-subbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 12px; color: var(--portal-text-soft); font-size: 12px; }
.sort-tabs { display: flex; gap: 4px; }
.sort-tabs button { border: 0; border-radius: 5px; padding: 7px 11px; color: var(--portal-text-soft); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.sort-tabs button.active { color: var(--portal-accent); background: var(--portal-bg-soft); font-weight: 650; }
.topic-list { display: grid; }
.project-filter { margin: 0; padding: 12px 20px; border-bottom: 1px solid var(--portal-line); color: var(--portal-text-soft); font-size: 12px; }
.project-filter a { margin-left: 8px; color: var(--portal-accent); }
.feed-state { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; min-height: 104px; padding: 24px; color: var(--portal-text-soft); font-size: 14px; }
.feed-state button { border: 0; padding: 0; color: var(--portal-accent); background: transparent; font: inherit; font-weight: 650; cursor: pointer; }
.empty-state { flex-direction: column; align-items: start; justify-content: center; gap: 8px; }
.empty-state strong { color: var(--portal-text); font-size: 16px; }
.topic-pagination { justify-content: center; padding: 18px; border-top: 1px solid var(--portal-line); }
.board-sidebar { display: grid; gap: 3px; padding: 16px; }
.board-sidebar h2 { margin: 0 0 8px; font-family: inherit; font-size: 14px; }
.board-sidebar a { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-radius: 5px; padding: 10px; color: var(--portal-text-soft); font-size: 13px; }
.board-sidebar a:hover, .board-sidebar a.active { color: var(--portal-accent); background: var(--portal-bg-soft); }
.board-sidebar a.active { font-weight: 650; }
.board-sidebar .all-link { margin-top: 10px; border-top: 1px solid var(--portal-line); border-radius: 0; }
@media (max-width: 800px) { .board-layout { grid-template-columns: minmax(0, 1fr) 200px; gap: 14px; } }
@media (max-width: 650px) { .board-layout { grid-template-columns: 1fr; } .board-sidebar { grid-row: 1; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; } .board-sidebar h2, .board-sidebar .all-link { grid-column: 1 / -1; } .board-sidebar a:not(.all-link) { justify-content: center; border: 1px solid var(--portal-line); text-align: center; } .board-sidebar a span { display: none; } }
@media (max-width: 440px) { .board-header h1 { font-size: 27px; } .board-header p { max-width: 200px; line-height: 1.5; } .feed-toolbar { padding: 12px; } .board-sidebar { padding: 12px; } .board-sidebar a { padding: 9px 5px; font-size: 12px; } }
</style>
