<template>
  <div class="community-page">
    <header class="community-masthead">
      <div class="masthead-meta"><span>社区 / TEAM FORUM</span><span>项目 · 技术 · 日常</span></div>
      <div class="masthead-main">
        <div><h1>话题在这里继续。</h1><p>晒进展、提问题、聊聊工作之外的事。选一个板块，就能开始说。</p></div>
        <div class="masthead-actions"><button type="button" @click="openStarter('project-share')">发布主题 <span aria-hidden="true">↗</span></button><router-link to="/community/mine">我的讨论 ↗</router-link></div>
      </div>
    </header>

    <section class="board-directory" aria-labelledby="board-directory-title">
      <div class="directory-heading"><div><span class="section-kicker">挑个地方坐坐</span><h2 id="board-directory-title">你想聊什么？</h2></div><span>每个板块，都从一个好问题开始。</span></div>
      <div class="board-grid">
        <router-link v-for="board in displayBoards" :key="board.code" :class="['board-tile', board.code]" :to="`/community/boards/${board.code}`">
          <span class="board-marker" :class="board.code" aria-hidden="true" />
          <span class="board-copy"><strong>{{ board.name }}</strong><small>{{ board.description }}</small></span>
          <span class="board-foot">{{ board.topicCount ? `${board.topicCount} 个话题` : '进入板块' }} <span aria-hidden="true">↗</span></span>
        </router-link>
      </div>
    </section>

    <div class="community-layout">
      <section class="feed-column" aria-label="讨论列表">
        <div class="feed-toolbar">
          <div class="feed-topline">
            <div class="feed-title"><span class="section-kicker">论坛现场</span><h2>正在讨论</h2><span v-if="!loading && !error">{{ total }} 个主题</span></div>
            <div class="sort-tabs" role="group" aria-label="讨论排序">
              <button type="button" :class="{ active: sort === 'recent' }" :aria-pressed="sort === 'recent'" @click="setSort('recent')">最近回复</button>
              <button type="button" :class="{ active: sort === 'new' }" :aria-pressed="sort === 'new'" @click="setSort('new')">最新发布</button>
            </div>
          </div>
          <form class="feed-search" role="search" @submit.prevent="applySearch"><input v-model="draftKeyword" type="search" aria-label="搜索讨论" placeholder="搜索主题、问题或项目名" /><button type="submit">搜索 ↗</button></form>
        </div>
        <div v-if="error" class="feed-state" role="alert">{{ error }} <button type="button" @click="load">重试</button></div>
        <div v-else-if="loading" class="feed-state">正在加载讨论…</div>
        <div v-else-if="latest.length" class="topic-list"><TopicRow v-for="topic in latest" :key="topic.id" :topic="topic" /></div>
        <div v-else class="feed-state empty-state"><strong>{{ keyword ? '没有找到相关讨论' : '还没有人开这个头。' }}</strong><span>{{ keyword ? '换个关键词再试试。' : '项目进展、一段经验，或者一个想问的问题，都能成为第一帖。' }}</span><div v-if="!keyword" class="topic-starters" aria-label="从一个话题开始">
          <button type="button" @click="openStarter('project-share')">晒一个项目进展 ↗</button>
          <button type="button" @click="openStarter('tech-talk')">提一个技术问题 ↗</button>
          <button type="button" @click="openStarter('lounge')">随便聊聊 ↗</button>
        </div></div>
        <el-pagination v-if="total > 20" class="topic-pagination" background layout="prev, pager, next" :current-page="page" :page-size="20" :total="total" @current-change="changePage" />
      </section>
      <aside class="community-sidebar" aria-label="个人与社区入口">
        <section class="identity-panel">
          <span class="panel-kicker">你在这里</span>
          <strong>{{ account.profile?.nickname || (account.needsRestore ? '待找回的账户' : '一位新朋友') }}</strong>
          <p>{{ account.needsRestore ? '找回账户后，可以接着参与之前的话题。' : '用自己的昵称接着聊，发帖和回复都会留在你的账户里。' }}</p>
          <router-link to="/community/mine">打开我的讨论 <span aria-hidden="true">↗</span></router-link>
        </section>
        <section class="sidebar-links">
          <span class="panel-kicker">把话题延伸出去</span>
          <router-link to="/projects">发现项目 <span aria-hidden="true">↗</span></router-link>
          <router-link to="/reading">阅读经验 <span aria-hidden="true">↗</span></router-link>
        </section>
      </aside>
    </div>
    <CommunityComposer v-model="composerOpen" :board-code="composerBoardCode" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'
