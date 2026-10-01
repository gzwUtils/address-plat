<template>
  <div class="community-page">
    <header class="page-heading">
      <div><h1>社区</h1><p>分享项目进展，讨论技术问题，也可以随便聊聊。</p></div>
      <el-button type="primary" @click="composerOpen = true">发布主题</el-button>
    </header>
    <div class="community-layout">
      <section class="feed-column" aria-label="讨论列表">
        <div class="feed-toolbar">
          <div class="feed-topline">
            <div class="feed-title"><h2>全部讨论</h2><span v-if="!loading && !error">{{ total }} 个主题</span></div>
            <div class="sort-tabs" role="group" aria-label="讨论排序">
              <button type="button" :class="{ active: sort === 'recent' }" :aria-pressed="sort === 'recent'" @click="setSort('recent')">最近回复</button>
              <button type="button" :class="{ active: sort === 'new' }" :aria-pressed="sort === 'new'" @click="setSort('new')">最新发布</button>
            </div>
          </div>
          <form class="feed-search" role="search" @submit.prevent="applySearch"><input v-model="draftKeyword" type="search" aria-label="搜索讨论" placeholder="在讨论中搜索" /><button type="submit">搜索</button></form>
        </div>
        <div v-if="error" class="feed-state" role="alert">{{ error }} <button type="button" @click="load">重试</button></div>
        <div v-else-if="loading" class="feed-state">正在加载讨论…</div>
        <div v-else-if="latest.length" class="topic-list"><TopicRow v-for="topic in latest" :key="topic.id" :topic="topic" /></div>
        <div v-else class="feed-state empty-state"><strong>{{ keyword ? '没有找到相关讨论' : '这里还没有主题' }}</strong><span>{{ keyword ? '换个关键词再试试。' : '从项目经验、一个问题或随手想到的话题开始。' }}</span><button v-if="!keyword" type="button" @click="composerOpen = true">发布第一个主题 ↗</button></div>
        <el-pagination v-if="total > 20" class="topic-pagination" background layout="prev, pager, next" :current-page="page" :page-size="20" :total="total" @current-change="changePage" />
      </section>
      <aside class="community-sidebar" aria-label="社区导航">
        <section class="sidebar-panel">
          <h2>交流板块</h2>
          <router-link v-for="board in displayBoards" :key="board.code" class="board-link" :to="`/community/boards/${board.code}`">
            <span><strong>{{ board.name }}</strong><small>{{ board.description }}</small></span>
            <span v-if="board.topicCount != null" class="board-count">{{ board.topicCount }}</span>
          </router-link>
        </section>
        <section class="sidebar-panel sidebar-links">
          <h2>继续浏览</h2>
          <router-link to="/community/mine">我的讨论 <span aria-hidden="true">↗</span></router-link>
          <router-link :to="{ path: '/explore', query: { type: 'project' } }">项目广场 <span aria-hidden="true">↗</span></router-link>
        </section>
      </aside>
    </div>
    <CommunityComposer v-model="composerOpen" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'
import { listBoards, listTopics } from '@/api/community'
import { fallbackBoards } from '@/utils/communityBoards'

const route = useRoute()
const router = useRouter()
const boards = ref([])
const displayBoards = computed(() => boards.value.length ? boards.value : fallbackBoards)
const latest = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)
const draftKeyword = ref('')
const keyword = computed(() => String(route.query.keyword || '').trim())
const page = computed(() => {
  const value = Number.parseInt(route.query.page, 10)
  return Number.isFinite(value) && value > 0 ? value : 1
})
const sort = computed(() => route.query.sort === 'new' ? 'new' : 'recent')
let loadVersion = 0

async function load() {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  draftKeyword.value = keyword.value
  const [boardResult, topicResult] = await Promise.allSettled([
    listBoards(), listTopics({ keyword: keyword.value, page: page.value, size: 20, sort: sort.value })
  ])
  if (version !== loadVersion) return
  if (boardResult.status === 'fulfilled') boards.value = Array.isArray(boardResult.value) ? boardResult.value : []
  if (topicResult.status === 'fulfilled') {
    latest.value = topicResult.value?.records || []
    total.value = topicResult.value?.total || 0
  } else {
    latest.value = []
    total.value = 0
    error.value = '讨论暂时无法加载。'
  }
  loading.value = false
}

function setSort(value) {
  if (value !== sort.value) router.push({ path: '/community', query: { ...(keyword.value ? { keyword: keyword.value } : {}), ...(value === 'new' ? { sort: 'new' } : {}) } })
}
function applySearch() { router.push({ path: '/community', query: { ...(draftKeyword.value.trim() ? { keyword: draftKeyword.value.trim() } : {}), ...(sort.value === 'new' ? { sort: 'new' } : {}) } }) }
function changePage(next) { router.push({ path: '/community', query: { ...(keyword.value ? { keyword: keyword.value } : {}), ...(sort.value === 'new' ? { sort: 'new' } : {}), page: next } }) }
function handleSaved(topic) { ElMessage.success('主题已发布'); router.push(`/community/topics/${topic.id}`) }

