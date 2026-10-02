<template>
  <div class="home-page">
    <section v-if="alertItems.length" class="urgent-ribbon" role="alert" aria-label="当前告警">
      <span class="urgent-label">重要告警</span>
      <strong>{{ alertItems[0].title }}</strong>
      <router-link :to="`/explore/life/${alertItems[0].id}`">查看详情 <span aria-hidden="true">↗</span></router-link>
    </section>

    <section class="welcome" aria-labelledby="welcome-title">
      <div class="welcome-overline"><span>团队的项目、讨论与日常</span><span>一个可以接着聊的地方</span></div>
      <div class="welcome-main">
        <div><h1 id="welcome-title">今天，大家在做什么？</h1><p>看看正在推进的项目，接上一个讨论，也把自己的发现留在这里。</p></div>
        <div class="welcome-actions"><router-link to="/community?compose=1">发起讨论 <span aria-hidden="true">↗</span></router-link><router-link to="/project-studio">分享项目 <span aria-hidden="true">↗</span></router-link></div>
      </div>
    </section>

    <div class="lead-grid">
      <section class="feature-story" aria-labelledby="feature-title">
        <div class="lead-label"><span>本期阅读</span><router-link :to="{ path: '/explore', query: { type: 'article' } }">全部文章 ↗</router-link></div>
        <router-link v-if="featuredArticle" class="feature-link" :to="`/explore/article/${featuredArticle.id}`">
          <div class="feature-image"><img v-if="featuredArticle.coverImage && !featureCoverFailed" :src="featuredArticle.coverImage" alt="" @error="featureCoverFailed = true" /><span v-else>{{ featuredArticle.category || '阅读' }}</span></div>
          <div class="feature-copy"><span class="story-category">{{ featuredArticle.category || '团队文章' }}</span><h2 id="feature-title">{{ featuredArticle.title }}</h2><p>{{ featuredArticle.excerpt || featuredArticle.desc || '打开文章，看看完整内容。' }}</p><div class="story-foot"><span>{{ featuredArticle.author || '团队分享' }} <i>·</i> {{ featuredArticle.date || '近期' }}</span><span>阅读文章 ↗</span></div></div>
        </router-link>
        <div v-else-if="groups.article.loading" class="feature-state">正在整理团队的最新文章…</div>
        <div v-else-if="groups.article.error" class="feature-state" role="alert">文章暂时无法加载。<button type="button" @click="loadGroup('article')">重试 ↗</button></div>
        <div v-else class="feature-state"><strong id="feature-title">经验，值得留下来。</strong><router-link :to="{ path: '/explore', query: { type: 'article' } }">去看看文章 ↗</router-link></div>
      </section>

      <section class="forum-entry" aria-labelledby="forum-entry-title">
        <div class="lead-label"><span>去论坛坐坐</span><router-link to="/community">全部讨论 ↗</router-link></div>
        <h2 id="forum-entry-title">你想聊什么？</h2>
        <p>项目进展、技术难题，或者工作之外的一句话。</p>
        <nav class="forum-entry-list" aria-label="论坛板块">
          <router-link v-for="board in displayBoards.slice(0, 3)" :key="board.code" :to="`/community/boards/${board.code}`"><span class="board-marker" :class="board.code" aria-hidden="true" /><span><strong>{{ board.name }}</strong><small>{{ board.description }}</small></span><span aria-hidden="true">↗</span></router-link>
        </nav>
        <router-link class="forum-entry-compose" to="/community?compose=1">写下第一个话题 <span aria-hidden="true">↗</span></router-link>
      </section>
    </div>

    <div v-if="groups.life.error" class="notice-ticker notice-ticker-error" role="alert">
      <span class="ticker-label">团队消息</span><span>消息暂时无法加载。</span><button type="button" @click="loadGroup('life')">重试 ↗</button>
    </div>
    <div v-else-if="noticeItems.length" class="notice-ticker">
      <span class="ticker-label">团队快讯</span>
      <span class="ticker-type">{{ noticeItems[0].type }}</span>
      <router-link :to="`/explore/life/${noticeItems[0].id}`">{{ noticeItems[0].title }}</router-link>
      <router-link class="ticker-more" :to="{ path: '/explore', query: { type: 'life' } }">更多消息 ↗</router-link>
    </div>

    <div class="activity-grid">
      <section class="discussion-section" aria-labelledby="discussion-title">
        <header class="section-heading">
          <div><span class="section-kicker">一起讨论 / COMMUNITY</span><h2 id="discussion-title">{{ groups.topic.records.length ? '此刻在聊' : '从这里开聊' }}</h2></div>
          <router-link to="/community">去社区 <span aria-hidden="true">↗</span></router-link>
        </header>
        <div v-if="groups.topic.loading" class="placeholder-stack"><div v-for="index in 3" :key="index" class="row-skeleton" /></div>
        <div v-else-if="groups.topic.error" class="simple-state" role="alert">讨论暂时无法加载。<button type="button" @click="loadGroup('topic')">重试</button></div>
        <div v-else-if="groups.topic.records.length" class="topic-stack"><TopicRow v-for="item in groups.topic.records.slice(0, 4)" :key="item.id" :topic="item" /></div>
        <div v-else class="conversation-invite">
          <p>还没有新的讨论。你想到的那个问题，或许也正困扰着别人。</p>
          <div class="starter-grid">
            <router-link to="/community/boards/tech-talk?compose=1"><small>技术交流</small><strong>最近遇到什么难题？</strong><span>一起拆解 ↗</span></router-link>
            <router-link to="/community/boards/project-share?compose=1"><small>项目分享</small><strong>哪件进展值得讲讲？</strong><span>分享进展 ↗</span></router-link>
          </div>
        </div>
      </section>

      <aside class="bulletin" aria-labelledby="bulletin-title">
        <div class="bulletin-top"><span>TEAM NOTES</span><span aria-hidden="true">✳</span></div>
        <h2 id="bulletin-title">公告栏</h2>
        <p>需要知道的事，放在容易找到的地方。</p>
        <div v-if="groups.life.loading" class="bulletin-empty">正在加载团队消息…</div>
        <div v-else-if="groups.life.error" class="bulletin-empty">团队消息暂时无法加载。</div>
        <div v-else-if="noticeItems.length" class="bulletin-list">
          <router-link v-for="item in noticeItems.slice(0, 3)" :key="item.id" :to="`/explore/life/${item.id}`">
            <small>{{ item.type || '公告' }}</small><strong>{{ item.title }}</strong><span aria-hidden="true">↗</span>
          </router-link>
        </div>
        <div v-else class="bulletin-empty">暂无已发布通知。</div>
        <div class="bulletin-footer">
          <span class="status-dot" :class="{ loading: groups.life.loading || groups.life.error }" />
          <span>{{ groups.life.loading ? '正在检查告警' : groups.life.error ? '告警信息暂不可用' : '暂无已发布告警' }}</span>
          <router-link :to="{ path: '/explore', query: { type: 'life' } }">全部消息 ↗</router-link>
        </div>
      </aside>
    </div>

    <section class="project-section" aria-labelledby="project-title">
      <div class="project-intro"><span class="section-kicker">正在发生 / PROJECTS</span><h2 id="project-title">让项目被看见。</h2><p>从一个链接、一段介绍开始，找到愿意一起讨论和推进的人。</p><router-link to="/project-studio">分享我的项目 <span aria-hidden="true">↗</span></router-link></div>
      <div class="project-content">
        <div class="project-content-head"><span>项目索引</span><router-link :to="{ path: '/explore', query: { type: 'project' } }">浏览全部 ↗</router-link></div>
        <div v-if="groups.project.loading" class="placeholder-stack"><div v-for="index in 3" :key="index" class="row-skeleton" /></div>
        <div v-else-if="groups.project.error" class="project-empty" role="alert">项目暂时无法加载。<button type="button" @click="loadGroup('project')">重试</button></div>
        <div v-else-if="groups.project.records.length" class="project-list"><router-link v-for="(item, index) in groups.project.records.slice(0, 4)" :key="item.id" :to="`/project/${item.id}`"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ item.projectName }}</strong><span aria-hidden="true">↗</span></router-link></div>
        <div v-else class="project-empty"><strong>这里还等着第一个项目。</strong><span>把你的项目放上来，让更多人发现它。</span></div>
      </div>
    </section>

    <section class="reading-section" aria-labelledby="reading-title">
      <header class="section-heading"><div><span class="section-kicker">经验沉淀 / STORIES</span><h2 id="reading-title">继续阅读</h2></div><router-link :to="{ path: '/explore', query: { type: 'article' } }">所有文章 ↗</router-link></header>
      <div v-if="groups.article.loading" class="reading-grid"><div v-for="index in 2" :key="index" class="reading-placeholder" /></div>
      <div v-else-if="groups.article.error" class="simple-state" role="alert">文章暂时无法加载。<button type="button" @click="loadGroup('article')">重试</button></div>
      <div v-else-if="moreArticles.length" class="reading-grid">
        <router-link v-for="item in moreArticles" :key="item.id" class="reading-story" :to="`/explore/article/${item.id}`">
          <div class="reading-image"><img v-if="item.coverImage" :src="item.coverImage" alt="" loading="lazy" /><span v-else>{{ item.category || '文章' }}</span></div>
          <div class="reading-copy"><small>{{ item.category || '团队文章' }} <span>·</span> {{ item.author || '团队分享' }}</small><strong>{{ item.title }}</strong><p>{{ item.excerpt || item.desc || '阅读完整文章' }}</p><span class="reading-link">阅读文章 ↗</span></div>
        </router-link>
      </div>
      <div v-else class="simple-state">更多文章正在路上。</div>
    </section>

    <div class="bottom-grid">
      <section class="tool-section" aria-labelledby="tool-title">
        <header class="section-heading"><div><span class="section-kicker">工具箱 / TOOLS</span><h2 id="tool-title">顺手的工具</h2></div><router-link :to="{ path: '/explore', query: { type: 'ai' } }">全部工具 ↗</router-link></header>
        <div v-if="groups.ai.loading" class="simple-state">正在加载工具…</div>
        <div v-else-if="groups.ai.error" class="simple-state" role="alert">工具暂时无法加载。<button type="button" @click="loadGroup('ai')">重试</button></div>
        <div v-else-if="groups.ai.records.length" class="tool-list"><router-link v-for="item in groups.ai.records.slice(0, 3)" :key="item.id" :to="`/explore/ai/${item.id}`"><span>{{ item.type || '工具' }}</span><strong>{{ item.name || item.title }}</strong><small>{{ item.desc || item.excerpt || '查看工具介绍' }}</small><span aria-hidden="true">↗</span></router-link></div>
        <div v-else class="simple-state">暂无工具内容。</div>
      </section>
      <section class="team-section" aria-labelledby="team-title">
        <header class="section-heading"><div><span class="section-kicker">团队日常 / PEOPLE</span><h2 id="team-title">工作之外</h2></div><router-link :to="{ path: '/explore', query: { type: 'life' } }">全部内容 ↗</router-link></header>
        <div v-if="groups.life.loading" class="simple-state">正在加载团队动态…</div>
        <div v-else-if="groups.life.error" class="simple-state" role="alert">团队动态暂时无法加载。<button type="button" @click="loadGroup('life')">重试</button></div>
        <div v-else-if="lifeMoments.length" class="moment-list"><router-link v-for="item in lifeMoments.slice(0, 3)" :key="item.id" :to="`/explore/life/${item.id}`"><span>{{ item.type || '动态' }}</span><strong>{{ item.title }}</strong><span aria-hidden="true">↗</span></router-link></div>
        <div v-else class="simple-state">暂无团队动态。</div>
      </section>
    </div>

    <section v-if="recentItems.length" class="recent-section">
      <header class="section-heading"><div><span class="section-kicker">你的足迹 / RECENT</span><h2>继续浏览</h2></div></header>
      <div class="recent-grid"><router-link v-for="item in recentItems" :key="`${item.kind}-${item.targetId}`" :to="recentPath(item)"><small>{{ kindLabel(item.kind) }}</small><strong>{{ item.title }}</strong><span>继续浏览 ↗</span></router-link></div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import TopicRow from '@/components/TopicRow.vue'
