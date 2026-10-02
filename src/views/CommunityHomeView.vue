<template>
  <div class="community-page">
    <header class="community-masthead">
      <div class="masthead-copy">
        <span class="eyebrow">团队论坛 / 从这里接上话</span>
        <h1>有项目就晒，<br><em>有问题就聊。</em></h1>
        <p>展示进展、讨论难题，也可以聊点工作之外的事。每个主题都有人可以接着说。</p>
        <div class="masthead-actions">
          <button type="button" @click="openStarter('project-share')">发布主题 <span aria-hidden="true">↗</span></button>
          <router-link to="/community/mine">我的讨论 <span aria-hidden="true">↗</span></router-link>
        </div>
      </div>
      <div class="masthead-note" aria-hidden="true">
        <span>让讨论有去处</span>
        <strong>晒项目。<br>问技术。<br>聊生活。</strong>
        <small>同一个地方，继续下一句。</small>
      </div>
    </header>

    <section class="board-directory" aria-labelledby="board-directory-title">
      <div class="directory-heading"><div><span class="section-kicker">选一个板块</span><h2 id="board-directory-title">你想聊什么？</h2></div><span>三个入口，各有自己的话题。</span></div>
      <div class="board-grid">
        <router-link v-for="(board, index) in displayBoards" :key="board.code" :class="['board-tile', board.code]" :to="`/community/boards/${board.code}`">
          <span class="board-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ board.name }}</strong>
          <small>{{ board.description }}</small>
          <span class="board-foot"><span>{{ board.topicCount ? `${board.topicCount} 个话题` : '等你开个头' }}</span><span aria-hidden="true">↗</span></span>
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
          <router-link :to="{ path: '/explore', query: { type: 'project' } }">发现项目 <span aria-hidden="true">↗</span></router-link>
          <router-link :to="{ path: '/explore', query: { type: 'article' } }">阅读经验 <span aria-hidden="true">↗</span></router-link>
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
.community-masthead { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr); min-height: 320px; }
.masthead-copy { display: flex; flex-direction: column; align-items: start; padding: 36px clamp(30px, 4vw, 58px) 36px; background: #f2f0ea; }
.eyebrow, .section-kicker, .panel-kicker { color: var(--portal-accent); font-size: 11px; font-weight: 770; letter-spacing: .1em; }
.masthead-copy h1 { margin: 24px 0 17px; font-family: inherit; font-size: clamp(38px, 4vw, 59px); font-weight: 760; letter-spacing: -.055em; line-height: 1.2; }
.masthead-copy h1 em { color: var(--portal-accent); font-style: normal; }
.masthead-copy p { max-width: 36em; margin: 0; color: #5d666a; font-size: 14px; line-height: 1.8; }
.masthead-actions { display: flex; align-items: center; gap: 23px; margin-top: 25px; }
.masthead-actions button { min-height: 44px; border: 0; padding: 0 18px; background: var(--portal-accent); color: #fff; font: inherit; font-size: 13px; font-weight: 690; cursor: pointer; }
.masthead-actions button span { margin-left: 18px; }
.masthead-actions button:hover { filter: brightness(.9); }
.masthead-actions a { border-bottom: 1px solid currentColor; padding: 7px 0; font-size: 13px; font-weight: 650; }
.masthead-note { display: flex; flex-direction: column; align-items: start; padding: 35px clamp(26px, 3vw, 45px); background: #273f50; color: #fff; }
.masthead-note > span { color: #c4d5dd; font-size: 11px; font-weight: 710; letter-spacing: .1em; }
.masthead-note strong { margin: auto 0; font-size: clamp(25px, 2.4vw, 38px); font-weight: 690; line-height: 1.55; }
.masthead-note small { color: #c4d5dd; font-size: 12px; }
.board-directory { padding: 49px 0 52px; }
.directory-heading { display: flex; justify-content: space-between; align-items: end; gap: 15px; margin-bottom: 20px; }
.directory-heading h2 { margin: 6px 0 0; font-family: inherit; font-size: 27px; font-weight: 700; }
.directory-heading > span { color: var(--portal-text-soft); font-size: 12px; }
.board-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); }
.board-tile { display: grid; align-content: start; gap: 6px; min-width: 0; min-height: 173px; padding: 21px clamp(14px, 2vw, 27px); }
.board-tile + .board-tile { border-left: 1px solid var(--portal-line); }
.board-tile:hover { background: var(--portal-bg-soft); }
.board-index { color: var(--portal-accent); font-size: 11px; font-weight: 700; }
.board-tile.tech-talk .board-index { color: #31596c; }
.board-tile.lounge .board-index { color: #567b65; }
.board-tile strong { margin-top: 9px; font-size: 21px; font-weight: 700; }
.board-tile small { overflow: hidden; color: var(--portal-text-soft); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.board-foot { display: flex; justify-content: space-between; gap: 8px; margin-top: auto; color: var(--portal-text-soft); font-size: 11px; }
.board-foot span:last-child { color: var(--portal-accent); font-size: 16px; }
.community-layout { display: grid; grid-template-columns: minmax(0, 1fr) 276px; align-items: start; gap: 38px; }
.feed-column, .community-sidebar { min-width: 0; }
.feed-toolbar { display: grid; gap: 16px; border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 18px 0; }
.feed-topline { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.feed-title { display: flex; align-items: baseline; gap: 12px; }
.feed-title h2 { margin: 0; font-family: inherit; font-size: 25px; font-weight: 700; }
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
@media (max-width: 700px) { .community-masthead { grid-template-columns: 1fr; } .masthead-copy { min-height: 350px; } .masthead-note { display: none; } .board-grid { grid-template-columns: 1fr; } .board-tile { min-height: 120px; } .board-tile + .board-tile { border-top: 1px solid var(--portal-line); border-left: 0; } .community-layout { grid-template-columns: 1fr; } .community-sidebar { grid-row: 1; grid-template-columns: 1fr; } .sidebar-links { display: none; } .identity-panel { padding: 18px; } }
@media (max-width: 440px) { .masthead-copy { padding: 28px 23px; } .masthead-copy h1 { font-size: 37px; } .masthead-actions { gap: 14px; } .directory-heading > span { display: none; } .feed-title { flex-wrap: wrap; } .feed-title .section-kicker { width: 100%; } }
</style>
