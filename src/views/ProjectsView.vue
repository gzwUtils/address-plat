<template>
  <div class="explore-page">
    <section class="intro-panel">
      <div>
        <span class="eyebrow">Explore</span>
        <h1>资源广场</h1>
        <p>
          统一浏览项目入口、笔记文章、AI 资产和生活化内容。搜索会从顶部头部栏透传到这里，
          先满足门户展示与筛选，再为后续接真实接口预留结构。
        </p>
      </div>
      <div class="intro-stats">
        <div v-for="item in introStats" :key="item.label" class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </section>

    <section class="filter-panel">
      <div class="filter-title">统一筛选</div>
      <div class="filter-meta">
        <el-tag type="info" effect="plain">关键词：{{ activeKeyword || '全部' }}</el-tag>
        <el-tag type="success" effect="plain">支持多内容域扩展</el-tag>
        <el-button type="primary" plain @click="$router.push('/project-studio')">
          管理项目导航
        </el-button>
        <el-button type="primary" plain @click="$router.push('/content-studio')">
          进入资源管理
        </el-button>
        <el-tag
          v-for="item in searchSummary"
          :key="item.key"
          type="warning"
          effect="plain"
        >
          {{ item.label }} {{ item.value }}
        </el-tag>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="content-tabs">
      <el-tab-pane label="项目导航" name="projects">
        <div class="content-card">
          <ProjectList />
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`笔记文章 (${filteredArticles.length})`" name="articles">
        <div class="content-card">
          <div class="card-header">
            <div>
              <h2>笔记文章</h2>
              <p>技术分享、项目复盘、故障记录、实践沉淀都可以在门户中归档。</p>
            </div>
          </div>
          <div class="article-grid">
            <article
              v-for="item in filteredArticles"
              :key="item.id"
              class="article-card clickable-card"
              @click="openDetail('article', item)"
            >
              <div v-if="item.coverImage" class="article-cover">
                <img :src="item.coverImage" :alt="item.title">
              </div>
              <div class="article-top">
                <el-tag effect="dark">{{ item.category }}</el-tag>
                <span>{{ item.date }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.excerpt }}</p>
              <div class="article-meta">
                <span>{{ item.author || '匿名作者' }}</span>
                <span>{{ estimateArticleMinutes(item) }} 分钟阅读</span>
                <span>{{ (item.tags || []).length }} 个标签</span>
              </div>
              <div class="card-tags">
                <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
              </div>
            </article>
          </div>
          <el-empty v-if="filteredArticles.length === 0" description="没有匹配到文章" />
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`AI 资产 (${filteredAiAssets.length})`" name="ai">
        <div class="content-card">
          <div class="card-header">
            <div>
              <h2>AI 资产中心</h2>
              <p>先把入口、描述、负责人和适用场景展示出来，后续再逐步打通接口和调用链路。</p>
            </div>
            <el-button type="primary" plain @click="$router.push('/ai-workspace')">
              进入管理视图
            </el-button>
          </div>
          <div class="asset-grid">
            <article
              v-for="item in filteredAiAssets"
              :key="item.id"
              class="asset-card clickable-card"
              @click="openDetail('ai', item)"
            >
              <div class="asset-head">
                <span class="asset-type">{{ item.type }}</span>
                <span class="asset-owner">{{ item.owner }}</span>
              </div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
              <div class="asset-subline">
                <span>状态 {{ statusLabelMap[item.status] }}</span>
                <span>{{ item.version }}</span>
              </div>
              <div class="card-tags">
                <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
              </div>
            </article>
          </div>
          <el-empty v-if="filteredAiAssets.length === 0" description="没有匹配到 AI 资产" />
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`生活灵感 (${filteredLifeFeeds.length})`" name="life">
        <div class="content-card">
          <div class="card-header">
            <div>
              <h2>生活灵感</h2>
              <p>门户不是纯工具面板，也可以承载团队公告、活动、值班提醒和轻内容。</p>
            </div>
          </div>
          <div class="life-grid">
            <article
              v-for="item in filteredLifeFeeds"
              :key="item.id"
              class="life-card clickable-card"
              @click="openDetail('life', item)"
            >
              <div class="life-badge">{{ item.type }}</div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
              <div class="life-footer">{{ item.meta }}</div>
            </article>
          </div>
          <el-empty v-if="filteredLifeFeeds.length === 0" description="没有匹配到生活内容" />
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectList from '@/components/ProjectList.vue'
import { usePortalContent } from '@/composables/usePortalContent'
import { contentKinds } from '@/data/portal-contract'
import { estimateReadingMinutes } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()

