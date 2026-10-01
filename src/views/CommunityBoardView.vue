<template>
  <div class="board-page">
    <nav class="breadcrumbs"><router-link to="/community">社区</router-link><span>/</span><strong>{{ boardName }}</strong></nav>
    <header class="board-header">
      <div><span class="eyebrow">DISCUSSION BOARD</span><h1>{{ boardName }}</h1><p>{{ boardDescription }}</p></div>
      <el-button type="primary" @click="composerOpen = true">发布主题</el-button>
    </header>
    <form class="filters" @submit.prevent="applySearch">
      <el-input v-model="draftKeyword" placeholder="搜索这个板块的主题" clearable aria-label="搜索主题" />
      <el-select v-model="draftSort" aria-label="排序方式" style="width: 125px">
        <el-option label="最近回复" value="recent" /><el-option label="最新发布" value="new" />
      </el-select>
      <el-button native-type="submit">搜索</el-button>
    </form>
    <p v-if="projectId" class="project-filter">正在查看项目 #{{ projectId }} 的讨论 <router-link :to="`/community/boards/${code}`">清除筛选</router-link></p>
    <div v-if="error" class="state-panel" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <div v-else-if="loading" class="state-panel">正在加载主题…</div>
    <div v-else-if="topics.length" class="topic-list"><TopicRow v-for="topic in topics" :key="topic.id" :topic="topic" /></div>
    <div v-else class="state-panel">这个板块还没有匹配的主题。</div>
    <el-pagination v-if="total > 20" background layout="prev, pager, next" :current-page="page" :page-size="20" :total="total" @current-change="changePage" />
    <CommunityComposer v-model="composerOpen" :board-code="code" :project-id="projectId" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listBoards, listTopics } from '@/api/community'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'

const route = useRoute()
const router = useRouter()
const code = computed(() => String(route.params.code || ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const keyword = computed(() => String(route.query.keyword || ''))
const sort = computed(() => String(route.query.sort || 'recent'))
const projectId = computed(() => route.query.projectId ? Number(route.query.projectId) : null)
const draftKeyword = ref('')
const draftSort = ref('recent')
const boards = ref([])
const topics = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)
const board = computed(() => boards.value.find((item) => item.code === code.value))
const boardName = computed(() => board.value?.name || '社区板块')
const boardDescription = computed(() => board.value?.description || '')

async function load() {
  loading.value = true
  error.value = ''
  draftKeyword.value = keyword.value
  draftSort.value = sort.value
  try {
    const [boardData, result] = await Promise.all([listBoards(), listTopics({ board: code.value, projectId: projectId.value,
      keyword: keyword.value, sort: sort.value, page: page.value, size: 20 })])
    boards.value = boardData
    topics.value = result.records || []
    total.value = result.total || 0
  } catch { error.value = '主题暂时无法加载。' }
  finally { loading.value = false }
}

function applySearch() {
  router.push({ path: route.path, query: { ...(projectId.value ? { projectId: projectId.value } : {}),
    ...(draftKeyword.value.trim() ? { keyword: draftKeyword.value.trim() } : {}), sort: draftSort.value, page: 1 } })
}
function changePage(next) { router.push({ path: route.path, query: { ...route.query, page: next } }) }
function handleSaved(topic) { ElMessage.success('主题已发布'); router.push(`/community/topics/${topic.id}`) }

onMounted(() => {
  composerOpen.value = route.query.compose === '1'
  load()
})
watch(() => route.fullPath, () => { composerOpen.value = route.query.compose === '1'; load() })
</script>

<style scoped>
.board-page { max-width: 1120px; margin: 0 auto; display: grid; gap: 20px; }
.breadcrumbs { display: flex; gap: 10px; color: var(--portal-text-soft); font-size: 13px; }
.breadcrumbs a, .project-filter a { color: var(--portal-accent); }
.board-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; padding: 34px; border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); background: var(--portal-surface); }
.eyebrow { color: var(--portal-accent); font-size: 11px; letter-spacing: .08em; }
h1 { margin: 10px 0; font-size: clamp(36px,4.5vw,52px); }
.board-header p { margin: 0; color: var(--portal-text-soft); }
.filters { display: flex; gap: 10px; }
.filters .el-input { flex: 1; }
.project-filter { margin: 0; color: var(--portal-text-soft); font-size: 13px; }
.topic-list { display: grid; border-top: 1px solid var(--portal-line); }
.state-panel { padding: 30px; border: 1px solid var(--portal-line); color: var(--portal-text-soft); background: var(--portal-surface); }
@media (max-width: 650px) { .board-header { flex-direction: column; align-items: start; padding: 22px; } .filters { flex-wrap: wrap; } .filters .el-input { flex-basis: 100%; } }
</style>
