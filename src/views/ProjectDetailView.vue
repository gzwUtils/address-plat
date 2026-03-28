<template>
  <div class="detail-page">
    <section v-if="project" class="detail-shell">
      <div class="detail-top">
        <el-button text @click="router.back()">返回</el-button>
        <div class="detail-badge">{{ project.category || '未分类' }}</div>
        <h1>{{ project.projectName }}</h1>
        <p>{{ project.description || '暂无描述' }}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <span>名称简写</span>
          <strong>{{ project.shortName || '未设置' }}</strong>
        </div>
        <div class="detail-card">
          <span>归属类型</span>
          <strong>{{ project.type || '未设置' }}</strong>
        </div>
      </div>

      <section class="section-card">
        <h2>访问地址</h2>
        <p class="accent-text">{{ project.platformUrl || '未配置' }}</p>
      </section>

      <section class="section-card">
        <h2>项目说明</h2>
        <p>{{ project.description || '该项目尚未补充更详细的门户说明。' }}</p>
      </section>

      <section v-if="relatedProjects.length > 0" class="section-card">
        <h2>相关推荐</h2>
        <div class="recommend-grid">
          <button
            v-for="item in relatedProjects"
            :key="item.id"
            type="button"
            class="recommend-card"
            @click="goToProject(item.id)"
          >
            <strong>{{ item.projectName }}</strong>
            <span>{{ item.category || item.type || '项目' }}</span>
          </button>
        </div>
      </section>

      <section v-if="recentItems.length > 0" class="section-card">
        <h2>最近浏览</h2>
        <div class="recommend-grid">
          <button
            v-for="item in recentItems"
            :key="`${item.kind}-${item.id}`"
            type="button"
            class="recommend-card"
            @click="goToHistory(item)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.subtitle }}</span>
          </button>
        </div>
      </section>

      <div class="detail-actions">
        <el-button type="primary" @click="openProject">打开项目</el-button>
        <el-button plain @click="addToGrowthCapsule">加入我的落地舱</el-button>
        <el-button plain @click="router.push('/project-studio')">进入项目管理台</el-button>
      </div>
    </section>

    <el-empty v-else description="未找到对应项目" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addGrowthCapsuleItem, getRecentViews, saveRecentView } from '@/api/content'
import { getCategories, getProjects } from '@/api/project'
import { getClientId } from '@/utils/clientId'
import { getRecentHistory, pushRecentHistory } from '@/utils/recentHistory'
import { getPortalUserId } from '@/utils/userIdentity'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const projectPool = ref([])
const recentItems = ref([])

const normalizeRecentItem = (item) => ({
  id: item.id ?? item.targetId,
  targetId: item.targetId ?? item.id,
  kind: item.kind,
  title: item.title,
  subtitle: item.subtitle
})

const filterCurrentRecent = (items) =>
  items.filter((entry) => !(entry.kind === 'project' && String(entry.targetId ?? entry.id) === String(route.params.id)))

const relatedProjects = computed(() =>
  projectPool.value
    .filter((item) => String(item.id) !== String(route.params.id))
    .filter((item) => item.category === project.value?.category)
    .slice(0, 3)
)

async function loadProject() {
  try {
    const categories = await getCategories()
    const categoryList = Array.isArray(categories) ? categories : []
    const groups = await Promise.all(categoryList.map((item) => getProjects(item)))
    const allProjects = groups.flat()
    projectPool.value = allProjects
    project.value = allProjects.find((item) => String(item.id) === String(route.params.id)) || null
    if (project.value) {
      const history = pushRecentHistory({
        id: project.value.id,
        kind: 'project',
        title: project.value.projectName,
        subtitle: project.value.category || project.value.type || '项目'
      })
      recentItems.value = filterCurrentRecent(history.map(normalizeRecentItem))
      try {
        await saveRecentView({
          clientId: getClientId(),
          kind: 'project',
          targetId: project.value.id,
          title: project.value.projectName,
          subtitle: project.value.category || project.value.type || '项目'
        })
        const remote = await getRecentViews(getClientId())
        recentItems.value = filterCurrentRecent(remote.map(normalizeRecentItem))
      } catch (syncError) {
        console.warn('同步项目最近浏览失败，使用本地记录兜底', syncError)
      }
    }
  } catch (error) {
    console.warn('加载项目详情失败', error)
  }
}

function openProject() {
  if (!project.value?.platformUrl) {
    ElMessage.warning('该项目未配置访问地址')
    return
  }
  window.open(project.value.platformUrl, '_blank', 'noopener,noreferrer')
}

function goToProject(id) {
  router.push(`/project/${id}`)
}

function goToHistory(item) {
  const targetId = item.targetId ?? item.id
  router.push(item.kind === 'project' ? `/project/${targetId}` : `/explore/${item.kind}/${targetId}`)
}

async function addToGrowthCapsule() {
  if (!project.value) {
    return
  }
  try {
    await addGrowthCapsuleItem({
      userId: getPortalUserId(),
      sourceKind: 'project',
      sourceId: project.value.id,
      title: project.value.projectName,
      subtitle: project.value.category || project.value.type || '项目',
      note: project.value.description || ''
    })
    ElMessage.success('已加入灵感落地舱')
    router.push('/growth-capsule')
  } catch (error) {
    console.warn('加入灵感落地舱失败', error)
    ElMessage.error('加入灵感落地舱失败')
  }
}

onMounted(async () => {
  recentItems.value = filterCurrentRecent(getRecentHistory().map(normalizeRecentItem))
  try {
    const remote = await getRecentViews(getClientId())
    recentItems.value = filterCurrentRecent(remote.map(normalizeRecentItem))
  } catch (error) {
    console.warn('读取项目最近浏览失败，沿用本地记录', error)
  }
  await loadProject()
})
</script>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
}

.detail-shell,
.detail-card,
.section-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  border-radius: 24px;
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.detail-shell {
  padding: 28px;
}

.detail-top h1 {
  margin: 16px 0 12px;
  font-size: clamp(32px, 5vw, 56px);
}

.detail-top p,
.section-card p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.9;
}

.detail-badge {
  display: inline-flex;
  margin-top: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.detail-card {
  padding: 18px;
}

.detail-card span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.detail-card strong {
  display: block;
  margin-top: 8px;
}

.section-card {
  margin-top: 20px;
  padding: 20px;
}

.section-card h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.accent-text {
  color: var(--portal-accent);
  word-break: break-all;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.recommend-card {
  text-align: left;
  padding: 16px;
  border: 1px solid var(--portal-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  cursor: pointer;
}

.recommend-card strong {
  display: block;
}

.recommend-card span {
  display: block;
  margin-top: 8px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

@media (max-width: 640px) {
  .detail-shell,
  .detail-card,
  .section-card {
    border-radius: 18px;
  }

  .detail-shell {
    padding: 18px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
