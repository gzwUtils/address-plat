<template>
  <div class="home-page">
    <section v-if="alertItems.length" class="urgent-ribbon" role="alert" aria-label="当前告警">
      <span class="urgent-label">重要告警</span>
      <strong>{{ alertItems[0].title }}</strong>
      <router-link :to="`/explore/life/${alertItems[0].id}`">查看详情 <span aria-hidden="true">↗</span></router-link>
    </section>

    <section class="cover" aria-labelledby="cover-title">
      <div class="cover-copy">
        <span class="cover-kicker">团队门户 <span aria-hidden="true">/</span> 一起把想法落地</span>
        <h1 id="cover-title">好项目，<br><em>从交流开始。</em></h1>
        <p>把正在做的事分享出来，遇见能一起做的人。想法、实践与团队日常，都在这里继续生长。</p>
        <div class="cover-actions">
          <router-link class="primary-action" to="/community">去社区聊聊 <span aria-hidden="true">↗</span></router-link>
          <router-link class="secondary-action" :to="{ path: '/explore', query: { type: 'project' } }">逛逛项目 <span aria-hidden="true">↗</span></router-link>
        </div>
        <div class="cover-bottom" aria-label="门户内容">
          <span><b>01</b> 分享项目</span><span><b>02</b> 讨论想法</span><span><b>03</b> 沉淀经验</span>
        </div>
      </div>
      <router-link v-if="leadArticle" class="cover-story" :to="`/explore/article/${leadArticle.id}`">
        <img v-if="leadArticle.coverImage && !coverFailed" :src="leadArticle.coverImage" alt="" @error="coverFailed = true" />
        <span class="cover-story-tag">本期推荐 <span aria-hidden="true">↗</span></span>
        <span class="cover-story-content">
          <small>{{ leadArticle.category || '团队文章' }} · {{ leadArticle.author || '团队分享' }}</small>
          <strong>{{ leadArticle.title }}</strong>
          <span>{{ leadArticle.excerpt || leadArticle.desc || '阅读完整文章' }}</span>
        </span>
      </router-link>
      <div v-else class="cover-story cover-story-empty">
        <span class="cover-story-tag">从这里开始</span>
        <span class="cover-story-content"><small>项目 · 讨论 · 资源</small><strong>每个好想法，<br>都值得被看见。</strong><router-link to="/community">进入社区 ↗</router-link></span>
      </div>
    </section>

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
          <div><span class="section-kicker">一起讨论 / COMMUNITY</span><h2 id="discussion-title">此刻在聊</h2></div>
          <router-link to="/community">去社区 <span aria-hidden="true">↗</span></router-link>
        </header>
        <div v-if="groups.topic.loading" class="placeholder-stack"><div v-for="index in 3" :key="index" class="row-skeleton" /></div>
        <div v-else-if="groups.topic.error" class="simple-state" role="alert">讨论暂时无法加载。<button type="button" @click="loadGroup('topic')">重试</button></div>
        <div v-else-if="groups.topic.records.length" class="topic-stack"><TopicRow v-for="item in groups.topic.records.slice(0, 4)" :key="item.id" :topic="item" /></div>
        <div v-else class="conversation-invite">
          <span class="invite-mark" aria-hidden="true">“</span>
          <div><strong>下一场讨论，从你开始。</strong><p>聊聊正在做的项目、最近遇到的问题，或者一个刚冒出来的想法。</p><router-link to="/community">发起第一个话题 <span aria-hidden="true">↗</span></router-link></div>
        </div>
        <nav class="board-links" aria-label="社区板块">
          <router-link to="/community/boards/project-share">项目分享 ↗</router-link>
          <router-link to="/community/boards/tech-talk">技术交流 ↗</router-link>
          <router-link to="/community/boards/lounge">闲聊 ↗</router-link>
        </nav>
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
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'
import { getClientId } from '@/utils/clientId'

const quickLinks = [
  { type: 'project', label: '项目' }, { type: 'article', label: '文章' },
  { type: 'ai', label: 'AI 资产' }, { type: 'life', label: '团队内容' }
]
const emptyGroup = () => ({ records: [], total: 0, loading: true, error: null })
const groups = reactive({ project: emptyGroup(), topic: emptyGroup(), article: emptyGroup(), ai: emptyGroup(), life: emptyGroup() })
const recentItems = ref([])
const coverFailed = ref(false)
const leadArticle = computed(() => groups.article.records[0] || null)
const moreArticles = computed(() => groups.article.records.slice(1, 3))
const lifeRecords = computed(() => groups.life.records)
const alertItems = computed(() => lifeRecords.value.filter((item) => item.type?.trim() === '告警'))
const noticeItems = computed(() => lifeRecords.value.filter((item) => ['公告', '提醒'].includes(item.type?.trim())))
const lifeMoments = computed(() => lifeRecords.value.filter((item) => !['告警', '公告', '提醒'].includes(item.type?.trim())))
const kindLabel = (kind) => quickLinks.find((item) => item.type === kind)?.label || '资源'
const recentPath = (item) => item.kind === 'project' ? `/project/${item.targetId}` : `/explore/${item.kind}/${item.targetId}`