import { listBoards, listTopics } from '@/api/community'
import { useGuestAccount } from '@/store/guestAccount'
import { fallbackBoards } from '@/utils/communityBoards'

const route = useRoute()
const router = useRouter()
const account = useGuestAccount()
const boards = ref([])
const displayBoards = computed(() => boards.value.length ? boards.value : fallbackBoards)
const latest = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)
const composerBoardCode = ref('project-share')
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

function openStarter(boardCode) { composerBoardCode.value = boardCode; composerOpen.value = true }

function setSort(value) {
  if (value !== sort.value) router.push({ path: '/community', query: { ...(keyword.value ? { keyword: keyword.value } : {}), ...(value === 'new' ? { sort: 'new' } : {}) } })
}
function applySearch() { router.push({ path: '/community', query: { ...(draftKeyword.value.trim() ? { keyword: draftKeyword.value.trim() } : {}), ...(sort.value === 'new' ? { sort: 'new' } : {}) } }) }
function changePage(next) { router.push({ path: '/community', query: { ...(keyword.value ? { keyword: keyword.value } : {}), ...(sort.value === 'new' ? { sort: 'new' } : {}), page: next } }) }
function handleSaved(topic) { ElMessage.success('主题已发布'); router.push(`/community/topics/${topic.id}`) }

onMounted(() => { composerOpen.value = route.query.compose === '1'; load() })
watch(() => route.fullPath, () => { if (route.query.compose === '1') composerOpen.value = true; load() })
</script>

