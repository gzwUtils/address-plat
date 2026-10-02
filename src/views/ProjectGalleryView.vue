<template>
  <div class="project-page">
    <section class="project-hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">在场 / PROJECTS</span>
          <h1>把正在做的事，<br><em>拿出来看看。</em></h1>
          <p>一个想法、一款工具、一项正在推进的计划。看看别人在做什么，也让你的项目找到同行的人。</p>
          <div class="hero-actions"><a href="#project-collection">浏览项目 <span aria-hidden="true">↓</span></a><a href="#open-source">站外发现 ↓</a><router-link to="/project-studio">分享我的项目 ↗</router-link></div>
          <div class="hero-count" v-if="!loading && !error"><strong>{{ total }}</strong><span>个公开项目<br>正在被看见</span></div>
        </div>
        <router-link v-if="featured" class="spotlight" :to="`/project/${featured.id}`" :aria-label="`查看项目：${featured.projectName}`">
          <div class="spotlight-top"><span>FEATURED PROJECT</span><span>NO. {{ String((page - 1) * pageSize + 1).padStart(2, '0') }}</span></div>
          <div class="spotlight-paper"><span class="spotlight-stamp">在场<br>项目</span><span class="spotlight-name">{{ featured.shortName || featured.projectName }}</span><span class="spotlight-category">{{ featured.category || '项目档案' }}</span></div>
          <div class="spotlight-bottom"><span>{{ featured.projectName }}</span><span>打开档案 ↗</span></div>
        </router-link>
        <div v-else class="spotlight spotlight-empty"><span>PROJECT FILE / 在场</span><strong>下一个被看见的，<br>也许是你的项目。</strong><router-link to="/project-studio">分享项目 ↗</router-link></div>
      </div>
    </section>

    <main id="project-collection" class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-heading"><div><span class="eyebrow">项目索引 / 01</span><h2 id="catalog-title">看看大家在做什么</h2></div><span class="catalog-count" v-if="!loading && !error">{{ total }} 个项目</span></div>
      <div class="catalog-controls">
        <div class="category-list" aria-label="项目分类"><button type="button" :class="{ active: !category }" :aria-pressed="!category" @click="setCategory('')">全部项目</button><button v-for="item in categories" :key="item" type="button" :class="{ active: category === item }" :aria-pressed="category === item" @click="setCategory(item)">{{ item }}</button></div>
        <form class="project-search" role="search" @submit.prevent="submitSearch"><label class="sr-only" for="project-search-input">搜索项目</label><input id="project-search-input" v-model="searchDraft" type="search" placeholder="找项目、工具或负责人" /><button type="submit" aria-label="搜索项目">搜索 ↗</button></form>
      </div>
      <p v-if="keyword" class="search-note">正在查找「{{ keyword }}」<button type="button" @click="clearSearch">清除</button></p>
      <div v-if="loading" class="project-state">正在整理项目档案…</div>
      <div v-else-if="error" class="project-state" role="alert">项目暂时无法加载。<button type="button" @click="loadProjects">重试 ↗</button></div>
      <div v-else-if="projects.length" class="project-grid">
        <router-link v-for="(project, index) in projects" :key="project.id" class="project-tile" :to="`/project/${project.id}`">
          <div class="tile-art" :class="`tone-${index % 4}`"><span class="tile-no">{{ String((page - 1) * pageSize + index + 1).padStart(2, '0') }} / PROJECT</span><span class="tile-symbol">{{ project.shortName || project.projectName }}</span><span class="tile-corner" aria-hidden="true">↗</span></div>
          <div class="tile-copy"><span class="tile-category">{{ project.category || '项目' }}</span><h3>{{ project.projectName }}</h3><p>{{ project.description || project.type || '打开项目档案，看看它正在做什么。' }}</p><div class="tile-foot"><span>{{ project.ownerName || '项目分享' }}</span><span>查看项目 ↗</span></div></div>
        </router-link>
      </div>
      <div v-else class="project-state empty-state"><strong>{{ keyword || category ? '没有找到匹配的项目' : '项目簿还在等待第一位分享者' }}</strong><span>{{ keyword || category ? '换个关键词或分类再试试。' : '把正在做的事放上来，让更多人看到。' }}</span><button v-if="keyword || category" type="button" @click="clearFilters">清除筛选 ↗</button><router-link v-else to="/project-studio">分享项目 ↗</router-link></div>
      <nav v-if="totalPages > 1 && !loading && !error" class="pager" aria-label="项目分页"><button type="button" :disabled="page <= 1" @click="setPage(page - 1)">上一页</button><span>{{ page }} / {{ totalPages }}</span><button type="button" :disabled="page >= totalPages" @click="setPage(page + 1)">下一页</button></nav>
    </main>

    <section id="open-source" class="open-source" aria-labelledby="open-source-title">
      <div class="open-source-inner">
        <div class="open-source-heading"><div><span class="eyebrow">站外项目 / SOURCES</span><h2 id="open-source-title">看看世界正在做什么。</h2><p>来自管理员配置的公开来源。带着问题去看项目，也把学到的东西带回论坛。</p></div><span class="source-time" v-if="openSource.length">最近收录 {{ lastSyncedDate }}</span></div>
        <div v-if="openSourceLoading" class="open-source-state">正在整理本期站外项目…</div>
        <div v-else-if="openSourceError" class="open-source-state" role="alert">站外项目暂时无法加载。<button type="button" @click="loadOpenSource">重试 ↗</button></div>
        <div v-else-if="openSource.length" class="open-source-grid">
          <a v-for="(repository, index) in openSource" :key="`${repository.sourcePlatform}-${repository.sourceRepoId}`" class="source-card" :href="repository.sourceUrl" target="_blank" rel="noopener noreferrer" :aria-label="`在原站查看 ${repository.fullName}`"><div class="source-card-top"><span>{{ String(index + 1).padStart(2, '0') }} / {{ repository.sourceName || repository.sourcePlatform }}</span><span>↗</span></div><h3>{{ repository.fullName }}</h3><p>{{ repository.description || '打开原站，查看项目说明。' }}</p><div class="source-card-bottom"><span v-if="repository.language">{{ repository.language }}</span><span v-if="repository.starCount">★ {{ formatStars(repository.starCount) }}</span><span v-if="repository.licenseSpdx">{{ repository.licenseSpdx }}</span><span v-if="!repository.licenseSpdx">许可证以原站为准</span></div></a>
        </div>
        <div v-else class="open-source-state">这期精选还在整理中。稍后再来看看。</div>
        <p class="source-note">来源与更新节奏由管理员配置。这里仅展示摘要与原站链接；项目内容和许可证请以原站为准。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getOpenSourceProjects } from '@/api/project'