import { getRecentViews } from '@/api/content'
import { listBoards } from '@/api/community'
import { fallbackBoards } from '@/utils/communityBoards'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'
import { getClientId } from '@/utils/clientId'

const quickLinks = [
  { type: 'project', label: '项目' }, { type: 'article', label: '文章' },
  { type: 'ai', label: 'AI 资产' }, { type: 'life', label: '团队内容' }
]
const emptyGroup = () => ({ records: [], total: 0, loading: true, error: null })
const groups = reactive({ project: emptyGroup(), topic: emptyGroup(), article: emptyGroup(), ai: emptyGroup(), life: emptyGroup() })
const recentItems = ref([])
const boards = ref([])
const displayBoards = computed(() => boards.value.length ? boards.value : fallbackBoards)
const featuredArticle = computed(() => groups.article.records[0] || null)
const featureCoverFailed = ref(false)
const moreArticles = computed(() => groups.article.records.slice(1, 3))
const lifeRecords = computed(() => groups.life.records)
const alertItems = computed(() => lifeRecords.value.filter((item) => item.type?.trim() === '告警'))
const noticeItems = computed(() => lifeRecords.value.filter((item) => ['公告', '提醒'].includes(item.type?.trim())))
const lifeMoments = computed(() => lifeRecords.value.filter((item) => !['告警', '公告', '提醒'].includes(item.type?.trim())))
const kindLabel = (kind) => quickLinks.find((item) => item.type === kind)?.label || '资源'
const recentPath = (item) => item.kind === 'project' ? `/project/${item.targetId}` : `/explore/${item.kind}/${item.targetId}`

