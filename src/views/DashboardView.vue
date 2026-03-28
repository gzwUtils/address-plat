<template>
  <div class="dashboard">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="eyebrow">Portal 2.0</span>
        <h1 class="hero-title">把项目入口、知识资产与 AI 生产力集中到一个生活化门户里。</h1>
        <p class="hero-desc">
          首页现在优先展示真实内容数据、最近动态和可直接进入的内容入口，不再只是静态演示海报。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push('/explore')">
            进入资源广场
          </el-button>
          <el-button size="large" plain @click="scrollToAi">
            查看 AI 能力
          </el-button>
        </div>
        <div class="hero-meta">
          <div v-for="item in metrics" :key="item.label" class="metric-card">
            <div class="metric-value">{{ item.value }}</div>
            <div class="metric-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="signal-card mission-card">
          <div class="signal-title">今日焦点</div>
          <ul>
            <li v-for="item in todayFocus" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="signal-grid">
          <button
            v-for="item in signalCards"
            :key="item.title"
            type="button"
            class="signal-card interactive-card"
            @click="openPath(item.path)"
          >
            <div class="signal-kicker">{{ item.kicker }}</div>
            <div class="signal-name">{{ item.title }}</div>
            <div class="signal-desc">{{ item.desc }}</div>
          </button>
        </div>
      </div>
    </section>

    <section class="section-grid">
      <article class="section-card">
        <div class="section-head">
          <h2>多内容门户</h2>
          <span>{{ usingFallback ? '当前展示本地兜底数据' : '当前展示后端实时数据' }}</span>
        </div>
        <div class="capability-list">
          <button
            v-for="item in contentScopes"
            :key="item.title"
            type="button"
            class="capability-item interactive-card"
            @click="openPath(item.path)"
          >
            <div class="capability-icon">{{ item.icon }}</div>
            <div>
              <div class="capability-title">{{ item.title }}</div>
              <div class="capability-desc">{{ item.desc }}</div>
            </div>
          </button>
        </div>
      </article>

      <article ref="aiSectionRef" class="section-card ai-card">
        <div class="section-head">
          <h2>AI 工作台建议</h2>
          <span>结合现有资源与运行状态动态展示</span>
        </div>
        <div class="ai-grid">
          <button
            v-for="item in aiCapabilities"
            :key="item.title"
            type="button"
            class="ai-item interactive-card"
            @click="openPath(item.path)"
          >
            <div class="ai-topline">{{ item.type }}</div>
            <div class="ai-title">{{ item.title }}</div>
            <div class="ai-desc">{{ item.desc }}</div>
            <div class="ai-tags">
              <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
            </div>
          </button>
        </div>
      </article>
    </section>

    <section class="showcase-grid">
      <article class="showcase-card">
        <div class="section-head">
          <h2>场景推荐</h2>
          <span>直接跳到对应资源或工作台</span>
        </div>
        <div class="scene-list">
          <button
            v-for="scene in aiScenes"
            :key="scene.name"
            type="button"
            class="scene-item interactive-card"
            @click="openPath(scene.path)"
          >
            <div class="scene-name">{{ scene.name }}</div>
            <div class="scene-desc">{{ scene.desc }}</div>
          </button>
        </div>
      </article>

      <article class="showcase-card warm-card">
        <div class="section-head">
          <h2>最近动态</h2>
          <span>来自后台操作日志与内容更新</span>
        </div>
        <div class="warm-content">
          <blockquote>
            {{ recentHeadline }}
          </blockquote>
          <div class="warm-pills">
            <span v-for="item in warmPills" :key="item">{{ item }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="section-card updates-card">
      <div class="section-head">
        <h2>最近更新文章</h2>
        <span>优先展示最新沉淀的内容</span>
      </div>
      <div class="updates-grid">
        <button
          v-for="item in recentArticles"
          :key="item.id"
          type="button"
          class="update-card interactive-card"
          @click="openPath(`/explore/article/${item.id}`)"
        >
          <div v-if="item.coverImage" class="update-cover">
            <img :src="item.coverImage" :alt="item.title">
          </div>
          <div class="update-body">
            <div class="update-meta">
              <span>{{ item.category || '文章' }}</span>
              <span>{{ item.date || '未设置日期' }}</span>
            </div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.excerpt || '暂无摘要' }}</p>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getContentResourcesWithFallback, getOpsWorkbench, getPortalOverview } from '@/api/content'

