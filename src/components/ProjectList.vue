<!-- src/components/ProjectList.vue -->
<template>
  <div class="project-list">
    <!-- 分类标签 -->
    <el-tabs
      v-model="activeCategory"
      @tab-click="loadProjects"
      type="card"
      class="category-tabs"
      v-if="categories.length > 0"
    >
      <el-tab-pane
        v-for="cat in categories"
        :key="cat"
        :label="cat"
        :name="cat"
      />
    </el-tabs>

    <div v-else class="empty-tip">暂无分类</div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button v-if="isEditor" type="primary" @click="showForm()" size="medium">
        <el-icon><Plus /></el-icon>
        新增项目
      </el-button>
    </div>

    <!-- 项目网格 -->
    <div class="grid-container">
      <div class="grid">
        <!-- 加载中 -->
        <template v-if="loading">
          <el-skeleton v-for="i in 6" :key="i" animated :throttle="0">
            <template #template>
              <div class="project-card-skeleton">
                <el-skeleton-item variant="image" style="width: 100%; height: 100px;" />
                <div style="padding: 16px;">
                  <el-skeleton-item variant="h3" style="width: 70%;" />
                  <div style="display: flex; align-items: center; margin-top: 12px; height: 16px;">
                    <el-skeleton-item variant="text" style="width: 50%;" />
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </template>

        <!-- 无项目 -->
        <div v-else-if="projects.length === 0" class="no-projects">
          <el-empty description="当前分类下暂无项目" />
        </div>

        <!-- 项目卡片 -->
        <ProjectCard
          v-for="p in projects"
          :key="p.id"
          :project="p"
          :can-edit="isOwnedByUser(p, currentUserId)"
          @edit="editProject"
          @deleted="loadProjects"
        />
      </div>
    </div>

    <!-- 表单弹窗 -->
    <ProjectForm
      v-model="formVisible"
      :project="editingProject"
      :existing-categories="categories"
      @saved="reloadAll"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/store'
import { getProjects, getCategories } from '@/api/project'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectForm from '@/components/ProjectForm.vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { isOwnedByUser } from '@/utils/ownership'

const userStore = useUserStore()
const isEditor = userStore.isEditor

const categories = ref([])
const activeCategory = ref('')
const projects = ref([])
const formVisible = ref(false)
const editingProject = ref({})
const loading = ref(false)
const currentUserId = computed(() => userStore.userId)

const loadCategories = async () => {
  try {
    const data = await getCategories()
    categories.value = data && Array.isArray(data) && data.length > 0
      ? [...new Set(data)].sort()
      : ['默认']
    activeCategory.value = categories.value[0]
    await loadProjects()
  } catch (err) {
    console.warn('加载分类失败', err)
    ElMessage.warning('加载分类失败,使用默认分类')
    categories.value = ['默认']
    activeCategory.value = '默认'
    await loadProjects()
  }
}

const loadProjects = async () => {
  if (!activeCategory.value) return
  loading.value = true
  try {
    projects.value = await getProjects(activeCategory.value)
  } catch (error) {
    console.warn('加载项目失败', error)
    ElMessage.error('加载项目失败')
    projects.value = []
  } finally {
    loading.value = false
  }
}

const reloadAll = async () => {
  await loadCategories()
}

const showForm = (project = {}) => {
  editingProject.value = { ...project }
  formVisible.value = true
}

const editProject = (project) => {
  if (!isOwnedByUser(project, currentUserId.value)) {
    ElMessage.warning('只能修改自己上传的项目')
    return
  }
  showForm(project)
}


onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.project-list {
  width: 100%;
}

.category-tabs {
  margin-bottom: 16px;
}

.category-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.category-tabs :deep(.el-tabs__item) {
  color: var(--portal-text-soft);
}

.category-tabs :deep(.el-tabs__item.is-active) {
  color: var(--portal-accent);
}

.category-tabs :deep(.el-tabs__nav) {
  border: 1px solid var(--portal-line);
}

.category-tabs :deep(.el-tabs__item.is-top) {
  border-bottom: 0;
  background: rgba(255, 255, 255, 0.03);
}

.toolbar {
  margin: 16px 0 20px;
  text-align: right;
}

.grid-container {
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding-bottom: 24px;
}

.empty-tip,
.no-projects {
  text-align: center;
  color: var(--portal-text-soft);
  margin-top: 40px;
}

.project-card-skeleton {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--portal-line);
  background: rgba(255, 255, 255, 0.04);
}
</style>
