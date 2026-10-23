<template>
  <div class="reading-page">
    <header class="reading-masthead"><div class="masthead-inner"><div><span class="eyebrow">在场 / READING ROOM</span><h1>读点<span>有用的。</span></h1><p>实践、复盘和一路上想明白的事。花几分钟读完，也许下一步就有了方向。</p></div><div class="masthead-mark" aria-hidden="true"><span>读</span><small>01 — 经验留在这里</small></div></div></header>

    <main class="reading-main">
      <nav class="reading-tabs" aria-label="阅读内容类型">
        <router-link to="/reading" :class="{ active: view === 'articles' }" :aria-current="view === 'articles' ? 'page' : undefined">经验文章</router-link>
        <router-link :to="{ path: '/reading', query: { tab: 'projects' } }" :class="{ active: view === 'projects' }" :aria-current="view === 'projects' ? 'page' : undefined">项目解读<span v-if="guides.length" class="tab-count">{{ guides.length }}</span></router-link>
      </nav>
      <div class="reading-toolbar"><span>{{ view === 'projects' ? (keyword ? `搜索「${keyword}」` : '项目解读 · 从真实项目里学方法') : (keyword ? `搜索「${keyword}」` : '本期精选 · 来自真实分享') }}</span><form class="reading-search" role="search" @submit.prevent="submitSearch"><label class="sr-only" for="reading-search-input">{{ view === 'projects' ? '搜索项目解读' : '搜索文章' }}</label><input id="reading-search-input" v-model="searchDraft" type="search" :placeholder="view === 'projects' ? '搜索项目名称或解读内容' : '搜索标题或经验关键词'" /><button type="submit">查找 ↗</button></form></div>
      <template v-if="view === 'projects'">
        <div v-if="guideLoading" class="reading-state">正在整理已发布的项目解读…</div>
        <div v-else-if="guideError" class="reading-state" role="alert">项目解读暂时无法加载。<button type="button" @click="loadGuides">重试 ↗</button></div>
        <template v-else-if="featuredGuide">
          <section class="guide-feature" aria-labelledby="guide-feature-title">
            <div class="guide-feature-art"><span>PROJECT READING / 01</span><strong>{{ guideGlyph(featuredGuide.fullName) }}</strong><small>读项目，也读它的选择</small></div>
            <div class="guide-feature-copy"><span class="eyebrow">从真实项目开始</span><h2 id="guide-feature-title">{{ featuredGuide.fullName }}</h2><p>{{ guideTeaser(featuredGuide) }}</p><div class="guide-feature-meta"><span>{{ featuredGuide.sourceName || featuredGuide.sourcePlatform || '公开项目' }}</span><span>{{ featuredGuide.language || '多语言' }}</span><span v-if="featuredGuide.starCount !== null && featuredGuide.starCount !== undefined">★ {{ Number(featuredGuide.starCount).toLocaleString('en-US') }}</span></div><router-link :to="`/open-source/${featuredGuide.id}#reading-guide`">打开项目解读 <span aria-hidden="true">↗</span></router-link></div>
          </section>
          <section v-if="otherGuides.length" class="guide-index" aria-labelledby="guide-index-title"><div class="index-heading"><div><span class="eyebrow">继续读下去 / PROJECT NOTES</span><h2 id="guide-index-title">还有这些项目，值得拆开看看</h2></div><span>{{ filteredGuides.length }} 篇解读</span></div><div class="guide-card-grid"><router-link v-for="(guide, index) in otherGuides" :key="guide.id" class="guide-card" :to="`/open-source/${guide.id}#reading-guide`"><div class="guide-card-top"><span>{{ String(index + 2).padStart(2, '0') }} / {{ guide.sourceName || guide.sourcePlatform || '项目解读' }}</span><span>↗</span></div><h3>{{ guide.fullName }}</h3><p>{{ guideTeaser(guide) }}</p><div class="guide-card-bottom"><span>{{ guide.language || '公开项目' }}</span><span>查看解读 ↗</span></div></router-link></div></section>
        </template>
        <div v-else class="reading-state guide-empty"><span class="eyebrow">PROJECT READING / 项目解读</span><strong>{{ keyword ? '没有找到匹配的项目解读' : '还没有已发布的项目解读。' }}</strong><span>{{ keyword ? '换个项目名或关键词试试。' : '这里会收录真实项目的阅读路径、设计取舍和动手练习；解读生成并发布后，就会出现在这里。' }}</span><router-link v-if="keyword" to="/reading?tab=projects">清除搜索 ↗</router-link><router-link v-else to="/projects#open-source">先去项目广场看看 ↗</router-link></div>
      </template>
      <template v-else>
      <div v-if="loading" class="reading-state">正在翻阅文章…</div>
      <div v-else-if="error" class="reading-state" role="alert">文章暂时无法加载。<button type="button" @click="loadArticles">重试 ↗</button></div>
      <template v-else-if="featured">
        <section class="feature" aria-labelledby="feature-title">
          <router-link class="feature-cover" :to="`/explore/article/${featured.id}`" :aria-label="`阅读：${featured.title}`"><span class="cover-corner">在场 / 阅读</span><span class="cover-glyph">{{ articleGlyph(featured.title) }}</span><span class="cover-bottom">STORIES WORTH KEEPING <b>↗</b></span></router-link>
          <div class="feature-copy"><span class="eyebrow">先读这一篇 / 01</span><span class="feature-category">{{ featured.category || '文章' }}</span><h2 id="feature-title">{{ featured.title }}</h2><p>{{ featured.excerpt || featured.desc || '打开文章，读一段完整的分享。' }}</p><div class="feature-meta"><span>{{ featured.author || '团队分享' }}</span><span>{{ featured.date || '近期' }}</span></div><router-link :to="`/explore/article/${featured.id}`">开始阅读 <span aria-hidden="true">↗</span></router-link></div>
        </section>
        <div class="reading-body"><section class="article-index" aria-labelledby="index-title"><div class="index-heading"><div><span class="eyebrow">阅读目录 / INDEX</span><h2 id="index-title">接着读下去</h2></div><span>{{ total }} 篇文章</span></div><div v-if="rest.length" class="article-list"><router-link v-for="(article, index) in rest" :key="article.id" class="article-row" :to="`/explore/article/${article.id}`"><span class="article-number">{{ String((page - 1) * pageSize + index + 2).padStart(2, '0') }}</span><div class="article-copy"><span>{{ article.category || '文章' }} · {{ article.date || '近期' }}</span><h3>{{ article.title }}</h3><p>{{ article.excerpt || article.desc || '打开文章，看看完整内容。' }}</p></div><span class="article-arrow" aria-hidden="true">↗</span></router-link></div><div v-else class="index-empty">这一页已经读完了。<router-link to="/community?compose=1">分享你的经验 ↗</router-link></div><nav v-if="totalPages > 1" class="pager" aria-label="文章分页"><button type="button" :disabled="page <= 1" @click="setPage(page - 1)">上一页</button><span>{{ page }} / {{ totalPages }}</span><button type="button" :disabled="page >= totalPages" @click="setPage(page + 1)">下一页</button></nav></section><aside class="reading-aside"><span class="eyebrow">留下一点自己的</span><strong>你的经历，<br>也值得被读到。</strong><p>一个遇到的问题、一段解决过程，先在讨论里写下来。有人会从你的经验开始下一步。</p><router-link to="/community?compose=1">去分享一段经历 ↗</router-link><div class="aside-rule"><span>在场</span><span>话题与作品社区</span></div></aside></div>
      </template>
      <div v-else class="reading-state empty-state"><strong>{{ keyword ? '没有找到匹配的文章' : '文章还在路上' }}</strong><span>{{ keyword ? '换个关键词试试。' : '先去社区聊聊，把经验留给下一位路过的人。' }}</span><button v-if="keyword" type="button" @click="clearSearch">清除搜索 ↗</button><router-link v-else to="/community">去社区看看 ↗</router-link></div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'
