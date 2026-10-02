<template>
  <div class="home-page">
    <div class="page-wrap">
      <div v-if="alert" class="alert-bar" role="alert">
        <strong>告警</strong>
        <router-link :to="`/explore/life/${alert.id}`">{{ alert.title }}</router-link>
        <router-link :to="`/explore/life/${alert.id}`" aria-label="查看告警详情">↗</router-link>
      </div>
      <div v-if="notice" class="announcement">
        <strong>公告</strong>
        <router-link :to="`/explore/life/${notice.id}`">{{ notice.title }}</router-link>
        <router-link :to="{ path: '/explore', query: { type: 'life' } }">查看公告 ↗</router-link>
      </div>

      <div class="page-top">
        <div>
          <small>{{ monthLabel }} · 大家的讨论与作品</small>
          <h1>今天，来聊点<em>真的。</em></h1>
          <p>聊工作，聊生活，晒正在做的事。每个话题都从真实的人开始。</p>
        </div>
        <div class="page-actions">
          <router-link to="/community">看全部讨论 ↗</router-link><i aria-hidden="true" />
          <router-link :to="{ path: '/explore', query: { type: 'project' } }">发现项目 ↗</router-link>
        </div>
      </div>

      <div class="top-grid">
        <section class="conversation" aria-labelledby="conversation-title">
          <div class="panel-top"><strong id="conversation-title">正在讨论</strong><span>你也可以加入</span></div>
          <div v-if="groups.topic.loading" class="panel-state">正在加载话题…</div>
          <div v-else-if="groups.topic.error" class="panel-state" role="alert">话题暂时无法加载。<button type="button" @click="loadGroup('topic')">重试 ↗</button></div>
          <template v-else-if="featuredTopic">
            <router-link class="featured-post" :to="`/community/topics/${featuredTopic.id}`">
              <div class="post-head"><span class="dot" /><span>{{ featuredTopic.boardName || '社区' }} · {{ Number(featuredTopic.replyCount) > 0 ? '有人在聊' : '新话题' }}</span><span class="date">{{ topicDate(featuredTopic) }}</span></div>
              <h2>{{ featuredTopic.title }}</h2>
              <blockquote v-if="featuredTopic.body">{{ featuredTopic.body }}</blockquote>
              <p v-else class="post-excerpt">打开话题，看看大家怎么说。</p>
              <div class="post-foot"><span class="mini-avatar">{{ (featuredTopic.authorNickname || '访')[0] }}</span><b>{{ featuredTopic.authorNickname || '访客' }}</b><span class="separator">·</span><span>{{ Number(featuredTopic.replyCount) || 0 }} 条回复</span><span class="reply">进入讨论 ↗</span></div>
            </router-link>
            <router-link v-if="secondaryTopic" class="second-post" :to="`/community/topics/${secondaryTopic.id}`">
              <span><strong>{{ secondaryTopic.title }}</strong><small>{{ secondaryTopic.authorNickname || '访客' }} · {{ secondaryTopic.boardName || '社区' }} · {{ Number(secondaryTopic.replyCount) || 0 }} 条回复</small></span><span>参与 ↗</span>
            </router-link>
            <router-link v-else class="second-post" to="/community?compose=1"><span><strong>你想聊什么？</strong><small>从一个问题，或一句话开始</small></span><span>发起 ↗</span></router-link>
          </template>
          <div v-else class="panel-state empty-talk"><strong>从你的第一句话开始。</strong><p>分享近况，聊一个问题，或找人一起做项目。</p><router-link to="/community?compose=1">发起话题 ↗</router-link></div>
        </section>

        <router-link v-if="featuredProject" class="project-feature" :to="`/project/${featuredProject.id}`">
          <div class="project-heading"><span>项目档案 / 01</span><span>发现作品 ↗</span></div>
          <div class="project-scene" aria-hidden="true"><div class="window-dots"><i /><i /><i /></div><div class="project-grid" /><div class="project-card"><strong>{{ featuredProject.shortName || featuredProject.projectName }}</strong><small>PROJECT NOTE</small></div></div>
          <div class="project-bottom"><div><strong>{{ featuredProject.projectName }}</strong><small>{{ featuredProject.category || '项目' }} · 看看它正在做什么</small></div><b aria-hidden="true">↗</b></div>
        </router-link>
        <div v-else class="project-feature project-fallback"><div class="project-heading"><span>项目档案</span><router-link :to="{ path: '/explore', query: { type: 'project' } }">发现作品 ↗</router-link></div><div class="fallback-inner"><span>{{ groups.project.loading ? '正在整理项目…' : groups.project.error ? '项目暂时无法加载' : '你的项目，可以从这里被看见。' }}</span><button v-if="groups.project.error" type="button" @click="loadGroup('project')">重试 ↗</button><router-link v-else to="/project-studio">分享我的项目 ↗</router-link></div></div>
      </div>

      <div v-if="quickProjects.length" class="quickline" aria-label="更多项目">
        <router-link v-for="(project, index) in quickProjects" :key="project.id" :to="`/project/${project.id}`"><span class="icon" :class="`tone-${index}`">{{ project.projectName?.[0] || '项' }}</span><span><strong>{{ project.projectName }}</strong><small>{{ project.category || project.type || '看看这个项目' }}</small></span><b aria-hidden="true">↗</b></router-link>
      </div>
      <div v-else class="quickline quickline-actions"><router-link to="/project-studio"><span class="icon">＋</span><span><strong>分享你的项目</strong><small>让更多人发现它</small></span><b aria-hidden="true">↗</b></router-link><router-link to="/community"><span class="icon tone-1">聊</span><span><strong>加入讨论</strong><small>看看大家在聊什么</small></span><b aria-hidden="true">↗</b></router-link></div>

      <div class="lower">
        <section class="reading" aria-labelledby="reading-title">
          <div class="section-heading"><div><small>换个角度 / 01</small><h2 id="reading-title">一些经验，慢慢读</h2></div><router-link :to="{ path: '/explore', query: { type: 'article' } }">全部文章 ↗</router-link></div>
          <div v-if="groups.article.loading" class="reading-state">正在加载文章…</div>
          <div v-else-if="groups.article.error" class="reading-state" role="alert">文章暂时无法加载。<button type="button" @click="loadGroup('article')">重试 ↗</button></div>
          <div v-else-if="articles.length" class="article-list"><router-link v-for="(article, index) in articles" :key="article.id" class="article-row" :to="`/explore/article/${article.id}`"><span class="article-thumb" :class="`tone-${index}`">{{ articleGlyph(article.title) }}</span><span class="article-copy"><strong>{{ article.title }}</strong><small>{{ article.category || '文章' }}<template v-if="article.excerpt"> · {{ article.excerpt }}</template></small></span><span class="read-link">阅读 ↗</span></router-link></div>
          <div v-else class="reading-state">这里还没有文章。<router-link :to="{ path: '/explore', query: { type: 'article' } }">看看全部资源 ↗</router-link></div>
        </section>
        <aside class="editorial"><div class="section-heading"><div><small>写下你的经验 / 02</small><h2>轮到你开口</h2></div></div><div class="note"><strong>一个问题、一段经验，或者一个新项目。</strong><p>不用写成完整文章。把你正在想的事发出来，让下一位路过的人有话可接。</p><router-link to="/community?compose=1">发起话题 ↗</router-link></div></aside>
      </div>
    </div>
    <footer class="home-footer"><div class="page-wrap">在场 · 话题与作品社区</div></footer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'

