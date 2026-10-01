<template>
  <div class="home-page">
    <div class="page-intro"><h1 id="home-title">大家的项目与讨论</h1><router-link to="/community">去社区发帖 <span aria-hidden="true">↗</span></router-link></div>

    <nav class="board-directory" aria-label="交流板块">
      <span class="directory-label">交流板块</span>
      <router-link to="/community/boards/project-share"><strong>项目分享</strong><small>展示进展，交换想法</small></router-link>
      <router-link to="/community/boards/tech-talk"><strong>技术交流</strong><small>聊问题和解决办法</small></router-link>
      <router-link to="/community/boards/lounge"><strong>闲聊</strong><small>工作之外也聊聊</small></router-link>
    </nav>

    <div class="front-page">
      <section class="home-section discussion-section">
        <header class="section-heading">
          <div><span class="section-index">社区</span><h2>最新讨论</h2></div>
          <router-link to="/community">进入社区 <span aria-hidden="true">↗</span></router-link>
        </header>
        <div v-if="groups.topic.loading" class="topic-stack"><div v-for="index in 3" :key="index" class="row-skeleton" /></div>
        <div v-else-if="groups.topic.error" class="state-panel" role="alert"><p>讨论暂时无法加载。</p><button type="button" @click="loadGroup('topic')">重试</button></div>
        <div v-else-if="groups.topic.records.length" class="topic-stack"><TopicRow v-for="item in groups.topic.records" :key="item.id" :topic="item" /></div>
        <div v-else class="state-panel">还没有讨论。<router-link to="/community">去发个主题 ↗</router-link></div>
      </section>

      <aside class="home-section project-section" aria-label="项目导航">
        <header class="section-heading">
          <div><span class="section-index">项目</span><h2>项目索引</h2></div>
          <router-link :to="{ path: '/explore', query: { type: 'project' } }">全部项目 <span aria-hidden="true">↗</span></router-link>
        </header>
        <div class="project-index">
          <template v-if="groups.project.loading"><div v-for="index in 4" :key="index" class="row-skeleton" aria-hidden="true" /></template>
          <div v-else-if="groups.project.error" class="state-panel" role="alert"><p>项目列表暂时无法加载。</p><button type="button" @click="loadGroup('project')">重试</button></div>
          <div v-else-if="!groups.project.records.length" class="state-panel">暂无项目。</div>
          <router-link v-for="item in groups.project.records.slice(0, 5)" :key="item.id" class="project-row" :to="`/project/${item.id}`">
            <strong>{{ item.projectName }}</strong><span aria-hidden="true">↗</span>
          </router-link>
        </div>
        <div class="project-actions">
          <router-link to="/project-studio">管理我的项目 <span aria-hidden="true">↗</span></router-link>
          <router-link :to="{ path: '/explore', query: { type: 'project' } }">查找更多项目 <span aria-hidden="true">↗</span></router-link>
        </div>
      </aside>
    </div>

    <div class="resource-columns">
      <section v-for="section in sections" :key="section.kind" class="home-section">
        <header class="section-heading">
          <div>
            <span class="section-index">{{ section.kicker }}</span>
            <h2>{{ section.title }}</h2>
          </div>
          <router-link :to="{ path: '/explore', query: { type: section.kind } }">查看全部 <span aria-hidden="true">↗</span></router-link>
        </header>

        <div v-if="groups[section.kind].loading" class="card-grid" aria-live="polite">
          <div v-for="index in 2" :key="index" class="card-skeleton" aria-hidden="true" />
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
    </div>

    <section v-if="recentItems.length" class="recent-section">
      <div class="section-heading">
        <div>
          <span class="section-index">最近浏览</span>
          <h2>继续浏览</h2>
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
import DiscoveryCard from '@/components/DiscoveryCard.vue'
import TopicRow from '@/components/TopicRow.vue'
import { getRecentViews } from '@/api/content'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'
import { getClientId } from '@/utils/clientId'

const quickLinks = [
  { type: 'project', label: '项目' },
  { type: 'topic', label: '讨论' },
  { type: 'article', label: '文章' },
  { type: 'ai', label: 'AI 资产' },
  { type: 'life', label: '团队内容' }
]
const sections = [
  { kind: 'article', kicker: '文章', title: '推荐文章' },
  { kind: 'ai', kicker: '工具', title: 'AI 能力' },
  { kind: 'life', kicker: '团队', title: '团队内容' }
]
const emptyGroup = () => ({ records: [], total: 0, loading: true, error: null })
const groups = reactive({
  project: emptyGroup(), topic: emptyGroup(), article: emptyGroup(), ai: emptyGroup(), life: emptyGroup()
})
const recentItems = ref([])