async function loadGroup(kind) {
  groups[kind] = { ...emptyGroup(), loading: true }
  if (kind === 'article') coverFailed.value = false
  try {
    const size = { project: 6, topic: 5, article: 3, ai: 3, life: 200 }[kind] || 4
    const result = await fetchDiscoveryGroup(kind, { size })
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
  for (const kind of ['project', 'topic', 'article', 'ai', 'life']) loadGroup(kind)
  loadRecent()
})
</script>

<style scoped>
.home-page { max-width: 1440px; margin: 0 auto; display: grid; gap: 0; padding-bottom: 80px; }
.urgent-ribbon { display: flex; align-items: center; gap: 20px; min-height: 54px; margin-bottom: 20px; padding: 11px 20px; background: #7e2f31; color: #fff; }
.urgent-label { flex-shrink: 0; border-right: 1px solid #ffffff70; padding-right: 18px; font-size: 12px; font-weight: 800; letter-spacing: .08em; }
.urgent-ribbon strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.urgent-ribbon a { flex-shrink: 0; margin-left: auto; font-size: 12px; font-weight: 700; }
.cover { display: grid; grid-template-columns: minmax(0, 1.06fr) minmax(0, .94fr); min-height: 500px; overflow: hidden; }
.cover-copy { display: flex; flex-direction: column; align-items: start; padding: clamp(30px, 4vw, 60px) clamp(28px, 4vw, 60px) 27px; background: #f2f0ea; }
.cover-kicker { color: var(--portal-accent); font-size: 12px; font-weight: 750; letter-spacing: .12em; }
.cover-kicker span { margin: 0 8px; color: #9a9690; }
.cover h1 { margin: 31px 0 25px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: clamp(46px, 5.2vw, 78px); font-weight: 780; letter-spacing: -.06em; line-height: 1.14; }
.cover h1 em { color: var(--portal-accent); font-style: normal; }
.cover-copy > p { max-width: 30em; margin: 0; color: #555d62; font-size: 15px; line-height: 1.9; }
.cover-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 17px 26px; margin-top: 34px; }
.primary-action { display: inline-flex; align-items: center; gap: 24px; min-height: 50px; padding: 0 20px; background: var(--portal-accent); color: #fff; font-size: 14px; font-weight: 700; }
.primary-action:hover { filter: brightness(.9); }
.secondary-action { padding: 12px 0; border-bottom: 1px solid currentColor; color: var(--portal-text); font-size: 14px; font-weight: 660; }
.cover-bottom { display: flex; flex-wrap: wrap; gap: 15px 26px; width: 100%; margin-top: auto; border-top: 1px solid #d8d5cd; padding-top: 20px; color: #697178; font-size: 12px; }
.cover-bottom b { margin-right: 6px; color: var(--portal-accent); font-size: 11px; }
.cover-story { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; min-height: 500px; overflow: hidden; padding: 32px; background: #263a46; color: #fff; }
.cover-story:before { position: absolute; z-index: 1; inset: 0; background: linear-gradient(180deg, #14232a5e 0%, #14232a1a 35%, #14232ae6 100%); content: ''; pointer-events: none; }
.cover-story img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.cover-story:hover img { transform: scale(1.035); }
.cover-story-tag, .cover-story-content { position: relative; z-index: 2; }
.cover-story-tag { display: flex; justify-content: space-between; max-width: 140px; border: 1px solid #ffffff8a; padding: 8px 10px; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
.cover-story-content { display: grid; gap: 13px; max-width: 500px; }
.cover-story-content small { font-size: 12px; font-weight: 700; letter-spacing: .06em; }
.cover-story-content strong { font-size: clamp(26px, 2.7vw, 41px); font-weight: 740; line-height: 1.3; }
.cover-story-content > span { display: -webkit-box; overflow: hidden; max-width: 36em; font-size: 14px; line-height: 1.7; opacity: .88; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.cover-story-empty { background: #31596c; }
.cover-story-empty:before { display: none; }
.cover-story-empty .cover-story-content a { color: #fff; font-size: 13px; }
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
.section-heading h2 { margin: 7px 0 0; font-family: inherit; font-size: clamp(28px, 2.8vw, 38px); font-weight: 730; letter-spacing: -.035em; }
.section-heading > a { flex-shrink: 0; color: var(--portal-accent); font-size: 13px; font-weight: 650; }
.topic-stack { border-top: 2px solid var(--portal-text); }
.topic-stack :deep(.topic-row) { padding-left: 0; padding-right: 0; background: transparent; }
.conversation-invite { display: flex; gap: 28px; min-height: 220px; border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 23px 8px 23px 0; }
.invite-mark { color: var(--portal-accent); font-family: serif; font-size: 100px; line-height: .9; }
.conversation-invite > div { align-self: center; }
.conversation-invite strong { font-size: 25px; font-weight: 730; }
.conversation-invite p { max-width: 34em; color: var(--portal-text-soft); font-size: 14px; line-height: 1.7; }
.conversation-invite a { color: var(--portal-accent); font-size: 13px; font-weight: 700; }
.board-links { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 19px; }
.board-links a { border: 1px solid var(--portal-line); padding: 9px 12px; color: var(--portal-text-soft); font-size: 12px; }
.board-links a:hover { border-color: var(--portal-accent); color: var(--portal-accent); }
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
.project-section { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); min-height: 300px; background: #273f50; color: #fff; }
.project-intro { display: flex; flex-direction: column; align-items: start; padding: 38px clamp(28px, 4vw, 54px); }
.project-intro .section-kicker { color: #bdd1d9; }
.project-intro h2 { margin: 32px 0 13px; font-family: inherit; font-size: clamp(28px, 3vw, 43px); font-weight: 730; letter-spacing: -.04em; }
.project-intro p { max-width: 26em; margin: 0 0 30px; color: #c7d6dc; font-size: 13px; line-height: 1.8; }
.project-intro > a { margin-top: auto; border-bottom: 1px solid #e4eeee; padding-bottom: 5px; font-size: 13px; font-weight: 700; }
.project-content { min-width: 0; border-left: 1px solid #ffffff3d; padding: 37px clamp(26px, 4vw, 50px); }
.project-content-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; font-size: 12px; font-weight: 700; }
.project-content-head a { color: #c7d6dc; }
.project-list { border-top: 1px solid #ffffff5c; }
.project-list a { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 12px; align-items: center; border-bottom: 1px solid #ffffff3d; padding: 15px 0; }
.project-list a span { color: #b4ccd4; font-size: 12px; }
.project-list a strong { overflow: hidden; font-size: 15px; font-weight: 640; text-overflow: ellipsis; white-space: nowrap; }
.project-empty { display: grid; align-content: center; gap: 9px; min-height: 170px; border-top: 1px solid #ffffff5c; color: #d4e0e4; font-size: 13px; }
.project-empty strong { color: #fff; font-size: 20px; }
.project-empty button { width: fit-content; border: 0; padding: 0; background: none; color: #fff; cursor: pointer; }
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
@media (max-width: 1000px) { .cover { min-height: 450px; } .cover-story { min-height: 450px; } .activity-grid { grid-template-columns: 1fr; } .bulletin { max-width: none; } .reading-story { grid-template-columns: 1fr; } .reading-image { height: 190px; min-height: 190px; } }
@media (max-width: 760px) { .cover, .project-section, .reading-grid, .bottom-grid { grid-template-columns: 1fr; } .cover-copy { min-height: 450px; } .cover-story { min-height: 340px; } .activity-grid { padding: 48px 0; } .project-content { border-top: 1px solid #ffffff3d; border-left: 0; } .reading-section { padding: 52px 0; } .reading-story { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); } .reading-image { height: auto; min-height: 210px; } .bottom-grid { gap: 48px; } }
@media (max-width: 520px) { .cover-copy { min-height: 430px; padding: 28px 24px 23px; } .cover h1 { margin-top: 28px; font-size: clamp(44px, 11vw, 60px); } .cover-story { min-height: 340px; padding: 24px; } .cover-story-content strong { font-size: 27px; } .notice-ticker { gap: 8px; } .ticker-more { display: none; } .reading-story { grid-template-columns: 1fr; } .reading-image { height: 210px; min-height: 210px; } .reading-copy { padding: 18px 0 22px; } .tool-list a { grid-template-columns: 54px minmax(0, 1fr) auto; } .tool-list small { display: none; } .bulletin { padding: 24px; } .urgent-ribbon { gap: 10px; } .urgent-label { padding-right: 10px; } }
@media (prefers-reduced-motion: reduce) { .cover-story img, .reading-image img { transition: none; } }
</style>