import { fetchDiscoveryGroup } from '@/composables/useResourceDiscovery'

const route = useRoute()
const router = useRouter()
const pageSize = 12
const page = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1))
const keyword = computed(() => typeof route.query.keyword === 'string' ? route.query.keyword.trim() : '')
const category = computed(() => typeof route.query.category === 'string' ? route.query.category.trim() : '')
const searchDraft = ref(keyword.value)
const categories = ref([])
const projects = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const openSource = ref([])
const openSourceLoading = ref(true)
const openSourceError = ref(false)
let requestId = 0
const featured = computed(() => projects.value[0] || null)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const syncDate = (value) => {
  if (!value) return '近期'
  const date = new Date(String(value).endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10)
    : new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
const lastSyncedDate = computed(() => syncDate(openSource.value.map((item) => item.syncedAt || '').sort().at(-1)))
const formatStars = (value) => Number(value || 0).toLocaleString('en-US')

async function loadOpenSource() {
  openSourceLoading.value = true
  openSourceError.value = false
  try {
    const result = await getOpenSourceProjects()
    if (!Array.isArray(result)) throw new Error('站外项目接口返回格式不正确')
    openSource.value = result
  } catch {
    openSourceError.value = true
  } finally {
    openSourceLoading.value = false
  }
}

function navigate(overrides = {}) {
  const next = { keyword: keyword.value, category: category.value, page: page.value, ...overrides }
  router.push({ path: '/projects', query: { keyword: next.keyword || undefined, category: next.category || undefined, page: next.page > 1 ? String(next.page) : undefined } })
}
const setCategory = (value) => navigate({ category: value, page: 1 })
const submitSearch = () => navigate({ keyword: searchDraft.value.trim(), page: 1 })
const clearSearch = () => navigate({ keyword: '', page: 1 })
const clearFilters = () => navigate({ keyword: '', category: '', page: 1 })
const setPage = (value) => navigate({ page: value })

async function loadProjects() {
  const id = ++requestId
  loading.value = true
  error.value = false
  try {
    const result = await fetchDiscoveryGroup('project', { page: page.value, size: pageSize, keyword: keyword.value, category: category.value })
    if (id !== requestId) return
    projects.value = result.records
    total.value = result.total
    if (page.value > Math.max(1, Math.ceil(result.total / pageSize))) navigate({ page: 1 })
  } catch {
    if (id !== requestId) return
    projects.value = []
    total.value = 0
    error.value = true
  } finally {
    if (id === requestId) {
      loading.value = false
      if (['#project-collection', '#open-source'].includes(window.location.hash)) {
        nextTick(() => document.querySelector(window.location.hash)?.scrollIntoView())
      }
    }
  }
}

getCategories().then((items) => { categories.value = Array.isArray(items) ? items : [] }).catch(() => {})
loadOpenSource()
watch(() => route.fullPath, () => { searchDraft.value = keyword.value; loadProjects() }, { immediate: true })
</script>

<style scoped>
.project-page { min-height: 100vh; background: var(--portal-bg); color: var(--portal-text); font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.project-page h1, .project-page h2, .project-page h3 { font-family: inherit; }
.project-hero { overflow: hidden; background: var(--home-project, #1d4468); color: #fff; }
.hero-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(335px, .78fr); align-items: center; gap: clamp(35px, 5vw, 85px); max-width: 1360px; min-height: 560px; margin: 0 auto; padding: 68px 42px 70px; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: .13em; }
.hero-copy .eyebrow { color: #a9c8d5; }
.hero-copy h1 { margin: 24px 0 20px; font-size: clamp(43px, 4.4vw, 68px); line-height: 1.15; letter-spacing: -.075em; font-weight: 850; }
.hero-copy h1 em { color: #f0c7a9; font-style: normal; }
.hero-copy p { max-width: 540px; color: #c3d3db; font-size: 15px; line-height: 1.9; }
.hero-actions { display: flex; align-items: center; gap: 24px; margin-top: 33px; font-size: 13px; font-weight: 750; }
.hero-actions a:first-child { display: flex; justify-content: space-between; gap: 38px; border-radius: 6px; padding: 14px 17px; background: #fffaf0; color: #213c4f; }
.hero-actions a:last-child { border-bottom: 1px solid #bad0d8; padding-bottom: 5px; }
.hero-actions a:nth-child(2) { border-bottom: 1px solid #bad0d8; padding-bottom: 5px; }
.hero-count { display: flex; align-items: center; gap: 15px; margin-top: 62px; color: #b8cbd4; font-size: 11px; line-height: 1.55; }
.hero-count strong { color: #fff; font-size: 42px; font-weight: 780; line-height: 1; }
.spotlight { display: flex; flex-direction: column; min-height: 410px; transform: rotate(2deg); border: 1px solid #9fb6bf; border-radius: 8px; padding: 18px; background: #e5e6da; color: #213b4f; box-shadow: 20px 21px 0 rgba(4, 22, 35, .22); transition: transform .2s ease; }
.spotlight:hover { transform: rotate(0); }
.spotlight-top, .spotlight-bottom { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.spotlight-paper { position: relative; display: grid; place-content: center; flex: 1; overflow: hidden; margin: 16px 0; border: 1px solid #b5c0bb; background: #faf8ef; text-align: center; }
.spotlight-paper::before { position: absolute; inset: 0; background-image: linear-gradient(#456b7b16 1px, transparent 1px), linear-gradient(90deg, #456b7b16 1px, transparent 1px); background-size: 31px 31px; content: ''; }
.spotlight-paper::after { position: absolute; right: -90px; bottom: -130px; width: 290px; height: 290px; border: 18px solid #b84e43; border-radius: 50%; content: ''; }
.spotlight-stamp { position: relative; z-index: 1; display: grid; place-items: center; width: 54px; height: 54px; margin: 0 auto 21px; border: 2px solid #b84e43; border-radius: 50%; color: #b84e43; font-family: 'Songti SC', serif; font-size: 13px; font-weight: 850; line-height: 1.1; }
.spotlight-name { position: relative; z-index: 1; max-width: 360px; padding: 0 16px; overflow-wrap: anywhere; font-family: 'Songti SC', serif; font-size: clamp(35px, 4vw, 55px); font-weight: 900; letter-spacing: -.08em; }
.spotlight-category { position: relative; z-index: 1; margin-top: 18px; color: #7e8b8b; font-size: 12px; }
.spotlight-bottom { align-items: end; letter-spacing: 0; }
.spotlight-bottom span:first-child { font-size: 18px; }
.spotlight-empty { justify-content: center; gap: 24px; transform: none; }
.spotlight-empty strong { font-size: 28px; }
.spotlight-empty a { border-bottom: 1px solid currentColor; align-self: start; }
.catalog { scroll-margin-top: 92px; max-width: 1360px; margin: 0 auto; padding: 62px 42px 90px; }
.open-source { scroll-margin-top: 92px; background: #e7ebe8; }
.open-source-inner { max-width: 1360px; margin: 0 auto; padding: 76px 42px 84px; }
.open-source-heading { display: flex; align-items: end; justify-content: space-between; gap: 25px; border-bottom: 2px solid #263f43; padding-bottom: 28px; }
.open-source-heading .eyebrow { color: #436e5d; }
.open-source-heading h2 { margin: 10px 0 13px; font-size: clamp(31px, 3.6vw, 47px); letter-spacing: -.055em; }
.open-source-heading p { max-width: 700px; margin: 0; color: #647270; font-size: 13px; line-height: 1.8; }
.source-time { flex: 0 0 auto; color: #6d7978; font-size: 11px; }
.open-source-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 24px; }
.source-card { display: flex; flex-direction: column; min-height: 240px; border: 1px solid #cbd5d1; border-radius: 7px; padding: 24px; background: #f8f9f5; color: #27383b; transition: transform .2s ease, box-shadow .2s ease; }
.source-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px #2b45431a; }
.source-card:first-child { grid-column: span 2; background: #244648; color: #fff; }
.source-card-top, .source-card-bottom { display: flex; justify-content: space-between; gap: 12px; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.source-card h3 { margin: 25px 0 10px; overflow-wrap: anywhere; font-size: 23px; letter-spacing: -.04em; }
.source-card:first-child h3 { font-size: 31px; }
.source-card p { display: -webkit-box; overflow: hidden; margin: 0 0 26px; color: #697677; font-size: 12px; line-height: 1.8; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.source-card:first-child p { color: #c8dcda; }
.source-card-bottom { justify-content: flex-start; gap: 17px; margin-top: auto; border-top: 1px solid currentColor; padding-top: 13px; opacity: .7; letter-spacing: 0; }
.open-source-state { display: flex; gap: 15px; align-items: center; min-height: 120px; color: #647270; font-size: 13px; }
.open-source-state button { border: 0; color: #2f6b57; background: none; font: inherit; font-weight: 800; cursor: pointer; }
.source-note { margin: 22px 0 0; color: #73817d; font-size: 11px; line-height: 1.7; }
.catalog-heading { display: flex; justify-content: space-between; align-items: end; gap: 16px; }
.catalog-heading .eyebrow { color: var(--portal-accent); }
.catalog-heading h2 { margin: 8px 0 0; font-size: clamp(30px, 3.4vw, 42px); font-weight: 820; letter-spacing: -.055em; }
.catalog-count { color: var(--portal-text-soft); font-size: 13px; }
.catalog-controls { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin: 29px 0 0; border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); padding: 14px 0; }
.category-list { display: flex; gap: 7px; overflow-x: auto; }
.category-list button { flex-shrink: 0; border: 1px solid transparent; border-radius: 100px; padding: 8px 13px; color: var(--portal-text-soft); background: transparent; font: inherit; font-size: 12px; cursor: pointer; }
.category-list button.active { border-color: #b9c8c4; background: #e6eeea; color: #2d5a48; font-weight: 750; }
.project-search { display: flex; flex: 0 0 255px; border: 1px solid var(--portal-line); border-radius: 6px; background: #fff; }
.project-search input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 9px 11px; background: transparent; font: inherit; font-size: 12px; }
.project-search button { flex-shrink: 0; border: 0; padding: 0 11px; background: transparent; color: var(--portal-accent); font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; }
.search-note { color: var(--portal-text-soft); font-size: 12px; }
.search-note button { margin-left: 9px; border: 0; color: var(--portal-accent); background: transparent; cursor: pointer; }
.project-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 25px; }
.project-tile { min-width: 0; overflow: hidden; border: 1px solid var(--portal-line); border-radius: 9px; background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.project-tile:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(27, 45, 51, .08); }
.tile-art { position: relative; display: grid; place-items: center; height: 165px; overflow: hidden; background: #dfe9e6; color: #2e5d58; }
.tile-art::before { position: absolute; inset: 0; background: radial-gradient(circle at 80% 10%, #ffffffa0 0 11%, transparent 11.5%), repeating-linear-gradient(0deg, transparent 0 18px, #ffffff3c 18px 19px); content: ''; }
.tile-art.tone-1 { background: #e9e4d9; color: #8a583e; }
.tile-art.tone-2 { background: #dbe6ed; color: #284f6b; }
.tile-art.tone-3 { background: #eae1df; color: #9c4b43; }
.tile-no { position: absolute; top: 17px; left: 19px; font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.tile-symbol { position: relative; z-index: 1; max-width: 86%; overflow: hidden; font-family: 'Songti SC', serif; font-size: clamp(30px, 3vw, 43px); font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
.tile-corner { position: absolute; right: 18px; bottom: 13px; font-size: 21px; }
.tile-copy { padding: 22px; }
.tile-category { color: var(--portal-accent); font-size: 11px; font-weight: 800; }
.tile-copy h3 { margin: 8px 0; font-size: 22px; font-weight: 790; }
.tile-copy p { display: -webkit-box; min-height: 44px; margin: 0; overflow: hidden; color: var(--portal-text-soft); font-size: 12px; line-height: 1.8; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.tile-foot { display: flex; justify-content: space-between; gap: 10px; margin-top: 23px; border-top: 1px solid var(--portal-line); padding-top: 13px; color: var(--portal-text-soft); font-size: 11px; }
.tile-foot span:last-child { color: var(--portal-accent); font-weight: 750; white-space: nowrap; }
.project-state { display: grid; justify-items: start; gap: 12px; min-height: 250px; margin-top: 25px; padding: 35px; border: 1px solid var(--portal-line); background: #fff; color: var(--portal-text-soft); }
.project-state strong { color: var(--portal-text); font-size: 22px; }
.project-state button, .project-state a { border: 0; padding: 0; background: none; color: var(--portal-accent); font: inherit; font-weight: 750; cursor: pointer; }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 30px; color: var(--portal-text-soft); font-size: 12px; }
.pager button { border: 1px solid var(--portal-line); padding: 9px 14px; background: #fff; cursor: pointer; }
.pager button:disabled { opacity: .4; cursor: not-allowed; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 900px) { .hero-inner { grid-template-columns: 1fr 300px; padding: 56px 26px; gap: 28px; } .catalog { padding: 52px 26px 75px; } .project-grid, .open-source-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .open-source-inner { padding: 60px 26px; } }
@media (max-width: 700px) { .hero-inner { grid-template-columns: 1fr; min-height: 0; padding: 45px 18px; } .hero-copy h1 { font-size: 42px; } .hero-actions { flex-wrap: wrap; gap: 18px; } .hero-count { margin-top: 35px; } .spotlight { min-height: 290px; transform: none; box-shadow: none; } .catalog { padding: 42px 18px 65px; } .catalog-controls { align-items: stretch; flex-direction: column; } .category-list { width: 100%; } .project-search { flex: none; width: 100%; } .project-grid, .open-source-grid { grid-template-columns: 1fr; } .open-source-inner { padding: 55px 18px; } .open-source-heading { align-items: start; flex-direction: column; } .source-card:first-child { grid-column: auto; } }
@media (prefers-reduced-motion: reduce) { .spotlight, .project-tile { transition: none; } }
</style>