const router = useRouter()
const aiSectionRef = ref(null)
const usingFallback = ref(false)
const resources = ref([])
const recentLogs = ref([])
const baseOverview = ref({
  aiCapabilities: [],
  warmPills: []
})

const articles = computed(() => resources.value.filter((item) => item.kind === 'article'))
const aiAssets = computed(() => resources.value.filter((item) => item.kind === 'ai'))
const lifeFeeds = computed(() => resources.value.filter((item) => item.kind === 'life'))

const latestArticle = computed(() => articles.value[0] || null)
const latestAiAsset = computed(() => aiAssets.value[0] || null)
const latestLifeFeed = computed(() => lifeFeeds.value[0] || null)

const metrics = computed(() => [
  { value: `${resources.value.length}`, label: '已接入资源' },
  { value: `${aiAssets.value.length}`, label: 'AI 资产' },
  { value: `${recentLogs.value.length}`, label: '最近动态' }
])

const todayFocus = computed(() => {
  const items = []
  if (latestArticle.value) {
    items.push(`最新文章：${latestArticle.value.title}`)
  }
  if (latestAiAsset.value) {
    items.push(`重点 AI 资产：${latestAiAsset.value.name}`)
  }
  if (recentLogs.value[0]?.targetName) {
    items.push(`最近操作：${recentLogs.value[0].targetName}`)
  }
  return items.length ? items : ['内容接口已接入后，这里会显示真实焦点']
})

const signalCards = computed(() => [
  {
    kicker: 'Projects',
    title: '服务入口聚合',
    desc: `统一入口持续可用，当前资源总数 ${resources.value.length}。`,
    path: '/explore'
  },
  {
    kicker: 'Knowledge',
    title: latestArticle.value?.title || '笔记文章标签化',
    desc: latestArticle.value?.excerpt || '最近文章会出现在这里，并支持直接点进详情。',
    path: latestArticle.value ? `/explore/article/${latestArticle.value.id}` : '/explore'
  },
  {
    kicker: 'AI Hub',
    title: latestAiAsset.value?.name || 'AI 资产中心',
    desc: latestAiAsset.value?.desc || 'AI 资产、Skill、MCP 与工作流入口统一聚合。',
    path: latestAiAsset.value ? `/explore/ai/${latestAiAsset.value.id}` : '/ai-workspace'
  },
  {
    kicker: 'Life',
    title: latestLifeFeed.value?.title || '团队生活流',
    desc: latestLifeFeed.value?.desc || '公告、灵感和轻内容增强门户的人味。',
    path: latestLifeFeed.value ? `/explore/life/${latestLifeFeed.value.id}` : '/explore'
  }
])

const contentScopes = computed(() => [
  {
    icon: `${resources.value.length || 0}`.padStart(2, '0'),
    title: '统一资源广场',
    desc: `项目、文章、AI 和生活内容共 ${resources.value.length} 条，可统一浏览。`,
    path: '/explore'
  },
  {
    icon: `${articles.value.length || 0}`.padStart(2, '0'),
    title: '笔记文章',
    desc: latestArticle.value?.title ? `最近更新：${latestArticle.value.title}` : '技术分享、复盘、故障记录统一管理。',
    path: latestArticle.value ? `/explore/article/${latestArticle.value.id}` : '/content-studio'
  },
  {
    icon: `${aiAssets.value.length || 0}`.padStart(2, '0'),
    title: 'AI 资产',
    desc: latestAiAsset.value?.name ? `最近资产：${latestAiAsset.value.name}` : 'Agent、Skill、MCP、工作流模板。',
    path: latestAiAsset.value ? `/explore/ai/${latestAiAsset.value.id}` : '/ai-workspace'
  },
  {
    icon: `${lifeFeeds.value.length || 0}`.padStart(2, '0'),
    title: '生活空间',
    desc: latestLifeFeed.value?.title ? `最新动态：${latestLifeFeed.value.title}` : '公告、提醒、活动与灵感内容。',
    path: latestLifeFeed.value ? `/explore/life/${latestLifeFeed.value.id}` : '/explore'
  }
])