onMounted(load)
watch(() => route.fullPath, load)
</script>

<style scoped>
.community-page { max-width: 1240px; margin: 0 auto; display: grid; gap: 24px; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 6px 0 19px; border-bottom: 1px solid var(--portal-line); }
.page-heading h1 { margin: 0 0 6px; font-family: inherit; font-size: 32px; font-weight: 750; letter-spacing: -.02em; }
.page-heading p { margin: 0; color: var(--portal-text-soft); font-size: 14px; }
.page-heading .el-button { min-height: 38px; padding: 0 18px; font-weight: 650; }
.community-layout { display: grid; grid-template-columns: minmax(0, 1fr) 260px; align-items: start; gap: 24px; }
.feed-column, .sidebar-panel { min-width: 0; }
.feed-column { border-top: 1px solid var(--portal-line); }
.feed-toolbar { display: grid; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--portal-line); }
.feed-topline { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.feed-title { display: flex; align-items: baseline; gap: 10px; }
.feed-title h2 { margin: 0; font-family: inherit; font-size: 17px; }
.feed-title span { color: var(--portal-text-soft); font-size: 12px; }
.sort-tabs { display: flex; gap: 4px; }
.sort-tabs button { border: 0; border-radius: 5px; padding: 7px 11px; color: var(--portal-text-soft); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.sort-tabs button:hover { color: var(--portal-text); background: var(--portal-bg-soft); }
.sort-tabs button.active { color: var(--portal-accent); background: var(--portal-bg-soft); font-weight: 650; }
.feed-search { display: flex; gap: 8px; }
.feed-search input { flex: 1; min-width: 0; border: 1px solid var(--portal-line); border-radius: 4px; padding: 9px 11px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 13px; }
.feed-search input:focus { border-color: var(--portal-accent); outline: none; }
.feed-search button { min-width: 64px; border: 1px solid var(--portal-line); border-radius: 4px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 13px; cursor: pointer; }
.feed-search button:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
.topic-list { display: grid; }
.feed-state { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-height: 104px; padding: 24px; color: var(--portal-text-soft); font-size: 14px; }
.feed-state button { border: 0; padding: 0; color: var(--portal-accent); background: transparent; font: inherit; font-weight: 650; cursor: pointer; }
.empty-state { align-content: center; flex-direction: column; align-items: start; gap: 8px; }
.empty-state strong { color: var(--portal-text); font-size: 16px; }
.topic-pagination { justify-content: center; padding: 18px; border-top: 1px solid var(--portal-line); }
.community-sidebar { display: grid; gap: 16px; border-left: 1px solid var(--portal-line); padding-left: 20px; }
.sidebar-panel { padding: 0 0 16px; }
.sidebar-panel + .sidebar-panel { border-top: 1px solid var(--portal-line); padding-top: 16px; }
.sidebar-panel h2 { margin: 0 0 12px; font-family: inherit; font-size: 14px; font-weight: 700; }
.board-link { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 8px; border-radius: 5px; }
.board-link:hover, .sidebar-links a:hover { background: var(--portal-bg-soft); }
.board-link + .board-link { border-top: 1px solid var(--portal-line); border-radius: 0; }
.board-link > span:first-child { display: grid; gap: 4px; min-width: 0; }
.board-link strong { font-size: 14px; font-weight: 650; }
.board-link small { overflow: hidden; color: var(--portal-text-soft); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.board-count { color: var(--portal-text-soft); font-size: 12px; }
.sidebar-links a { display: flex; justify-content: space-between; gap: 8px; padding: 10px 8px; color: var(--portal-accent-2); font-size: 13px; }
@media (max-width: 900px) { .community-layout { grid-template-columns: minmax(0, 1fr) 220px; gap: 14px; } }
@media (max-width: 700px) { .community-layout { grid-template-columns: 1fr; } .community-sidebar { grid-row: 1; border-left: 0; padding-left: 0; } .sidebar-panel:first-child { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; } .sidebar-panel:first-child h2 { grid-column: 1 / -1; } .board-link, .board-link + .board-link { border: 1px solid var(--portal-line); border-radius: 5px; } .board-link small, .board-count { display: none; } .sidebar-links { display: none; } }
@media (max-width: 440px) { .page-heading { align-items: start; } .page-heading h1 { font-size: 27px; } .page-heading p { max-width: 215px; line-height: 1.5; } .feed-toolbar { padding: 14px 0; } .board-link { padding: 10px 6px; justify-content: center; text-align: center; } .board-link strong { font-size: 12px; } }
</style>
