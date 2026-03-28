<template>
  <div class="ops-page">
    <section class="hero-card">
      <div>
        <span class="eyebrow">Operations Workbench</span>
        <h1>运营工作台</h1>
        <p>
          把项目入口管理、AI 资产维护和统一资源运营集中到一个后台首页。
          先看全局态势，再进入对应管理台处理细项。
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ projectCount }}</div>
          <div class="stat-label">项目入口</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ aiCount }}</div>
          <div class="stat-label">AI 资产</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ contentCount }}</div>
          <div class="stat-label">统一内容</div>
        </div>
      </div>
    </section>

    <section class="panel-grid">
      <article class="panel-card spotlight-card">
        <div class="panel-head">
          <h2>工作台入口</h2>
          <span>按职责进入后台</span>
        </div>
        <div class="entry-grid">
          <button
            v-for="item in entryCards"
            :key="item.path"
            type="button"
            class="entry-card"
            @click="router.push(item.path)"
          >
            <div class="entry-kicker">{{ item.kicker }}</div>
            <div class="entry-title">{{ item.title }}</div>
            <div class="entry-desc">{{ item.desc }}</div>
            <div class="entry-meta">{{ item.meta }}</div>
          </button>
        </div>
      </article>

      <article class="panel-card">
        <div class="panel-head">
          <h2>今日建议</h2>
          <span>面向运营和维护的优先动作</span>
        </div>
        <div class="suggestion-list">
          <div v-for="item in suggestions" :key="item.title" class="suggestion-item">
            <div class="suggestion-top">
              <span class="suggestion-level">{{ item.level }}</span>
              <strong>{{ item.title }}</strong>
            </div>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="panel-grid">
      <article class="panel-card">
        <div class="panel-head">
          <h2>运营概览</h2>
          <span>管理层快速扫描</span>
        </div>
        <div class="overview-list">
          <div class="overview-item">
            <span>项目分类数</span>
            <strong>{{ categoryCount }}</strong>
          </div>
          <div class="overview-item">
            <span>在线 AI 资产</span>
            <strong>{{ onlineAiCount }}</strong>
          </div>
          <div class="overview-item">
            <span>文章内容数</span>
            <strong>{{ articleCount }}</strong>
          </div>
          <div class="overview-item">
            <span>生活内容数</span>
            <strong>{{ lifeCount }}</strong>
          </div>
        </div>
      </article>

      <article class="panel-card warm-card">
        <div class="panel-head">
          <h2>最近编辑记录</h2>
          <span>真实后台操作日志</span>
        </div>
        <div class="backlog-list">
          <div v-for="item in recentLogs" :key="item.id" class="backlog-item">
            <div class="log-top">
              <strong>{{ item.targetName || '未命名资源' }}</strong>
              <span>{{ item.createTime }}</span>
            </div>
            <div class="log-meta">{{ item.module }} / {{ item.action }} / {{ item.targetType }}</div>
            <div class="log-detail">{{ item.detail || '后台记录更新' }}</div>
          </div>
          <div v-if="recentLogs.length === 0" class="backlog-item">暂无后台操作记录</div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getProjects } from '@/api/project'
import { getOpsWorkbench } from '@/api/content'
import { portalResources } from '@/data/portal'

const router = useRouter()
const projectStats = ref({
  count: 0,
  categories: 0
})
const recentLogs = ref([])

const entryCards = [
  {
    kicker: 'Projects',
    title: '项目管理台',
    desc: '维护项目地址、分类、访问入口和项目描述。',
    meta: '适合项目入口维护',
    path: '/project-studio'
  },
  {
    kicker: 'AI',
    title: 'AI 资产中心',
    desc: '维护 Agent、Skill、MCP 和 OpenClaw 资产。',
    meta: '适合 AI 能力维护',
    path: '/ai-workspace'
  },
  {
    kicker: 'Content',
    title: '统一资源管理',
    desc: '维护文章、生活内容和门户运营素材。',
    meta: '适合内容运营维护',
    path: '/content-studio'
  }
]