const aiCapabilities = computed(() => {
  const onlineAiCount = aiAssets.value.filter((item) => item.status === 'online').length
  const latestAiPath = latestAiAsset.value ? `/explore/ai/${latestAiAsset.value.id}` : '/ai-workspace'
  const defaults = [
    {
      type: 'Agent',
      title: '智能助手目录',
      desc: `当前已收录 ${aiAssets.value.length} 个 AI 资产，其中在线 ${onlineAiCount} 个。`,
      tags: ['真实计数', '统一入口', '资源卡片'],
      path: '/ai-workspace'
    },
    {
      type: latestAiAsset.value?.type || 'Skill',
      title: latestAiAsset.value?.name || 'Skill 能力市场',
      desc: latestAiAsset.value?.desc || '把常用技能包做成标签化资源，支持场景和维护人展示。',
      tags: latestAiAsset.value?.tags || ['可检索', '版本提示', '团队共享'],
      path: latestAiPath
    },
    {
      type: 'Workflow',
      title: '灵感落地舱',
      desc: '把浏览内容直接转成行动卡、状态和打卡记录。',
      tags: ['行动卡', '连续打卡', '原文跳转'],
      path: '/growth-capsule'
    }
  ]

  if (baseOverview.value.aiCapabilities?.length) {
    return baseOverview.value.aiCapabilities.map((item, index) => ({
      ...item,
      path: defaults[index]?.path || '/ai-workspace'
    }))
  }
  return defaults
})

const aiScenes = computed(() => [
  {
    name: '故障应急',
    desc: latestAiAsset.value ? `优先查看「${latestAiAsset.value.name}」的可用能力与接入方式。` : '通过 Agent + MCP 快速读取监控、日志和知识库建议。',
    path: latestAiAsset.value ? `/explore/ai/${latestAiAsset.value.id}` : '/ai-workspace'
  },
  {
    name: '新人 onboarding',
    desc: latestArticle.value ? `从文章「${latestArticle.value.title}」开始补齐上下文。` : '入口导航、岗位知识、常用 Skill、流程模板集中推荐。',
    path: latestArticle.value ? `/explore/article/${latestArticle.value.id}` : '/explore'
  },
  {
    name: '内容沉淀',
    desc: '直接进入内容工作台写文章，支持 Markdown 在线编辑与草稿恢复。',
    path: '/content-studio'
  },
  {
    name: '持续推进',
    desc: '将有价值的内容加入灵感落地舱，形成行动卡和连续打卡轨迹。',
    path: '/growth-capsule'
  }
])

const warmPills = computed(() => {
  if (recentLogs.value.length) {
    return recentLogs.value.slice(0, 6).map((item) => item.targetName || item.detail || item.module || '门户动态')
  }
  return baseOverview.value.warmPills?.length ? baseOverview.value.warmPills : ['内容更新', '最近浏览', '文章新增']
})

const recentHeadline = computed(() => {
  const latest = recentLogs.value[0]
  if (!latest) {
    return '首页已切到真实数据驱动，后续这里会持续展示后台最近操作和内容更新。'
  }
  return `最近一次后台动作：${latest.operatorName || 'system'} 在 ${latest.createTime || '刚刚'} ${latest.detail || '更新了内容'}。`
})

const recentArticles = computed(() => articles.value.slice(0, 3))