async function loadGroup(kind) {
  groups[kind] = { ...emptyGroup(), loading: true }
  try {
    const size = { project: 6, topic: 5, article: 3, ai: 3, life: 200 }[kind] || 4
    const result = await fetchDiscoveryGroup(kind, { size })
    groups[kind] = { ...result, loading: false, error: null }
  } catch (error) {
    console.warn(`加载${kind}失败`, error)
    groups[kind] = { records: [], total: 0, loading: false, error }
  }
}

async function loadBoards() {
  try {
    const result = await listBoards()
    boards.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.warn('加载社区板块失败', error)
    boards.value = []
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
  for (const kind of ['project', 'topic', 'article', 'ai', 'life']) loadGroup(kind)
  loadBoards()
  loadRecent()
})
</script>

<style scoped>
.home-page { max-width: 1440px; margin: 0 auto; display: grid; gap: 0; padding-bottom: 80px; }
.urgent-ribbon { display: flex; align-items: center; gap: 20px; min-height: 54px; margin-bottom: 20px; padding: 11px 20px; background: #7e2f31; color: #fff; }
.urgent-label { flex-shrink: 0; border-right: 1px solid #ffffff70; padding-right: 18px; font-size: 12px; font-weight: 800; letter-spacing: .08em; }
.urgent-ribbon strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.urgent-ribbon a { flex-shrink: 0; margin-left: auto; font-size: 12px; font-weight: 700; }
.welcome { border-top: 1px solid var(--portal-text); padding: 18px 0 39px; }
.welcome-overline { display: flex; justify-content: space-between; gap: 16px; color: var(--portal-text-soft); font-size: 11px; letter-spacing: .08em; }
.welcome-overline span:first-child { color: var(--portal-accent); font-weight: 700; }
.welcome-main { display: flex; justify-content: space-between; align-items: end; gap: 28px; padding-top: 41px; }
.welcome h1 { margin: 0; color: var(--portal-text); font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(37px, 4vw, 61px); font-weight: 650; letter-spacing: -.06em; line-height: 1.22; }
.welcome p { margin: 16px 0 0; color: var(--portal-text-soft); font-size: 14px; line-height: 1.8; }
.welcome-actions { display: flex; flex-shrink: 0; gap: 20px; padding-bottom: 4px; }
.welcome-actions a { border-bottom: 1px solid var(--portal-text); padding-bottom: 7px; color: var(--portal-text); font-size: 13px; font-weight: 660; white-space: nowrap; }
.welcome-actions a:first-child { border-color: var(--portal-accent); color: var(--portal-accent); }
.welcome-actions span { margin-left: 14px; }
.lead-grid { display: grid; grid-template-columns: minmax(0, 1.78fr) minmax(290px, .82fr); gap: clamp(24px, 3vw, 46px); border-top: 1px solid var(--portal-line); padding-top: 21px; }
.feature-story, .forum-entry { min-width: 0; }
.lead-label { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 17px; color: var(--portal-accent); font-size: 11px; font-weight: 750; letter-spacing: .08em; }
.lead-label a { color: var(--portal-text-soft); font-weight: 500; letter-spacing: 0; }
.lead-label a:hover { color: var(--portal-accent); }
.feature-link { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); min-height: 345px; border-top: 1px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); }
.feature-image { min-width: 0; min-height: 345px; overflow: hidden; background: #e5e4de; }
.feature-image img { display: block; width: 100%; height: 100%; object-fit: cover; filter: saturate(.72); transition: transform .3s ease; }
.feature-link:hover .feature-image img { transform: scale(1.025); }
.feature-image > span { display: flex; align-items: end; width: 100%; height: 100%; padding: 25px; color: #6d706a; font-family: 'Songti SC', 'SimSun', serif; font-size: 38px; }
.feature-copy { display: flex; flex-direction: column; min-width: 0; padding: 27px clamp(20px, 2.8vw, 42px) 19px; }
.story-category { color: var(--portal-accent); font-size: 11px; font-weight: 750; letter-spacing: .09em; }
.feature-copy h2 { margin: 24px 0 13px; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(26px, 2.65vw, 39px); font-weight: 650; letter-spacing: -.035em; line-height: 1.36; }
.feature-copy p { display: -webkit-box; overflow: hidden; margin: 0; color: var(--portal-text-soft); font-size: 13px; line-height: 1.8; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.story-foot { display: flex; justify-content: space-between; gap: 14px; margin-top: auto; border-top: 1px solid var(--portal-line); padding-top: 17px; color: var(--portal-text-soft); font-size: 11px; }
.story-foot i { padding: 0 3px; font-style: normal; }
.story-foot span:last-child { color: var(--portal-accent); white-space: nowrap; }
.feature-state { display: flex; flex-direction: column; justify-content: center; gap: 18px; min-height: 345px; border-top: 1px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); color: var(--portal-text-soft); font-size: 13px; }
.feature-state strong { color: var(--portal-text); font-family: 'Songti SC', 'SimSun', serif; font-size: 32px; }
.feature-state a, .feature-state button { width: fit-content; border: 0; padding: 0; color: var(--portal-accent); background: none; font: inherit; cursor: pointer; }
.forum-entry { display: flex; flex-direction: column; border-top: 1px solid var(--portal-text); padding-top: 14px; }
.forum-entry .lead-label { margin-bottom: 28px; }
.forum-entry h2 { margin: 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(29px, 2.5vw, 39px); font-weight: 650; letter-spacing: -.04em; }
.forum-entry > p { margin: 9px 0 20px; color: var(--portal-text-soft); font-size: 12px; line-height: 1.7; }
.forum-entry-list { display: grid; border-top: 1px solid var(--portal-line); }
.forum-entry-list a { display: grid; grid-template-columns: 6px minmax(0, 1fr) auto; align-items: center; gap: 14px; min-height: 70px; border-bottom: 1px solid var(--portal-line); }
.forum-entry-list a:hover strong { color: var(--portal-accent); }
.board-marker { width: 6px; height: 22px; background: var(--portal-accent); }
.board-marker.tech-talk { background: #44738a; }
.board-marker.lounge { background: #698469; }
.forum-entry-list a > span:nth-child(2) { display: grid; gap: 3px; }
.forum-entry-list strong { font-size: 15px; font-weight: 660; }
.forum-entry-list small { color: var(--portal-text-soft); font-size: 11px; }
.forum-entry-list a > span:last-child { color: var(--portal-accent); }
.forum-entry-compose { display: flex; justify-content: space-between; margin-top: auto; padding-top: 14px; color: var(--portal-accent); font-size: 12px; font-weight: 700; }
.notice-ticker { display: flex; align-items: center; gap: 14px; min-height: 60px; border-bottom: 1px solid var(--portal-line); padding: 12px 1px; font-size: 13px; }
.ticker-label { flex-shrink: 0; color: var(--portal-accent); font-weight: 800; letter-spacing: .06em; }
.ticker-type { flex-shrink: 0; border: 1px solid #c4ac88; padding: 3px 7px; color: #805e35; font-size: 11px; }
.notice-ticker > a:not(.ticker-more) { overflow: hidden; font-weight: 620; text-overflow: ellipsis; white-space: nowrap; }
.notice-ticker > a:hover { text-decoration: underline; text-underline-offset: 3px; }
.ticker-more, .notice-ticker button { flex-shrink: 0; margin-left: auto; color: var(--portal-accent); font-size: 12px; }
.notice-ticker button { border: 0; background: none; cursor: pointer; }
.activity-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(290px, .85fr); gap: clamp(28px, 4vw, 60px); padding: 66px 0 72px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 18px; margin-bottom: 25px; }
.section-kicker { color: var(--portal-accent); font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.section-heading h2 { margin: 7px 0 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(28px, 2.8vw, 38px); font-weight: 730; letter-spacing: -.035em; }
.section-heading > a { flex-shrink: 0; color: var(--portal-accent); font-size: 13px; font-weight: 650; }
.topic-stack { border-top: 2px solid var(--portal-text); }
.topic-stack :deep(.topic-row) { padding-left: 0; padding-right: 0; background: transparent; }
.conversation-invite { border-top: 1px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 22px 0 0; }
.conversation-invite > p { margin: 0 0 22px; color: var(--portal-text-soft); font-size: 13px; line-height: 1.7; }
.starter-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--portal-line); }
.starter-grid a { display: flex; flex-direction: column; align-items: start; min-height: 150px; padding: 18px 23px 16px 0; }
.starter-grid a + a { border-left: 1px solid var(--portal-line); padding-left: 23px; }
.starter-grid small { color: var(--portal-accent); font-size: 11px; font-weight: 720; }
.starter-grid strong { margin: 16px 0; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: 23px; font-weight: 630; }
.starter-grid span { margin-top: auto; color: var(--portal-accent); font-size: 11px; }
.starter-grid a:hover strong { color: var(--portal-accent); }
.bulletin { align-self: start; min-width: 0; padding: 26px 28px 22px; background: #f5f2eb; }
.bulletin-top { display: flex; justify-content: space-between; color: #8a6841; font-size: 11px; font-weight: 750; letter-spacing: .12em; }
.bulletin-top span:last-child { font-size: 22px; line-height: .7; }
.bulletin h2 { margin: 27px 0 6px; font-family: inherit; font-size: 28px; }
.bulletin > p { margin: 0 0 20px; color: #667078; font-size: 12px; }
.bulletin-list { border-top: 1px solid #ddd7cb; }
.bulletin-list a { display: grid; grid-template-columns: 1fr auto; gap: 6px; border-bottom: 1px solid #ddd7cb; padding: 16px 0; }
.bulletin-list small { grid-column: 1 / -1; color: #8a6841; font-size: 11px; font-weight: 750; }
.bulletin-list strong { font-size: 14px; font-weight: 670; line-height: 1.5; }
.bulletin-list a > span { color: #8a6841; }
.bulletin-list a:hover strong { text-decoration: underline; text-underline-offset: 3px; }
.bulletin-empty { border-top: 1px solid #ddd7cb; padding: 20px 0; color: #667078; font-size: 12px; }
.bulletin-footer { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 11px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #567b65; }
.status-dot.loading { background: #a96a46; }
.bulletin-footer > a { margin-left: auto; color: #8a6841; font-weight: 700; }
.project-section { display: grid; grid-template-columns: minmax(0, .72fr) minmax(0, 1.28fr); gap: clamp(30px, 5vw, 80px); border-top: 1px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 34px 0 42px; }
.project-intro { display: flex; flex-direction: column; align-items: start; }
.project-intro h2 { margin: 24px 0 12px; font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: clamp(28px, 2.8vw, 39px); font-weight: 650; letter-spacing: -.035em; }
.project-intro p { max-width: 27em; margin: 0 0 28px; color: var(--portal-text-soft); font-size: 13px; line-height: 1.8; }
.project-intro > a { margin-top: auto; border-bottom: 1px solid var(--portal-accent); padding-bottom: 6px; color: var(--portal-accent); font-size: 13px; font-weight: 700; }
.project-content { min-width: 0; }
.project-content-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 15px; font-size: 12px; font-weight: 700; }
.project-content-head a { color: var(--portal-accent); }
.project-list { border-top: 1px solid var(--portal-line); }
.project-list a { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 12px; align-items: center; min-height: 58px; border-bottom: 1px solid var(--portal-line); }
.project-list a span { color: var(--portal-accent); font-size: 11px; }
.project-list a strong { overflow: hidden; font-size: 15px; font-weight: 640; text-overflow: ellipsis; white-space: nowrap; }
.project-empty { display: grid; align-content: center; gap: 8px; min-height: 155px; border-top: 1px solid var(--portal-line); color: var(--portal-text-soft); font-size: 13px; }
.project-empty strong { color: var(--portal-text); font-size: 18px; }
.project-empty button { width: fit-content; border: 0; padding: 0; background: none; color: var(--portal-accent); cursor: pointer; }
.reading-section { padding: 76px 0 72px; }
.reading-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; }
.reading-story { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); min-height: 230px; border-top: 1px solid var(--portal-line); border-bottom: 1px solid var(--portal-line); }
.reading-image { min-height: 230px; overflow: hidden; background: #dbe3e7; }
.reading-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.reading-story:hover img { transform: scale(1.035); }
.reading-image > span { display: block; padding: 20px; color: #31596c; font-size: 13px; }
.reading-copy { display: flex; flex-direction: column; align-items: start; gap: 10px; padding: 21px; }
.reading-copy small { color: var(--portal-accent); font-size: 11px; font-weight: 700; }
.reading-copy small span { margin: 0 4px; }
.reading-copy strong { font-size: clamp(18px, 1.6vw, 24px); font-weight: 700; line-height: 1.4; }
.reading-copy p { display: -webkit-box; overflow: hidden; margin: 0; color: var(--portal-text-soft); font-size: 12px; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.reading-link { margin-top: auto; color: var(--portal-accent); font-size: 12px; font-weight: 700; }
.reading-placeholder { height: 230px; background: var(--portal-bg-soft); }
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 4vw, 60px); }
.tool-list, .moment-list { border-top: 2px solid var(--portal-text); }
.tool-list a { display: grid; grid-template-columns: 60px minmax(0, .9fr) minmax(0, 1.2fr) auto; gap: 12px; align-items: center; min-height: 67px; border-bottom: 1px solid var(--portal-line); }
.tool-list a > span:first-child, .moment-list a > span:first-child { color: var(--portal-accent); font-size: 11px; font-weight: 700; }
.tool-list strong, .moment-list strong { overflow: hidden; font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.tool-list small { overflow: hidden; color: var(--portal-text-soft); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.tool-list a > span:last-child, .moment-list a > span:last-child { color: var(--portal-accent); }
.moment-list a { display: grid; grid-template-columns: 60px minmax(0, 1fr) auto; gap: 12px; align-items: center; min-height: 67px; border-bottom: 1px solid var(--portal-line); }
.recent-section { padding-top: 76px; }
.recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr)); gap: 12px; }
.recent-grid a { display: grid; gap: 10px; min-height: 110px; border-top: 2px solid var(--portal-text); padding: 12px 0; }
.recent-grid small { color: var(--portal-text-soft); font-size: 11px; }
.recent-grid strong { font-size: 15px; }
.recent-grid span { align-self: end; color: var(--portal-accent); font-size: 11px; }
.placeholder-stack { border-top: 2px solid currentColor; }
.row-skeleton { height: 55px; border-bottom: 1px solid currentColor; opacity: .2; }
.simple-state { display: flex; align-items: center; gap: 9px; min-height: 90px; border-top: 2px solid var(--portal-text); color: var(--portal-text-soft); font-size: 13px; }
.simple-state button { border: 0; background: none; color: var(--portal-accent); font: inherit; cursor: pointer; }
@media (max-width: 1100px) { .lead-grid { grid-template-columns: minmax(0, 1.35fr) minmax(280px, .85fr); } .feature-link { grid-template-columns: 1fr; } .feature-image { min-height: 220px; height: 220px; } .feature-copy { min-height: 270px; } .activity-grid { grid-template-columns: 1fr; } .reading-story { grid-template-columns: 1fr; } .reading-image { height: 190px; min-height: 190px; } }
@media (max-width: 760px) { .welcome-main { align-items: start; flex-direction: column; padding-top: 30px; } .welcome-overline span:last-child { display: none; } .lead-grid, .project-section, .reading-grid, .bottom-grid { grid-template-columns: 1fr; } .forum-entry { min-height: 330px; } .activity-grid { padding: 48px 0; } .reading-section { padding: 52px 0; } .reading-story { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); } .reading-image { height: auto; min-height: 210px; } .bottom-grid { gap: 48px; } }
@media (max-width: 520px) { .welcome { padding-bottom: 27px; } .welcome h1 { font-size: 37px; } .welcome-actions { gap: 16px; } .feature-copy { min-height: 265px; padding: 21px 8px; } .feature-copy h2 { margin-top: 14px; } .forum-entry { min-height: 0; } .starter-grid { grid-template-columns: 1fr; } .starter-grid a + a { border-top: 1px solid var(--portal-line); border-left: 0; padding-left: 0; } .forum-entry-compose { margin-top: 6px; } .notice-ticker { gap: 8px; } .ticker-more { display: none; } .reading-story { grid-template-columns: 1fr; } .reading-image { height: 210px; min-height: 210px; } .reading-copy { padding: 18px 0 22px; } .tool-list a { grid-template-columns: 54px minmax(0, 1fr) auto; } .tool-list small { display: none; } .bulletin { padding: 24px; } .urgent-ribbon { gap: 10px; } .urgent-label { padding-right: 10px; } }
@media (prefers-reduced-motion: reduce) { .reading-image img { transition: none; } }
</style>