import { getPublishedProjectReadingGuides } from '@/api/project'

const route = useRoute()
const router = useRouter()
const pageSize = 9
const page = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1))
const keyword = computed(() => typeof route.query.keyword === 'string' ? route.query.keyword.trim() : '')
const view = computed(() => route.query.tab === 'projects' ? 'projects' : 'articles')
const searchDraft = ref(keyword.value)
const articles = ref([])
const guides = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const guideLoading = ref(false)
const guideError = ref(false)
let requestId = 0
let guideRequestId = 0
const featured = computed(() => articles.value[0] || null)
const rest = computed(() => articles.value.slice(1))
const filteredGuides = computed(() => guides.value.filter((guide) => !keyword.value || [guide.fullName, guide.description, guide.readingGuideHook, guide.readingGuidePurpose, guide.sourceName, guide.language].filter(Boolean).join(' ').toLowerCase().includes(keyword.value.toLowerCase())))
const featuredGuide = computed(() => filteredGuides.value[0] || null)
const otherGuides = computed(() => filteredGuides.value.slice(1))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const articleGlyph = (title) => ['迁', '幂', '查'].find((character) => title?.includes(character)) || title?.match(/[\u4e00-\u9fff]/)?.[0] || title?.[0] || '读'
const guideGlyph = (name) => name?.split('/').filter(Boolean).at(-1)?.slice(0, 1)?.toUpperCase() || '读'
const guideTeaser = (guide) => guide.readingGuideHook || guide.readingGuidePurpose || guide.description || '从它的代码和公开资料开始，看看这个项目如何处理真实问题。'