const groups = reactive(Object.fromEntries(['topic', 'project', 'article', 'life'].map((kind) => [kind, { records: [], loading: true, error: false }])))
const monthLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(new Date())
const activityTime = (topic) => Math.max(Date.parse(topic.createTime) || 0, Date.parse(topic.lastReplyTime) || 0)
const topics = computed(() => [...groups.topic.records].sort((a, b) => {
  const recent = activityTime(b) - activityTime(a)
  return recent || (Number(b.replyCount) || 0) - (Number(a.replyCount) || 0)
}))
const featuredTopic = computed(() => topics.value[0] || null)
const secondaryTopic = computed(() => topics.value[1] || null)
const featuredProject = computed(() => groups.project.records.find((item) => item.projectName === '一稿通') || groups.project.records[0] || null)
const quickProjects = computed(() => groups.project.records.filter((item) => item.id !== featuredProject.value?.id).slice(0, 3))
const articles = computed(() => groups.article.records.slice(0, 3))
const alert = computed(() => groups.life.records.find((item) => item.type?.trim() === '告警') || null)
const notice = computed(() => groups.life.records.find((item) => item.type?.trim() === '公告') || null)

function articleGlyph(title) {
  return ['迁', '幂', '查'].find((character) => title?.includes(character)) || title?.match(/[\u4e00-\u9fff]/)?.[0] || title?.[0] || '读'
}

