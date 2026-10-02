<template>
  <div class="reading-page">
    <header class="reading-masthead"><div class="masthead-inner"><div><span class="eyebrow">在场 / READING ROOM</span><h1>读点<span>有用的。</span></h1><p>实践、复盘和一路上想明白的事。花几分钟读完，也许下一步就有了方向。</p></div><div class="masthead-mark" aria-hidden="true"><span>读</span><small>01 — 经验留在这里</small></div></div></header>

    <main class="reading-main">
      <div class="reading-toolbar"><span>{{ keyword ? `搜索「${keyword}」` : '本期精选 · 来自真实分享' }}</span><form class="reading-search" role="search" @submit.prevent="submitSearch"><label class="sr-only" for="reading-search-input">搜索文章</label><input id="reading-search-input" v-model="searchDraft" type="search" placeholder="搜索标题或经验关键词" /><button type="submit">查找 ↗</button></form></div>
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
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'

const route = useRoute()
const router = useRouter()
const pageSize = 9
const page = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1))
const keyword = computed(() => typeof route.query.keyword === 'string' ? route.query.keyword.trim() : '')
const searchDraft = ref(keyword.value)
const articles = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
let requestId = 0
const featured = computed(() => articles.value[0] || null)
const rest = computed(() => articles.value.slice(1))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const articleGlyph = (title) => ['迁', '幂', '查'].find((character) => title?.includes(character)) || title?.match(/[\u4e00-\u9fff]/)?.[0] || title?.[0] || '读'

function navigate(overrides = {}) {
  const next = { keyword: keyword.value, page: page.value, ...overrides }
  router.push({ path: '/reading', query: { keyword: next.keyword || undefined, page: next.page > 1 ? String(next.page) : undefined } })
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
watch(() => route.fullPath, () => { searchDraft.value = keyword.value; loadArticles() }, { immediate: true })
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
@media (max-width: 900px) { .masthead-inner, .reading-main { padding-right: 26px; padding-left: 26px; } .reading-body { grid-template-columns: minmax(0, 1fr) 220px; gap: 25px; } }
@media (max-width: 700px) { .masthead-inner { min-height: 0; padding: 42px 18px; } .masthead-inner h1 { font-size: 46px; } .masthead-mark { display: none; } .reading-main { padding: 0 18px 70px; } .reading-toolbar { align-items: start; flex-direction: column; } .reading-search { width: 100%; } .feature { grid-template-columns: 1fr; gap: 30px; padding: 34px 0 50px; } .feature-cover { min-height: 300px; } .feature-copy h2 { font-size: 36px; } .feature-category { margin-top: 20px; } .reading-body { grid-template-columns: 1fr; } .reading-aside { grid-row: 1; } }
@media (prefers-reduced-motion: reduce) { .feature-cover { transition: none; } }
</style>