function navigate(overrides = {}) {
  const next = { keyword: keyword.value, page: page.value, ...overrides }
  router.push({ path: '/reading', query: { tab: view.value === 'projects' ? 'projects' : undefined, keyword: next.keyword || undefined, page: view.value === 'articles' && next.page > 1 ? String(next.page) : undefined } })
}
const submitSearch = () => navigate({ keyword: searchDraft.value.trim(), page: 1 })
const clearSearch = () => navigate({ keyword: '', page: 1 })
const setPage = (value) => navigate({ page: value })

async function loadArticles() {
  const id = ++requestId
  loading.value = true
  error.value = false
  try {
    const result = await fetchDiscoveryGroup('article', { page: page.value, size: pageSize, keyword: keyword.value })
    if (id !== requestId) return
    articles.value = result.records
    total.value = result.total
    if (page.value > Math.max(1, Math.ceil(result.total / pageSize))) navigate({ page: 1 })
  } catch {
    if (id !== requestId) return
    articles.value = []
    total.value = 0
    error.value = true
  } finally {
    if (id === requestId) loading.value = false
  }
}

async function loadGuides() {
  const id = ++guideRequestId
  guideLoading.value = true
  guideError.value = false
  try {
    const result = await getPublishedProjectReadingGuides()
    if (id !== guideRequestId) return
    guides.value = Array.isArray(result) ? result : []
  } catch {
    if (id !== guideRequestId) return
    guides.value = []
    guideError.value = true
  } finally {
    if (id === guideRequestId) guideLoading.value = false
  }
}

watch(() => route.fullPath, () => {
  searchDraft.value = keyword.value
  if (view.value === 'projects') loadGuides()
  else loadArticles()
}, { immediate: true })
</script>