const suggestions = [
  {
    level: 'High',
    title: '优先校准 AI 资产状态',
    desc: '建议先梳理在线、试运行、草稿三类 AI 资产，避免门户展示与真实能力不一致。'
  },
  {
    level: 'Medium',
    title: '补齐项目描述和简写',
    desc: '项目入口如果缺少描述或短名，会影响统一搜索和导航辨识度。'
  },
  {
    level: 'Medium',
    title: '持续更新生活内容',
    desc: '生活内容能显著改善门户温度，建议固定节奏维护公告、提醒和团队动态。'
  }
]

const aiCount = computed(() => portalResources.aiAssets.length)
const contentCount = computed(() => portalResources.articles.length + portalResources.lifeFeeds.length)
const projectCount = computed(() => projectStats.value.count)
const categoryCount = computed(() => projectStats.value.categories)
const onlineAiCount = computed(() => portalResources.aiAssets.filter((item) => item.status === 'online').length)
const articleCount = computed(() => portalResources.articles.length)
const lifeCount = computed(() => portalResources.lifeFeeds.length)

async function loadProjectStats() {
  try {
    const categories = await getCategories()
    const categoryList = Array.isArray(categories) ? categories : []
    const groups = await Promise.all(categoryList.map((item) => getProjects(item)))

    projectStats.value = {
      count: groups.flat().length,
      categories: categoryList.length
    }
  } catch (error) {
    console.warn('加载工作台项目统计失败', error)
    projectStats.value = {
      count: 0,
      categories: 0
    }
  }
}

async function loadWorkbench() {
  try {
    const data = await getOpsWorkbench()
    recentLogs.value = Array.isArray(data?.recentLogs) ? data.recentLogs : []
    if (typeof data?.projectCount === 'number') {
      projectStats.value.count = data.projectCount
    }
    if (typeof data?.categoryCount === 'number') {
      projectStats.value.categories = data.categoryCount
    }
  } catch (error) {
    console.warn('加载运营工作台数据失败', error)
  }
}

onMounted(() => {
  loadProjectStats()
  loadWorkbench()
})
</script>

<style scoped>
.ops-page {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.panel-card,
.entry-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  border-radius: 24px;
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.hero-card {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
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

.hero-card h1 {
  margin: 16px 0 10px;
  font-size: clamp(30px, 4vw, 48px);
}

.hero-card p,
.suggestion-item p,
.entry-desc {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.overview-item,
.suggestion-item,
.backlog-item {
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.stat-card {
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--portal-accent-2);
}

.stat-label {
  margin-top: 8px;
  color: var(--portal-text-soft);
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.panel-card {
  padding: 24px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 0;
  font-size: 24px;
}

.panel-head span {
  color: var(--portal-text-soft);
  font-size: 13px;
}

.entry-grid,
.suggestion-list,
.overview-list,
.backlog-list {
  display: grid;
  gap: 14px;
}

.entry-card {
  text-align: left;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.entry-card:hover {
  transform: translateY(-2px);
  border-color: rgba(89, 208, 255, 0.4);
}

.entry-kicker,
.suggestion-level {
  color: var(--portal-warm);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.entry-title {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
}

.entry-meta {
  margin-top: 12px;
  color: var(--portal-accent);
  font-size: 13px;
}

.suggestion-item,
.backlog-item,
.overview-item {
  padding: 18px;
}

.suggestion-top {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.overview-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-item span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.overview-item strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
}

.warm-card {
  background:
    radial-gradient(circle at top right, rgba(255, 196, 107, 0.14), transparent 34%),
    rgba(10, 29, 55, 0.92);
}

.log-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.log-top span,
.log-meta {
  color: var(--portal-text-soft);
  font-size: 12px;
}

.log-detail {
  margin-top: 8px;
  color: #fff2d4;
}

@media (max-width: 1080px) {
  .hero-card,
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-card,
  .panel-card,
  .entry-card {
    padding: 18px;
    border-radius: 18px;
  }

  .hero-stats,
  .overview-list {
    grid-template-columns: 1fr;
  }
}
</style>