const activeTab = ref('projects')
const activeKeyword = computed(() => {
  const keyword = route.query.keyword
  return typeof keyword === 'string' ? keyword.trim() : ''
})

const {
  portalResources,
  filteredArticles,
  filteredAiAssets,
  filteredLifeFeeds,
  searchSummary
} = usePortalContent(activeKeyword)

const introStats = computed(() => [
  { value: '项目', label: '保留原入口聚合能力' },
  { value: `${portalResources.articles.length}`, label: '知识内容已纳入门户' },
  { value: `${portalResources.aiAssets.length}`, label: 'AI 资产可继续扩展' },
  { value: `${portalResources.lifeFeeds.length}`, label: '生活化内容增强温度' }
])

const statusLabelMap = {
  online: '在线',
  trial: '试运行',
  draft: '草稿'
}

const estimateArticleMinutes = (item) =>
  estimateReadingMinutes(item.contentBody || item.excerpt || item.title || '')

const openDetail = (mode, item) => {
  router.push(`/explore/${mode}/${item.id}`)
}

watch(activeKeyword, (keyword) => {
  if (!keyword) {
    return
  }

  if (filteredArticles.value.length > 0) {
    activeTab.value = 'articles'
    return
  }

  if (filteredAiAssets.value.length > 0) {
    activeTab.value = contentKinds.ai
    return
  }

  if (filteredLifeFeeds.value.length > 0) {
    activeTab.value = contentKinds.life
  }
})
</script>

<style scoped>
.explore-page {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro-panel,
.filter-panel,
.content-card {
  border: 1px solid var(--portal-line);
  border-radius: 24px;
  background: var(--portal-surface);
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.intro-panel {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 24px;
  padding: 28px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-panel h1 {
  margin: 16px 0 10px;
  font-size: clamp(30px, 4vw, 48px);
}

.intro-panel p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.intro-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.article-card,
.asset-card,
.life-card {
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.stat-card {
  padding: 20px;
}

.stat-value {
  color: var(--portal-accent-2);
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  margin-top: 8px;
  color: var(--portal-text-soft);
}

.filter-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
}

.filter-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.content-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: transparent;
}

.content-tabs :deep(.el-tabs__item) {
  color: var(--portal-text-soft);
}

.content-tabs :deep(.el-tabs__item.is-active) {
  color: var(--portal-accent);
}

.content-card {
  padding: 26px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.card-header p {
  margin: 0;
  color: var(--portal-text-soft);
}

.article-grid,
.asset-grid,
.life-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.article-card,
.asset-card,
.life-card {
  padding: 20px;
}

.article-cover {
  margin: -20px -20px 16px;
  overflow: hidden;
  border-radius: 20px 20px 16px 16px;
  aspect-ratio: 16 / 8;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.clickable-card {
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  border-color: rgba(89, 208, 255, 0.36);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
}

.article-top,
.asset-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.asset-subline {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  color: var(--portal-text-soft);
  font-size: 13px;
}

.article-card h3,
.asset-card h3,
.life-card h3 {
  margin: 14px 0 10px;
  font-size: 18px;
}

.article-card p,
.asset-card p,
.life-card p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.7;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.card-tags span,
.life-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
}

.asset-type {
  color: var(--portal-warm);
  font-weight: 600;
}

.life-footer {
  margin-top: 18px;
  color: #fff2d4;
  font-size: 13px;
}

@media (max-width: 980px) {
  .intro-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .intro-panel,
  .filter-panel,
  .content-card {
    padding: 18px;
    border-radius: 18px;
  }

  .filter-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .intro-stats {
    grid-template-columns: 1fr;
  }
}
</style>