<style scoped>
.reading-page { min-height: 100vh; background: #f7f4ed; color: var(--portal-text); font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.reading-page h1, .reading-page h2, .reading-page h3 { font-family: inherit; }
.eyebrow { color: var(--portal-accent); font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.reading-masthead { border-bottom: 1px solid #dfd9cc; background: #fffdf8; }
.masthead-inner { display: flex; justify-content: space-between; align-items: center; gap: 35px; max-width: 1360px; min-height: 300px; margin: 0 auto; padding: 52px 42px; }
.masthead-inner h1 { margin: 16px 0 15px; font-size: clamp(48px, 5.5vw, 78px); font-weight: 850; letter-spacing: -.085em; line-height: 1.15; }
.masthead-inner h1 span { color: var(--portal-accent); }
.masthead-inner p { max-width: 620px; margin: 0; color: #747b7d; font-size: 14px; line-height: 1.9; }
.masthead-mark { display: flex; align-items: center; flex-direction: column; gap: 8px; flex: 0 0 auto; padding-right: 18px; color: #bdc3ba; }
.masthead-mark span { font-family: 'Songti SC', serif; font-size: 170px; font-weight: 900; line-height: 1; opacity: .5; }
.masthead-mark small { color: #8a918c; font-size: 10px; letter-spacing: .14em; }
.reading-main { max-width: 1360px; margin: 0 auto; padding: 0 42px 100px; }
.reading-tabs { display: flex; gap: 28px; border-bottom: 1px solid #ded9ce; padding-top: 21px; }
.reading-tabs a { display: inline-flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent; padding: 0 1px 13px; color: #858b88; font-size: 12px; font-weight: 750; }
.reading-tabs a.active { border-color: var(--portal-accent); color: var(--portal-text); }
.tab-count { border-radius: 20px; padding: 2px 7px; background: #e9e5d9; color: #74796f; font-size: 10px; }
.reading-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-bottom: 1px solid #ded9ce; padding: 21px 0; color: #777f7f; font-size: 11px; font-weight: 750; letter-spacing: .04em; }
.reading-search { display: flex; align-items: center; width: 270px; border-bottom: 1px solid #9fa7a2; }
.reading-search input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 8px 0; color: var(--portal-text); background: transparent; font: inherit; font-size: 12px; }
.reading-search button { border: 0; color: var(--portal-accent); background: transparent; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.feature { display: grid; grid-template-columns: minmax(0, .94fr) minmax(0, 1.06fr); gap: clamp(32px, 6vw, 88px); align-items: center; padding: 53px 0 66px; }
.feature-cover { position: relative; display: grid; place-items: center; min-height: 370px; overflow: hidden; background: #b84d42; color: #fff7e8; }
.feature-cover::before { position: absolute; inset: 24px; border: 1px solid #f8dfc285; content: ''; }
.feature-cover::after { position: absolute; right: -80px; bottom: -80px; width: 260px; height: 260px; border: 1px solid #f8dfc280; border-radius: 50%; content: ''; }
.cover-corner { position: absolute; top: 46px; left: 46px; font-size: 11px; font-weight: 750; letter-spacing: .15em; }
.cover-glyph { position: relative; z-index: 1; font-family: 'Songti SC', serif; font-size: clamp(150px, 16vw, 225px); font-weight: 900; line-height: 1; }
.cover-bottom { position: absolute; right: 45px; bottom: 43px; left: 45px; display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; letter-spacing: .11em; }
.cover-bottom b { font-size: 20px; font-weight: 400; }
.feature-copy { max-width: 550px; }
.feature-category { display: block; width: fit-content; margin: 35px 0 16px; border: 1px solid #c6bdb1; padding: 6px 10px; color: #7d6c60; font-size: 11px; }
.feature-copy h2 { margin: 0; font-size: clamp(34px, 3.7vw, 54px); font-weight: 800; letter-spacing: -.06em; line-height: 1.27; }
.feature-copy p { max-width: 480px; margin: 21px 0; color: #6b7477; font-size: 15px; line-height: 1.9; }
.feature-meta { display: flex; gap: 15px; border-top: 1px solid #dcd5c8; padding: 16px 0; color: #8a8b86; font-size: 11px; }
.feature-meta span + span::before { margin-right: 15px; content: '·'; }
.feature-copy > a { display: inline-flex; justify-content: space-between; gap: 44px; margin-top: 12px; border-radius: 6px; padding: 13px 17px; background: var(--portal-text); color: #fff; font-size: 12px; font-weight: 760; }
.guide-feature { display: grid; grid-template-columns: minmax(270px, .8fr) minmax(0, 1.2fr); gap: clamp(30px, 6vw, 82px); align-items: center; border-bottom: 1px solid #ded9ce; padding: 46px 0 58px; }
.guide-feature-art { position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; min-height: 310px; overflow: hidden; background: #244648; color: #f6f2e8; }
.guide-feature-art::before { position: absolute; inset: 18px; border: 1px solid #adc0ad55; content: ''; }
.guide-feature-art::after { position: absolute; right: -45px; bottom: -100px; width: 230px; height: 230px; border: 1px solid #d9b99d75; border-radius: 50%; content: ''; }
.guide-feature-art span, .guide-feature-art small { position: absolute; z-index: 1; left: 38px; color: #c9d6ca; font-size: 10px; font-weight: 750; letter-spacing: .13em; }
.guide-feature-art span { top: 37px; }.guide-feature-art small { bottom: 36px; color: #e4c5a9; letter-spacing: .06em; }
.guide-feature-art strong { position: relative; z-index: 1; font-family: 'Songti SC', serif; font-size: clamp(110px, 14vw, 180px); line-height: 1; }
.guide-feature-copy { max-width: 610px; }
.guide-feature-copy h2 { margin: 14px 0; overflow-wrap: anywhere; font-size: clamp(34px, 4vw, 52px); letter-spacing: -.06em; line-height: 1.22; }
.guide-feature-copy > p { margin: 0; color: #6b7477; font-size: 15px; line-height: 1.9; }
.guide-feature-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 23px; border-top: 1px solid #dcd5c8; padding: 14px 0; color: #838985; font-size: 11px; }
.guide-feature-copy > a { display: inline-flex; gap: 40px; margin-top: 10px; border-radius: 4px; padding: 13px 17px; background: var(--portal-text); color: white; font-size: 12px; font-weight: 760; }
.guide-index { padding-top: 34px; }
.guide-index .index-heading { align-items: end; }
.guide-index h2 { max-width: 720px; }
.guide-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.guide-card { display: flex; min-height: 225px; flex-direction: column; border: 1px solid #ddd9cf; padding: 20px; background: #fffdf8; color: var(--portal-text); transition: transform .18s ease, box-shadow .18s ease; }
.guide-card:hover { transform: translateY(-3px); box-shadow: 0 9px 22px #27383b12; }
.guide-card-top, .guide-card-bottom { display: flex; justify-content: space-between; gap: 12px; color: #79827c; font-size: 10px; font-weight: 750; }
.guide-card h3 { margin: 28px 0 10px; overflow-wrap: anywhere; font-size: 20px; letter-spacing: -.035em; }
.guide-card p { display: -webkit-box; overflow: hidden; margin: 0 0 22px; color: #6e7778; font-size: 12px; line-height: 1.8; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.guide-card-bottom { margin-top: auto; border-top: 1px solid #e0ddd4; padding-top: 12px; font-weight: 650; }
.guide-card-bottom span:last-child { color: var(--portal-accent); font-weight: 800; }
.guide-empty { min-height: 260px; align-content: center; }
.guide-empty .eyebrow { color: var(--portal-accent); }
.guide-empty > strong { max-width: 660px; font-size: 29px; letter-spacing: -.04em; }
.guide-empty > span:not(.eyebrow) { max-width: 610px; line-height: 1.8; }
.reading-body { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 45px; border-top: 2px solid var(--portal-text); padding-top: 25px; }
.index-heading { display: flex; justify-content: space-between; align-items: end; gap: 12px; padding-bottom: 20px; }
.index-heading h2 { margin: 8px 0 0; font-size: 28px; font-weight: 800; letter-spacing: -.05em; }
.index-heading > span { color: #848b8b; font-size: 12px; }
.article-list { display: grid; }
.article-row { display: grid; grid-template-columns: 50px minmax(0, 1fr) 25px; gap: 16px; align-items: start; border-top: 1px solid #ddd9cf; padding: 25px 4px 28px; }
.article-row:last-child { border-bottom: 1px solid #ddd9cf; }
.article-number { color: var(--portal-accent); font-family: 'Songti SC', serif; font-size: 27px; }
.article-copy > span { color: #8c908d; font-size: 11px; }
.article-copy h3 { margin: 9px 0 6px; font-size: 23px; font-weight: 760; letter-spacing: -.03em; }
.article-copy p { display: -webkit-box; max-width: 650px; margin: 0; overflow: hidden; color: #6e7778; font-size: 12px; line-height: 1.8; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-arrow { color: var(--portal-accent); font-size: 18px; }
.reading-aside { align-self: start; padding: 24px; background: #eee8db; }
.reading-aside strong { display: block; margin-top: 20px; font-size: 22px; line-height: 1.5; }
.reading-aside p { color: #66716f; font-size: 12px; line-height: 1.9; }
.reading-aside > a { display: inline-block; margin-top: 15px; border-bottom: 1px solid var(--portal-accent); padding-bottom: 5px; color: var(--portal-accent); font-size: 12px; font-weight: 760; }
.aside-rule { display: flex; justify-content: space-between; gap: 10px; margin-top: 40px; border-top: 1px solid #d0c6b3; padding-top: 12px; color: #999080; font-size: 10px; }
.reading-state { display: grid; justify-items: start; gap: 13px; min-height: 240px; margin: 45px 0; padding: 36px; border: 1px solid #dfd9cd; background: #fffdf8; color: #6e7778; font-size: 13px; }
.reading-state strong { color: var(--portal-text); font-size: 22px; }
.reading-state button, .reading-state a, .index-empty a { border: 0; padding: 0; color: var(--portal-accent); background: none; font: inherit; font-weight: 760; cursor: pointer; }
.index-empty { display: flex; gap: 12px; border-top: 1px solid #ddd9cf; padding: 25px 0; color: #6e7778; font-size: 13px; }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 30px; color: #6e7778; font-size: 12px; }
.pager button { border: 1px solid #ddd9cf; padding: 9px 14px; background: #fffdf8; cursor: pointer; }
.pager button:disabled { opacity: .4; cursor: not-allowed; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 900px) { .masthead-inner, .reading-main { padding-right: 26px; padding-left: 26px; } .reading-body { grid-template-columns: minmax(0, 1fr) 220px; gap: 25px; } .guide-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .masthead-inner { min-height: 0; padding: 42px 18px; } .masthead-inner h1 { font-size: 46px; } .masthead-mark { display: none; } .reading-main { padding: 0 18px 70px; } .reading-toolbar { align-items: start; flex-direction: column; } .reading-search { width: 100%; } .feature { grid-template-columns: 1fr; gap: 30px; padding: 34px 0 50px; } .feature-cover { min-height: 300px; } .feature-copy h2 { font-size: 36px; } .feature-category { margin-top: 20px; } .reading-body { grid-template-columns: 1fr; } .reading-aside { grid-row: 1; } .guide-feature { grid-template-columns: 1fr; gap: 28px; padding: 30px 0 40px; }.guide-feature-art { min-height: 245px; }.guide-feature-copy h2 { font-size: 36px; }.guide-card-grid { grid-template-columns: 1fr; }.guide-index .index-heading { align-items: start; flex-direction: column; }.guide-card { min-height: 200px; } }
@media (prefers-reduced-motion: reduce) { .feature-cover { transition: none; } }
</style>
