<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-main">
        <span class="eyebrow">KD TEAM PORTAL</span>
        <h1>分享项目，<br /><em>聊出新想法。</em></h1>
        <p>找项目、读经验、参与社区讨论。你的项目和想法，都能在这里找到回应。</p>
        <form class="hero-search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="home-search">搜索门户资源</label>
          <input id="home-search" v-model="keyword" type="search" placeholder="搜索项目、文章、AI 能力…" />
          <button type="submit">搜索全部资源 <span aria-hidden="true">↗</span></button>
        </form>
        <div class="quick-links" aria-label="按类型浏览">
          <span>快速浏览</span>
          <router-link v-for="link in quickLinks" :key="link.type" :to="{ path: '/explore', query: { type: link.type } }">
            {{ link.label }} <span aria-hidden="true">↗</span>
          </router-link>
        </div>
      </div>
      <aside class="hero-aside" aria-label="快速打开项目">
        <div class="aside-label">快速打开 <span>PROJECT SHORTCUTS</span></div>
        <template v-if="groups.project.loading">
          <div v-for="index in 3" :key="index" class="overview-row" aria-hidden="true"><span>正在加载…</span></div>
        </template>
        <p v-else-if="groups.project.error" class="aside-state">项目入口暂时无法加载。</p>
        <p v-else-if="!groups.project.records.length" class="aside-state">暂无项目入口。</p>
        <div v-if="groups.project.error || (!groups.project.loading && !groups.project.records.length)" class="aside-feature">
          <span>在这里，分享与讨论同样重要</span>
          <strong>从一个话题开始，<br />让好想法被看见。</strong>
          <router-link to="/community">去社区看看 <span aria-hidden="true">↗</span></router-link>
        </div>
        <router-link
          v-for="item in groups.project.records.slice(0, 3)"
          v-else
          :key="item.id"
          class="overview-row"
          :to="`/project/${item.id}`"
        >
          <span>{{ item.projectName }}</span>
          <strong aria-hidden="true">↗</strong>
        </router-link>
        <router-link class="aside-link" :to="{ path: '/explore', query: { type: 'project' } }">浏览全部项目 <span aria-hidden="true">↗</span></router-link>
      </aside>
    </section>

    <section class="home-section discussion-section">
      <header class="section-heading">
        <div><span class="section-index">01 / COMMUNITY</span><h2>正在讨论</h2><p>看看大家最近分享了什么，也可以开一个新话题。</p></div>
        <router-link to="/community">进入社区 <span aria-hidden="true">↗</span></router-link>
      </header>
      <div v-if="groups.topic.loading" class="topic-stack"><div v-for="index in 3" :key="index" class="card-skeleton" /></div>
      <div v-else-if="groups.topic.error" class="state-panel" role="alert"><p>讨论暂时无法加载。</p><button type="button" @click="loadGroup('topic')">重新加载</button></div>
      <div v-else-if="groups.topic.records.length" class="topic-stack"><TopicRow v-for="item in groups.topic.records" :key="item.id" :topic="item" /></div>
      <div v-else class="state-panel">还没有讨论。<router-link to="/community">发起第一个话题 ↗</router-link></div>
    </section>

    <section v-for="section in sections" :key="section.kind" class="home-section">
      <header class="section-heading">
        <div>
          <span class="section-index">{{ section.index }} / {{ section.kicker }}</span>
          <h2>{{ section.title }}</h2>
          <p>{{ section.description }}</p>
        </div>
        <router-link :to="{ path: '/explore', query: { type: section.kind } }">查看全部 <span aria-hidden="true">↗</span></router-link>
      </header>

      <div v-if="groups[section.kind].loading" class="card-grid" aria-live="polite">
        <div v-for="index in section.kind === 'project' ? 3 : 2" :key="index" class="card-skeleton" aria-hidden="true" />
        <span class="sr-only">正在加载{{ section.title }}</span>
      </div>
      <div v-else-if="groups[section.kind].error" class="state-panel" role="alert">
        <p>{{ section.title }}暂时无法加载。</p>
        <button type="button" @click="loadGroup(section.kind)">重新加载</button>
      </div>
      <div v-else-if="groups[section.kind].records.length" class="card-grid">
        <DiscoveryCard
          v-for="item in groups[section.kind].records"
          :key="`${section.kind}-${item.id}`"
          :kind="section.kind"
          :item="item"
        />
      </div>
      <div v-else class="state-panel">暂无{{ section.title }}。</div>
    </section>

    <section v-if="recentItems.length" class="recent-section">
      <div class="section-heading">
        <div>
          <span class="section-index">06 / PICK UP WHERE YOU LEFT OFF</span>
          <h2>继续浏览</h2>
          <p>回到你最近看过的内容。</p>
        </div>
      </div>
      <div class="recent-grid">
        <router-link v-for="item in recentItems" :key="`${item.kind}-${item.targetId}`" :to="recentPath(item)">
          <span>{{ kindLabel(item.kind) }}</span>
          <strong>{{ item.title }}</strong>
          <small>{{ item.subtitle || '查看详情' }} <span aria-hidden="true">↗</span></small>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import DiscoveryCard from '@/components/DiscoveryCard.vue'