const scrollToAi = () => {
  aiSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const openPath = (path) => {
  if (!path) {
    return
  }
  router.push(path)
}

async function loadDashboard() {
  const [overviewData, contentResult, opsWorkbench] = await Promise.allSettled([
    getPortalOverview(),
    getContentResourcesWithFallback({ size: 200 }),
    getOpsWorkbench()
  ])

  if (overviewData.status === 'fulfilled') {
    baseOverview.value = overviewData.value || {}
  }

  if (contentResult.status === 'fulfilled') {
    resources.value = Array.isArray(contentResult.value.data) ? contentResult.value.data : []
    usingFallback.value = !!contentResult.value.fallback
  }

  if (opsWorkbench.status === 'fulfilled') {
    recentLogs.value = Array.isArray(opsWorkbench.value?.recentLogs) ? opsWorkbench.value.recentLogs : []
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.hero-panel,
.section-card,
.showcase-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.hero-panel {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 28px;
  padding: 32px;
  border-radius: 28px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-title {
  margin: 18px 0 14px;
  font-size: clamp(30px, 4vw, 56px);
  line-height: 1.1;
}

.hero-desc {
  max-width: 760px;
  color: var(--portal-text-soft);
  font-size: 16px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 26px;
}

.hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.metric-card,
.signal-card,
.ai-item,
.scene-item {
  border: 1px solid var(--portal-line);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
}

.interactive-card {
  width: 100%;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.interactive-card:hover {
  transform: translateY(-3px);
  border-color: rgba(89, 208, 255, 0.38);
  box-shadow: 0 18px 36px rgba(4, 14, 28, 0.2);
}

.metric-card {
  padding: 18px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
}

.metric-label {
  margin-top: 6px;
  color: var(--portal-text-soft);
}

.hero-visual {
  display: grid;
  gap: 16px;
}

.mission-card {
  padding: 22px;
}

.mission-card ul {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.signal-card {
  padding: 18px;
}

.signal-title,
.signal-kicker {
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.signal-name {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
}

.signal-desc {
  margin-top: 8px;
  color: var(--portal-text-soft);
  line-height: 1.6;
}

.section-grid,
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.section-card,
.showcase-card {
  border-radius: 24px;
  padding: 28px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.section-head h2 {
  margin: 0;
  font-size: 24px;
}

.section-head span {
  color: var(--portal-text-soft);
  font-size: 13px;
}

.capability-list,
.scene-list {
  display: grid;
  gap: 14px;
}

.capability-item {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 14px;
  align-items: start;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.capability-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #06111e;
  background: linear-gradient(135deg, var(--portal-accent), #8fffe4);
  font-weight: 700;
}

.capability-title,
.ai-title,
.scene-name {
  font-size: 16px;
  font-weight: 600;
}

.capability-desc,
.ai-desc,
.scene-desc {
  margin-top: 8px;
  color: var(--portal-text-soft);
  line-height: 1.7;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.ai-item {
  padding: 18px;
}

.ai-topline {
  color: var(--portal-warm);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.ai-tags span,
.warm-pills span {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--portal-text-soft);
  font-size: 12px;
}

.scene-item {
  padding: 18px;
}

.warm-card {
  background:
    radial-gradient(circle at top right, rgba(255, 196, 107, 0.16), transparent 30%),
    rgba(10, 29, 55, 0.9);
}

.warm-content blockquote {
  margin: 0;
  color: #fff2d4;
  font-size: 20px;
  line-height: 1.7;
}

.warm-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.updates-card {
  padding: 28px;
}

.updates-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.update-card {
  overflow: hidden;
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.update-cover {
  aspect-ratio: 16 / 8;
  overflow: hidden;
}

.update-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.update-body {
  padding: 18px;
}

.update-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.update-body strong {
  display: block;
  margin-top: 12px;
  font-size: 18px;
}

.update-body p {
  margin: 10px 0 0;
  color: var(--portal-text-soft);
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .hero-panel,
  .section-grid,
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-panel,
  .section-card,
  .showcase-card {
    padding: 20px;
    border-radius: 20px;
  }

  .hero-meta,
  .signal-grid,
  .ai-grid,
  .updates-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions,
  .section-head {
    flex-direction: column;
  }
}
</style>