function topicDate(topic) {
  const value = topic.lastReplyTime || topic.createTime
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(date)
}

async function loadGroup(kind) {
  const group = groups[kind]
  group.loading = true
  group.error = false
  try {
    const result = await fetchDiscoveryGroup(kind, { size: kind === 'life' ? 30 : 6 })
    group.records = result.records
  } catch {
    group.records = []
    group.error = true
  } finally {
    group.loading = false
  }
}

onMounted(() => { for (const kind of Object.keys(groups)) loadGroup(kind) })
</script>

<style scoped>
.home-page { min-height: 100vh; background: var(--portal-bg); color: var(--portal-text); font-family: 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif; }
.page-wrap { max-width: 1380px; margin: 0 auto; padding: 0 42px; }
.home-page h1, .home-page h2 { font-family: inherit; }
.alert-bar, .announcement { display: flex; align-items: center; gap: 11px; min-height: 43px; border-bottom: 1px solid var(--portal-line); font-size: 12px; }
.alert-bar { color: #a92e29; }
.alert-bar strong { font-weight: 850; }
.alert-bar a:last-child, .announcement a:last-child { margin-left: auto; white-space: nowrap; }
.announcement strong { flex: 0 0 auto; color: #946132; font-weight: 850; }
.announcement a:nth-child(2), .alert-bar a:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.announcement a:last-child { color: #797f82; }
.page-top { display: flex; justify-content: space-between; align-items: end; gap: 20px; padding: 30px 0 25px; }
.page-top small, .section-heading small { color: var(--portal-accent); font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.page-top h1 { margin: 9px 0 6px; font-size: clamp(35px, 3.6vw, 51px); font-weight: 850; letter-spacing: -.085em; line-height: 1.16; }
.page-top h1 em { color: var(--portal-accent); font-style: normal; }
.page-top p { margin: 0; color: var(--portal-text-soft); font-size: 13px; }
.page-actions { display: flex; align-items: center; gap: 15px; padding-bottom: 3px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.page-actions a:first-child, .section-heading a { color: var(--portal-accent-2); }
.page-actions a:last-child { border-bottom: 1px solid var(--portal-accent); padding-bottom: 5px; color: var(--portal-accent); }
.page-actions i { width: 1px; height: 18px; background: var(--portal-line); }
.top-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(325px, .9fr); gap: 18px; align-items: stretch; }
.conversation { min-width: 0; overflow: hidden; border: 1px solid #d8dbd7; border-radius: 12px; background: #fff; }
.panel-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e9eae7; padding: 17px 22px; }
.panel-top strong { font-size: 14px; font-weight: 800; }
.panel-top span { color: #8a9194; font-size: 11px; }
.featured-post { position: relative; display: block; overflow: hidden; border-bottom: 1px solid #e5e5e0; padding: 25px 30px 27px; background: #fbf7ee; }
.featured-post::after { position: absolute; right: -50px; bottom: -127px; width: 290px; height: 290px; border: 2px solid #d9b8a9; border-radius: 50%; content: ''; pointer-events: none; }
.post-head { display: flex; align-items: center; gap: 8px; color: #976746; font-size: 11px; font-weight: 800; }
.post-head .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--portal-accent); }
.post-head .date { margin-left: auto; color: #aaa9a1; font-weight: 500; }
.featured-post h2 { position: relative; z-index: 1; margin: 20px 0 11px; font-size: clamp(25px, 2.5vw, 34px); font-weight: 820; letter-spacing: -.07em; }
.featured-post blockquote { position: relative; z-index: 1; display: -webkit-box; max-width: 470px; margin: 0; overflow: hidden; color: #56616a; font-family: 'Songti SC', 'Noto Serif CJK SC', serif; font-size: 17px; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.post-excerpt { color: #56616a; font-size: 15px; }
.post-foot { position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; margin-top: 27px; color: #7b858b; font-size: 11px; }
.mini-avatar { display: grid; place-items: center; width: 24px; height: 24px; flex: 0 0 auto; border-radius: 50%; background: #b9c9c4; color: #173c43; font-size: 10px; font-weight: 900; }
.post-foot b { color: var(--portal-text); font-weight: 700; }
.post-foot .reply { margin-left: auto; color: var(--portal-accent); font-weight: 800; white-space: nowrap; }
.second-post { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; min-height: 76px; padding: 14px 22px; }
.second-post strong { display: block; font-size: 15px; font-weight: 720; }
.second-post small { display: block; margin-top: 5px; color: #90989a; font-size: 11px; }
.second-post > span:last-child { color: var(--portal-accent-2); font-size: 12px; font-weight: 800; white-space: nowrap; }
.panel-state { min-height: 300px; padding: 34px 30px; color: var(--portal-text-soft); font-size: 14px; }
.panel-state strong { display: block; margin-bottom: 8px; color: var(--portal-text); font-size: 22px; }
.panel-state a, .panel-state button, .reading-state a, .reading-state button { border: 0; padding: 0; color: var(--portal-accent); background: none; font: inherit; font-weight: 750; cursor: pointer; }
.project-feature { display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid #294965; border-radius: 12px; background: var(--home-project, #1d4468); color: #fff; }
.project-heading { display: flex; justify-content: space-between; gap: 12px; padding: 17px 20px 0; color: #b7c8d3; font-size: 11px; font-weight: 750; letter-spacing: .05em; }
.project-scene { position: relative; display: grid; place-items: center; flex: 1; min-height: 188px; overflow: hidden; margin: 15px 19px 12px; border: 1px solid #a9bbbf; border-radius: 5px; background: #e5e8dc; }
.project-scene::before { position: absolute; top: 0; right: 0; left: 0; height: 20px; border-bottom: 1px solid #bcc8c4; background: #f9f8ef; content: ''; }
.window-dots { position: absolute; top: 7px; left: 10px; display: flex; gap: 4px; }
.window-dots i { width: 5px; height: 5px; border-radius: 50%; background: #bac2bc; }
.project-grid { position: absolute; top: 20px; right: 0; bottom: 0; left: 0; background-image: linear-gradient(#71889920 1px, transparent 1px), linear-gradient(90deg, #71889920 1px, transparent 1px); background-size: 23px 23px; }
.project-card { position: relative; z-index: 1; display: grid; place-items: center; width: 64%; min-height: 108px; transform: rotate(-5deg); border: 2px solid #1f4262; box-shadow: 11px 11px 0 #c64f40; background: #fffaf2; text-align: center; }
.project-card strong { max-width: 94%; overflow: hidden; color: #1c4263; font-family: 'Songti SC', 'Noto Serif CJK SC', serif; font-size: clamp(28px, 3vw, 45px); font-weight: 900; letter-spacing: -.09em; text-overflow: ellipsis; white-space: nowrap; }
.project-card small { margin-top: -24px; color: #899095; font-size: 9px; letter-spacing: .16em; }
.project-bottom { display: flex; align-items: end; justify-content: space-between; gap: 10px; padding: 0 20px 19px; }
.project-bottom strong { display: block; font-size: 19px; font-weight: 750; }
.project-bottom small { display: block; margin-top: 5px; color: #a7c0cf; font-size: 11px; }
.project-bottom b { font-size: 22px; font-weight: 400; }
.fallback-inner { display: flex; flex: 1; flex-direction: column; justify-content: center; gap: 20px; padding: 35px; font-size: 24px; font-weight: 750; }
.fallback-inner a, .fallback-inner button { align-self: start; border: 0; padding: 0; color: #fff; background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.quickline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 17px 0 0; }
.quickline a { display: flex; align-items: center; gap: 12px; min-width: 0; border: 1px solid var(--portal-line); border-radius: 10px; padding: 13px 16px; background: #fff; }
.quickline .icon { display: grid; place-items: center; width: 33px; height: 33px; flex: 0 0 auto; border-radius: 7px; background: #f4e3df; color: var(--portal-accent); font-family: 'Songti SC', serif; font-size: 18px; font-weight: 900; }
.quickline .icon.tone-1 { background: #e7eef1; color: #426a84; }
.quickline .icon.tone-2 { background: #f4eddf; color: #a17734; }
.quickline a > span:nth-child(2) { min-width: 0; }
.quickline strong { display: block; overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.quickline small { display: block; margin-top: 3px; overflow: hidden; color: #818a90; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.quickline b { margin-left: auto; color: #879198; font-size: 15px; font-weight: 400; }
.lower { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(325px, .9fr); gap: 40px; padding: 48px 0 75px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 15px; margin-bottom: 18px; }
.section-heading small { font-size: 10px; }
.section-heading h2 { margin: 6px 0 0; font-size: 26px; font-weight: 800; letter-spacing: -.05em; }
.section-heading a { font-size: 12px; font-weight: 750; white-space: nowrap; }
.article-list, .reading-state { border-top: 2px solid var(--portal-text); }
.article-row { display: grid; grid-template-columns: 69px minmax(0, 1fr) 70px; align-items: center; gap: 14px; border-bottom: 1px solid var(--portal-line); padding: 12px 6px; }
.article-thumb { display: grid; place-items: center; width: 67px; height: 61px; border-radius: 6px; background: #eadbd1; color: #a64b3a; font-family: 'Songti SC', 'Noto Serif CJK SC', serif; font-size: 27px; font-weight: 900; }
.article-thumb.tone-1 { background: #dce8ed; color: #2f647d; }
.article-thumb.tone-2 { background: #ebe5d4; color: #95733e; }
.article-copy { min-width: 0; }
.article-copy strong { display: block; overflow: hidden; font-size: 15px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.article-copy small { display: block; margin-top: 6px; overflow: hidden; color: #8a9397; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.read-link { color: var(--portal-accent); font-size: 11px; font-weight: 750; text-align: right; }
.reading-state { padding: 25px 6px; color: var(--portal-text-soft); font-size: 13px; }
.note { border-top: 2px solid var(--portal-text); padding: 18px 0 0; }
.note strong { display: block; font-size: 17px; }
.note p { max-width: 400px; color: #68747b; font-size: 12px; line-height: 1.8; }
.note a { display: inline-block; margin-top: 8px; border-bottom: 1px solid var(--portal-accent); padding-bottom: 4px; color: var(--portal-accent); font-size: 12px; font-weight: 800; }
.home-footer { border-top: 1px solid var(--portal-line); padding: 24px 0 35px; color: #828a8e; font-size: 11px; }
.home-page a:hover { color: var(--portal-accent); }
.project-feature:hover, .featured-post:hover, .quickline a:hover { transform: translateY(-2px); }
.project-feature, .featured-post, .quickline a { transition: transform .18s ease; }
.project-feature:hover { color: #fff !important; }
@media (max-width: 1050px) { .page-wrap { padding: 0 26px; } .top-grid, .lower { grid-template-columns: minmax(0, 1.35fr) minmax(280px, .9fr); } .project-scene { min-height: 155px; } .quickline { gap: 8px; } .quickline a { padding: 11px; } }
@media (max-width: 760px) { .page-wrap { padding: 0 18px; } .page-top { padding: 22px 0 19px; } .page-top h1 { font-size: 38px; } .page-actions { display: none; } .top-grid, .lower { grid-template-columns: 1fr; } .featured-post { padding: 23px; } .project-feature { min-height: 245px; } .project-scene { min-height: 130px; } .quickline { grid-template-columns: 1fr 1fr; } .quickline a:nth-child(3) { grid-column: 1 / -1; } .lower { gap: 33px; padding-top: 34px; } }
@media (max-width: 450px) { .page-top h1 { font-size: 34px; } .page-top p { font-size: 12px; } .featured-post h2 { font-size: 27px; } .featured-post blockquote { font-size: 15px; } .post-foot .reply { font-size: 10px; } .quickline a { gap: 8px; } .quickline .icon { width: 29px; height: 29px; } .quickline strong { font-size: 12px; } .quickline small { font-size: 9px; } }
@media (prefers-reduced-motion: reduce) { .project-feature, .featured-post, .quickline a { transition: none; } }
</style>
