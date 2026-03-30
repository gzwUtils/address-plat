<template>
  <div class="studio-page">
    <section class="hero-card">
      <div>
        <span class="eyebrow">Project Studio</span>
        <h1>项目管理台</h1>
        <p>
          针对内部项目入口做集中维护，保留现有项目接口和分类结构，
          让项目导航管理和内容运营管理分层清晰。
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ projects.length }}</div>
          <div class="stat-label">项目总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ categories.length }}</div>
          <div class="stat-label">分类数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ filteredProjects.length }}</div>
          <div class="stat-label">当前结果</div>
        </div>
      </div>
    </section>

    <section class="control-card">
      <div class="control-row">
        <div class="control-left">
          <el-select v-model="activeCategory" placeholder="选择分类" class="category-select">
            <el-option label="全部分类" value="all" />
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索项目名称、描述、简写" class="keyword-input" clearable />
        </div>
        <el-button type="primary" @click="openCreateDialog">新增项目</el-button>
      </div>
    </section>

    <section class="project-layout">
      <div class="project-list">
        <article
          v-for="item in filteredProjects"
          :key="item.id"
          class="project-card"
          :class="{ selected: selectedProject?.id === item.id }"
          @click="selectedProject = item"
        >
          <div class="project-head">
            <div>
              <div class="project-badge">{{ item.category || '未分类' }}</div>
              <h3>{{ item.projectName }}</h3>
            </div>
            <div class="project-short">{{ item.shortName }}</div>
          </div>
          <p>{{ item.description || '暂无描述' }}</p>
          <div class="project-meta">
            <span>{{ item.type || '项目' }}</span>
            <span>{{ item.platformUrl || '未配置地址' }}</span>
          </div>
        </article>
        <el-empty v-if="filteredProjects.length === 0" description="没有匹配到项目" />
      </div>

      <aside v-if="selectedProject" class="detail-card">
        <div class="detail-top">
          <div class="detail-kicker">{{ selectedProject.category || '未分类' }}</div>
          <h2>{{ selectedProject.projectName }}</h2>
          <p>{{ selectedProject.description || '暂无描述' }}</p>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <span>名称简写</span>
            <strong>{{ selectedProject.shortName || '未设置' }}</strong>
          </div>
          <div class="detail-item">
            <span>归属类型</span>
            <strong>{{ selectedProject.type || '未设置' }}</strong>
          </div>
        </div>
        <div class="link-block">
          <h3>访问地址</h3>
          <a class="entry-link" :href="selectedProject.platformUrl" target="_blank" rel="noreferrer">
            {{ selectedProject.platformUrl || '未配置' }}
          </a>
        </div>
        <div class="detail-actions">
          <el-button type="primary" :icon="Link" @click="openProject(selectedProject)">打开项目</el-button>
          <el-button plain :icon="EditPen" @click="openEditDialog(selectedProject)">编辑</el-button>
          <el-button type="danger" plain :icon="Delete" @click="handleDelete(selectedProject)">删除</el-button>
        </div>
      </aside>
    </section>

    <ProjectForm
      v-model="dialogVisible"
      :project="editingProject"
      :existing-categories="categories"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, EditPen, Link } from '@element-plus/icons-vue'
import ProjectForm from '@/components/ProjectForm.vue'
import { deleteProject, getCategories, getProjects } from '@/api/project'

const projects = ref([])
const categories = ref([])
const selectedProject = ref(null)
const activeCategory = ref('all')
const keyword = ref('')
const dialogVisible = ref(false)
const editingProject = ref({})

const filteredProjects = computed(() =>
  projects.value.filter((item) => {
    const categoryMatch = activeCategory.value === 'all' || item.category === activeCategory.value
    const raw = [item.projectName, item.shortName, item.description, item.platformUrl].join(' ').toLowerCase()
    const keywordMatch = !keyword.value.trim() || raw.includes(keyword.value.trim().toLowerCase())
    return categoryMatch && keywordMatch
  })
)

watch(filteredProjects, (items) => {
  if (items.length === 0) {
    selectedProject.value = null
    return
  }

  if (!selectedProject.value || !items.some((item) => item.id === selectedProject.value.id)) {
    selectedProject.value = items[0]
  }
})

async function loadProjects() {
  try {
    const [categoryList, projectList] = await Promise.all([getCategories(), getProjects()])
    categories.value = Array.isArray(categoryList) ? categoryList : []
    projects.value = Array.isArray(projectList) ? projectList : []
  } catch (error) {
    console.warn('加载项目管理数据失败', error)
    ElMessage.error('加载项目数据失败')
  }
}

function openCreateDialog() {
  editingProject.value = {}
  dialogVisible.value = true
}

function openEditDialog(project) {
  editingProject.value = { ...project }
  dialogVisible.value = true
}

async function handleSaved() {
  await loadProjects()
  dialogVisible.value = false
  ElMessage.success('项目已更新')
}

async function handleDelete(project) {
  try {
    await ElMessageBox.confirm(`确认删除项目「${project.projectName}」？`, '提示', { type: 'warning' })
    await deleteProject(project.id)
    await loadProjects()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.warn('删除项目失败', error)
      ElMessage.error('删除失败')
    }
  }
}

function openProject(project) {
  if (!project.platformUrl) {
    ElMessage.warning('该项目未配置访问地址')
    return
  }
  window.open(project.platformUrl, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.studio-page {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.control-card,
.detail-card,
.project-card {
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
.project-card p,
.detail-top p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
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

.control-card {
  padding: 20px 24px;
}

.control-row,
.control-left {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.control-left {
  justify-content: flex-start;
}

.category-select {
  width: 200px;
}

.keyword-input {
  width: 300px;
}

.project-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
}

.project-list {
  display: grid;
  gap: 14px;
}

.project-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.project-card:hover,
.project-card.selected {
  transform: translateY(-2px);
  border-color: rgba(89, 208, 255, 0.4);
}

.project-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.project-badge {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
}

.project-head h3,
.detail-top h2 {
  margin: 12px 0 0;
  font-size: 22px;
}

.project-short {
  color: var(--portal-warm);
  font-size: 13px;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  color: var(--portal-text-soft);
  font-size: 13px;
}

.detail-card {
  padding: 24px;
  position: sticky;
  top: 104px;
  height: fit-content;
}

.detail-kicker {
  color: var(--portal-warm);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.detail-item {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--portal-line);
}

.detail-item span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.detail-item strong {
  display: block;
  margin-top: 8px;
}

.link-block {
  margin-top: 24px;
}

.link-block h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.entry-link {
  color: var(--portal-accent);
  word-break: break-all;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 1080px) {
  .hero-card,
  .project-layout {
    grid-template-columns: 1fr;
  }

  .detail-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .hero-card,
  .control-card,
  .detail-card,
  .project-card {
    padding: 18px;
    border-radius: 18px;
  }

  .hero-stats,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .category-select,
  .keyword-input {
    width: 100%;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