import TopicRow from '@/components/TopicRow.vue'
import { getRecentViews } from '@/api/content'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'
import { getClientId } from '@/utils/clientId'

const router = useRouter()
const keyword = ref('')
const quickLinks = [
  { type: 'project', label: '项目' },
  { type: 'topic', label: '讨论' },
  { type: 'article', label: '文章' },
  { type: 'ai', label: 'AI 资产' },
  { type: 'life', label: '团队内容' }
]
const sections = [
  { kind: 'project', index: '02', kicker: 'PROJECTS', title: '项目入口', description: '直接进入团队常用的系统与工具。' },
  { kind: 'article', index: '03', kicker: 'KNOWLEDGE', title: '推荐文章', description: '把实践和经验沉淀下来，随时接着读。' },
  { kind: 'ai', index: '04', kicker: 'AI CAPABILITIES', title: 'AI 能力', description: '找到可用的助手、技能和工作流。' },
  { kind: 'life', index: '05', kicker: 'TEAM LIFE', title: '团队内容', description: '公告、活动与日常灵感。' }
]
const emptyGroup = () => ({ records: [], total: 0, loading: true, error: null })
const groups = reactive({
  project: emptyGroup(), topic: emptyGroup(), article: emptyGroup(), ai: emptyGroup(), life: emptyGroup()
})
const recentItems = ref([])

const submitSearch = () => router.push({
  path: '/explore',
  query: keyword.value.trim() ? { keyword: keyword.value.trim() } : {}
})

const kindLabel = (kind) => quickLinks.find((item) => item.type === kind)?.label || '资源'
const recentPath = (item) => item.kind === 'project'
  ? `/project/${item.targetId}`
  : `/explore/${item.kind}/${item.targetId}`

async function loadGroup(kind) {
  groups[kind] = { ...emptyGroup(), loading: true }
  try {
    const result = await fetchDiscoveryGroup(kind, { size: kind === 'project' ? 6 : 3 })
    groups[kind] = { ...result, loading: false, error: null }
  } catch (error) {
    console.warn(`加载${kind}失败`, error)
    groups[kind] = { records: [], total: 0, loading: false, error }
  }
}

async function loadRecent() {
  try {
    const result = await getRecentViews(getClientId())
    recentItems.value = Array.isArray(result)
      ? result.filter((item) => ['project', 'article', 'ai', 'life'].includes(item.kind) && item.targetId && item.title).slice(0, 6)
      : []
  } catch (error) {
    console.warn('加载最近浏览失败', error)
    recentItems.value = []
  }
}

onMounted(() => {
  sections.forEach((section) => loadGroup(section.kind))
  loadGroup('topic')
  loadRecent()
})
</script>