const kindLabel = (kind) => quickLinks.find((item) => item.type === kind)?.label || '资源'
const recentPath = (item) => item.kind === 'project'
  ? `/project/${item.targetId}`
  : `/explore/${item.kind}/${item.targetId}`

async function loadGroup(kind) {
  groups[kind] = { ...emptyGroup(), loading: true }
  try {
    const result = await fetchDiscoveryGroup(kind, { size: kind === 'project' ? 6 : kind === 'topic' ? 5 : 3 })
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
  loadGroup('project')
  loadGroup('topic')
  loadRecent()
})
</script>

<style scoped>
.home-page { max-width: 1360px; margin: 0 auto; display: grid; gap: 20px; padding-bottom: 56px; }
.page-intro { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 2px 0 13px; border-bottom: 1px solid var(--portal-line); }
.page-intro h1 { margin: 0; font-family: inherit; font-size: clamp(25px, 2.8vw, 32px); font-weight: 750; line-height: 1.25; }
.page-intro a { flex-shrink: 0; color: var(--portal-accent); font-size: 13px; }
.section-index { color: var(--portal-accent); font-size: 12px; font-weight: 700; }
.board-directory { display: grid; grid-template-columns: 110px repeat(3, minmax(0, 1fr)); align-items: stretch; overflow: hidden; border: 1px solid var(--portal-line); border-radius: 8px; background: var(--portal-surface); }
.directory-label { display: flex; align-items: center; padding: 14px 16px; color: var(--portal-accent); font-size: 13px; font-weight: 700; }
.board-directory a { display: grid; align-content: center; gap: 4px; min-width: 0; padding: 13px 17px; border-left: 1px solid var(--portal-line); }
.board-directory a:hover { background: var(--portal-bg-soft); }
.board-directory a strong { font-size: 15px; }
.board-directory a small { overflow: hidden; color: var(--portal-text-soft); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.front-page { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(290px, .85fr); gap: 28px; }
.home-section, .recent-section { min-width: 0; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 15px; min-height: 52px; margin-bottom: 8px; padding-top: 7px; border-top: 1px solid var(--portal-line); }
.section-heading h2 { margin: 3px 0 0; font-family: inherit; font-size: 21px; font-weight: 700; line-height: 1.2; }
.section-heading > a { flex-shrink: 0; padding-bottom: 4px; color: var(--portal-accent); font-size: 13px; }
.topic-stack { display: grid; border-top: 1px solid var(--portal-line); }
.discussion-section .topic-stack :deep(.topic-row) { padding-left: 0; padding-right: 0; background: transparent; }
.project-index { display: grid; border-top: 1px solid var(--portal-line); }
.project-row { display: flex; justify-content: space-between; gap: 12px; padding: 15px 0; border-bottom: 1px solid var(--portal-line); }
.project-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 600; }
.project-row span { color: var(--portal-accent); }
.project-actions { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 5px 14px; margin-top: 5px; }
.project-actions a { padding: 10px 0; color: var(--portal-accent-2); font-size: 13px; }
.resource-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.resource-columns .section-heading { align-items: start; }
.resource-columns .section-heading h2 { font-size: 19px; }
.card-grid { display: grid; gap: 10px; }
.row-skeleton { height: 52px; border-bottom: 1px solid var(--portal-line); background: var(--portal-surface-strong); }
.card-skeleton { min-height: 180px; border: 1px solid var(--portal-line); background: var(--portal-surface-strong); }
.state-panel { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; min-height: 66px; padding: 12px 0; border-top: 1px solid var(--portal-line); border-bottom: 1px solid var(--portal-line); color: var(--portal-text-soft); font-size: 13px; }
.state-panel p { margin: 0; }
.state-panel a, .state-panel button { border: 0; padding: 0; color: var(--portal-accent); background: transparent; font: inherit; cursor: pointer; }
.recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.recent-grid a { display: grid; gap: 9px; padding: 20px; border: 1px solid var(--portal-line); background: var(--portal-surface); }
.recent-grid a:hover { border-color: var(--portal-accent); }
.recent-grid span, .recent-grid small { color: var(--portal-text-soft); }
.recent-grid strong { font-size: 16px; }
.recent-grid small { display: flex; justify-content: space-between; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 1050px) { .front-page { grid-template-columns: 1fr; } .resource-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .page-intro { align-items: center; } .page-intro h1 { font-size: 25px; } .board-directory { grid-template-columns: 1fr; } .directory-label { padding-bottom: 6px; } .board-directory a { border-top: 1px solid var(--portal-line); border-left: 0; } .resource-columns { grid-template-columns: 1fr; } }
</style>
