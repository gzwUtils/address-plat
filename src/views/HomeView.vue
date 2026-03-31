<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- 头部 -->
    <div class="header">
      <h1 class="platform-title">kd门户聚合平台</h1>
      <p class="tip">温馨提示：该平台为公司内部各项目地址聚合平台，不提供账号密码。如需访问，请联系负责人。</p>
    </div>

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
          <el-skeleton
            v-for="i in 6"
            :key="i"
            animated
            :throttle="0"
          >
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

// ====== 用户权限 ======
const userStore = useUserStore()
const isEditor = userStore.isEditor

// ====== 数据状态 ======
const categories = ref([])
const activeCategory = ref('')
const projects = ref([])
const formVisible = ref(false)
const editingProject = ref({})
const loading = ref(false)
const currentUserId = computed(() => userStore.userId)

// ====== 业务逻辑 ======
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
    ElMessage.warning('加载分类失败，使用默认分类')
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
    // 调试用：可临时保留或删除
    // if (projects.value.length > 0) console.log('项目数据示例:', projects.value[0])
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
.home {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.platform-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.2;
}

.tip {
  color: #99a9bf;
  font-size: 14px;
  margin-top: 8px;
  line-height: 1.5;
}

.category-tabs {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.toolbar {
  margin: 16px 0 20px;
  text-align: right;
  flex-shrink: 0;
}

.grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
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
  color: #999;
  margin-top: 40px;
}

.project-card-skeleton {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: white;
}
</style>