<style scoped>
.home-page { max-width: 1440px; margin: 0 auto; display: grid; gap: clamp(42px, 6vw, 76px); padding-bottom: 48px; }
.hero { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(270px, .7fr); gap: 20px; }
.hero-main, .hero-aside { border: 1px solid var(--portal-line); border-radius: 25px; box-shadow: var(--portal-shadow); }
.hero-main { position: relative; overflow: hidden; padding: clamp(30px, 4vw, 56px); background: radial-gradient(circle at 96% 7%, var(--portal-glow), transparent 47%), linear-gradient(135deg, var(--portal-hero-top), var(--portal-hero-bottom) 98%); }
.hero-main::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 5px; background: var(--portal-accent); }
.hero-main::after { content: ''; position: absolute; width: 260px; aspect-ratio: 1; right: -100px; top: -100px; border: 1px solid color-mix(in srgb, var(--portal-accent-2) 24%, transparent); border-radius: 50%; box-shadow: 0 0 0 34px color-mix(in srgb, var(--portal-accent-2) 4%, transparent), 0 0 0 72px color-mix(in srgb, var(--portal-accent-2) 3%, transparent); pointer-events: none; }
.eyebrow, .section-index, .aside-label { color: var(--portal-accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; }
h1 { position: relative; max-width: 780px; margin: 18px 0; font-size: clamp(39px, 4.7vw, 62px); line-height: 1.2; letter-spacing: -.045em; }
h1 em { color: var(--portal-accent-2); font-style: normal; }
.hero-main > p { max-width: 580px; margin: 0; color: var(--portal-text-soft); font-size: clamp(16px, 1.7vw, 20px); line-height: 1.7; }
.hero-search { display: flex; max-width: 780px; gap: 6px; margin-top: 30px; padding: 6px; border: 1px solid var(--portal-line); border-radius: 14px; background: var(--portal-surface); box-shadow: 0 8px 22px rgba(38, 52, 66, .06); }
.hero-search input { flex: 1; min-width: 0; padding: 14px 16px; border: 0; outline: 0; color: var(--portal-text); background: transparent; font: inherit; }
.hero-search input::placeholder { color: var(--portal-text-soft); }
.hero-search:focus-within { border-color: var(--portal-accent); box-shadow: 0 0 0 3px var(--portal-glow); }
.hero-search button { border: 0; border-radius: 11px; padding: 12px 18px; background: var(--portal-accent); color: var(--portal-accent-ink); font: inherit; font-weight: 700; cursor: pointer; }
.quick-links { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.quick-links > span { margin-right: 8px; color: var(--portal-text-soft); font-size: 13px; }
.quick-links a { padding: 7px 12px; border: 1px solid var(--portal-line); border-radius: 999px; color: var(--portal-text); background: rgba(255, 255, 255, .55); font-size: 13px; }
.quick-links a:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
.hero-aside { display: flex; flex-direction: column; padding: 32px; background: linear-gradient(155deg, #eff5f7, #fbfcfa 75%); border-top: 4px solid var(--portal-accent-2); }
.aside-label { display: flex; justify-content: space-between; align-items: center; padding-bottom: 28px; }
.aside-label span { color: var(--portal-text-soft); font-size: 10px; }
.overview-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 23px 0; border-top: 1px solid var(--portal-line); color: var(--portal-text); font-size: 17px; font-weight: 600; }
.overview-row:hover { color: var(--portal-accent); }
.overview-row strong { color: var(--portal-accent); font-size: 19px; line-height: 1; }
.aside-state { color: var(--portal-text-soft); line-height: 1.6; }
.aside-feature { display: grid; gap: 14px; margin-top: 22px; padding: 24px; border: 1px solid #d8e5e9; border-radius: 16px; background: rgba(255, 255, 255, .68); }
.aside-feature > span { color: var(--portal-accent-2); font-size: 12px; letter-spacing: .04em; }
.aside-feature strong { color: var(--portal-text); font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: 22px; line-height: 1.45; }
.aside-feature a { color: var(--portal-accent); font-size: 13px; font-weight: 700; }
.aside-link { display: flex; justify-content: space-between; margin-top: auto; padding-top: 24px; color: var(--portal-accent); font-weight: 700; }
.home-section, .recent-section { min-width: 0; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 18px; margin-bottom: 20px; }
.section-heading h2 { margin: 9px 0 5px; font-size: clamp(28px, 3vw, 40px); letter-spacing: -.025em; }
.section-heading p { margin: 0; color: var(--portal-text-soft); }
.section-heading > a { color: var(--portal-accent); white-space: nowrap; font-weight: 700; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr)); gap: 17px; }
.topic-stack { display: grid; gap: 12px; }
.card-skeleton { min-height: 230px; border: 1px solid var(--portal-line); border-radius: 20px; background: linear-gradient(100deg, #f6f4ef 25%, #fffefa 50%, #f6f4ef 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.state-panel { display: flex; align-items: center; gap: 16px; padding: 27px; border: 1px dashed var(--portal-line); border-radius: 18px; color: var(--portal-text-soft); }
.state-panel p { margin: 0; }
.state-panel button { border: 1px solid var(--portal-accent); border-radius: 9px; padding: 9px 12px; color: var(--portal-accent); background: transparent; font: inherit; cursor: pointer; }
.recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.recent-grid a { display: grid; gap: 9px; padding: 20px; border: 1px solid var(--portal-line); border-radius: 16px; background: var(--portal-surface); }
.recent-grid a:hover { border-color: var(--portal-accent); }
.recent-grid span, .recent-grid small { color: var(--portal-text-soft); }
.recent-grid strong { font-size: 16px; }
.recent-grid small { display: flex; justify-content: space-between; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (max-width: 1000px) { .hero { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .hero-main, .hero-aside { padding: 25px; border-radius: 21px; } .hero-search { flex-direction: column; margin-top: 28px; } .hero-search button { width: 100%; } .section-heading { align-items: start; flex-direction: column; } .state-panel { align-items: start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .card-skeleton { animation: none; } }
</style>