<style scoped>
.community-page { max-width: 1360px; margin: 0 auto; display: grid; gap: 0; padding-bottom: 70px; }
.community-masthead { border-top: 1px solid var(--portal-text); padding: 17px 0 38px; }
.masthead-meta { display: flex; justify-content: space-between; gap: 14px; color: var(--portal-text-soft); font-size: 11px; letter-spacing: .08em; }
.masthead-meta span:first-child { color: var(--portal-accent); font-weight: 760; }
.masthead-main { display: flex; justify-content: space-between; align-items: end; gap: 28px; padding-top: 41px; }
.masthead-main h1 { margin: 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(39px, 4vw, 61px); font-weight: 650; letter-spacing: -.06em; line-height: 1.25; }
.masthead-main p { margin: 15px 0 0; color: var(--portal-text-soft); font-size: 14px; line-height: 1.8; }
.masthead-actions { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
.masthead-actions button { border: 0; border-bottom: 1px solid var(--portal-accent); padding: 0 0 8px; color: var(--portal-accent); background: transparent; font: inherit; font-size: 13px; font-weight: 730; cursor: pointer; }
.masthead-actions button span { margin-left: 16px; }
.masthead-actions a { border-bottom: 1px solid var(--portal-text); padding-bottom: 8px; font-size: 13px; font-weight: 650; }
.section-kicker, .panel-kicker { color: var(--portal-accent); font-size: 11px; font-weight: 760; letter-spacing: .08em; }
.board-directory { border-top: 1px solid var(--portal-line); padding: 24px 0 56px; }
.directory-heading { display: flex; justify-content: space-between; align-items: end; gap: 15px; margin-bottom: 22px; }
.directory-heading h2 { margin: 7px 0 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: 31px; font-weight: 650; }
.directory-heading > span { color: var(--portal-text-soft); font-size: 12px; }
.board-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); }
.board-tile { display: grid; grid-template-columns: 6px minmax(0, 1fr); align-content: center; column-gap: 15px; min-width: 0; min-height: 136px; padding: 22px clamp(14px, 2vw, 28px); }
.board-tile + .board-tile { border-left: 1px solid var(--portal-line); }
.board-tile:hover { background: var(--portal-bg-soft); }
.board-marker { grid-row: 1 / 3; width: 6px; height: 29px; margin-top: 2px; background: var(--portal-accent); }
.board-marker.tech-talk { background: #44738a; }
.board-marker.lounge { background: #698469; }
.board-copy { display: grid; gap: 6px; min-width: 0; }
.board-copy strong { font-size: 20px; font-weight: 680; }
.board-copy small { overflow: hidden; color: var(--portal-text-soft); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.board-foot { display: flex; justify-content: space-between; grid-column: 2; gap: 8px; margin-top: 18px; color: var(--portal-text-soft); font-size: 11px; }
.board-foot span { color: var(--portal-accent); font-size: 15px; }
.community-layout { display: grid; grid-template-columns: minmax(0, 1fr) 276px; align-items: start; gap: 38px; }
.feed-column, .community-sidebar { min-width: 0; }
.feed-toolbar { display: grid; gap: 16px; border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 18px 0; }
.feed-topline { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.feed-title { display: flex; align-items: baseline; gap: 12px; }
.feed-title h2 { margin: 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: 25px; font-weight: 700; }
.feed-title > span:last-child { color: var(--portal-text-soft); font-size: 12px; }
.sort-tabs { display: flex; gap: 17px; }
.sort-tabs button { border: 0; border-bottom: 2px solid transparent; padding: 8px 0; color: var(--portal-text-soft); background: transparent; font: inherit; font-size: 12px; cursor: pointer; }
.sort-tabs button.active { border-bottom-color: var(--portal-accent); color: var(--portal-text); font-weight: 700; }
.feed-search { display: flex; gap: 8px; }
.feed-search input { flex: 1; min-width: 0; border: 1px solid var(--portal-line); padding: 10px 12px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 13px; }
.feed-search input:focus { border-color: var(--portal-accent); outline: none; }
.feed-search button { min-width: 73px; border: 1px solid var(--portal-line); color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 12px; cursor: pointer; }
.feed-search button:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
.topic-list { display: grid; }
.topic-list :deep(.topic-row) { padding-left: 0; padding-right: 0; }
.feed-state { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-height: 104px; border-bottom: 1px solid var(--portal-line); padding: 24px 0; color: var(--portal-text-soft); font-size: 14px; }
.feed-state button { border: 0; padding: 0; color: var(--portal-accent); background: transparent; font: inherit; font-weight: 650; cursor: pointer; }
.empty-state { align-content: center; flex-direction: column; align-items: start; gap: 10px; min-height: 210px; }
.empty-state strong { color: var(--portal-text); font-size: 22px; }
.empty-state span { line-height: 1.6; }
.topic-starters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.topic-starters button { border: 1px solid var(--portal-line); padding: 10px 12px; background: var(--portal-surface); color: var(--portal-text); font-size: 12px; }
.topic-starters button:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
.topic-pagination { justify-content: center; padding: 18px; border-top: 1px solid var(--portal-line); }
.community-sidebar { display: grid; gap: 16px; }
.identity-panel { display: grid; gap: 12px; padding: 24px; background: #f5f2eb; }
.identity-panel strong { overflow: hidden; color: var(--portal-text); font-size: 21px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.identity-panel p { margin: 0; color: var(--portal-text-soft); font-size: 12px; line-height: 1.7; }
.identity-panel > a { margin-top: 6px; border-top: 1px solid #ddd7cb; padding-top: 13px; color: var(--portal-accent); font-size: 12px; font-weight: 680; }
.identity-panel > a span { float: right; }
.sidebar-links { display: grid; gap: 0; border-top: 1px solid var(--portal-line); padding-top: 16px; }
.sidebar-links .panel-kicker { margin-bottom: 10px; }
.sidebar-links a { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--portal-line); padding: 12px 0; color: var(--portal-text-soft); font-size: 12px; }
.sidebar-links a:hover { color: var(--portal-accent); }
@media (max-width: 900px) { .community-layout { grid-template-columns: minmax(0, 1fr) 220px; gap: 20px; } }
@media (max-width: 700px) { .masthead-main { align-items: start; flex-direction: column; padding-top: 28px; } .masthead-meta span:last-child { display: none; } .board-grid { grid-template-columns: 1fr; } .board-tile { min-height: 105px; } .board-tile + .board-tile { border-top: 1px solid var(--portal-line); border-left: 0; } .community-layout { grid-template-columns: 1fr; } .community-sidebar { grid-row: 1; grid-template-columns: 1fr; } .sidebar-links { display: none; } .identity-panel { padding: 18px; } }
@media (max-width: 440px) { .community-masthead { padding-bottom: 29px; } .masthead-main h1 { font-size: 39px; } .masthead-actions { gap: 17px; } .directory-heading > span { display: none; } .feed-title { flex-wrap: wrap; } .feed-title .section-kicker { width: 100%; } }
</style>
