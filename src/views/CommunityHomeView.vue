<template>
  <div class="community-page">
    <section class="community-hero">
      <div>
        <span class="eyebrow">KD COMMUNITY</span>
        <h1>社区</h1>
        <p>分享项目、提出问题，和大家把想法聊下去。</p>
      </div>
      <el-button type="primary" @click="composerOpen = true">发布主题</el-button>
    </section>

    <div v-if="error" class="state-panel" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <template v-else>
      <section class="community-section">
        <h2>选择板块</h2>
        <div class="board-grid">
          <router-link v-for="board in boards" :key="board.code" :to="`/community/boards/${board.code}`" class="board-card">
            <span class="board-symbol">{{ boardIcon(board.code) }}</span>
            <strong>{{ board.name }}</strong>
            <p>{{ board.description }}</p>
            <small>{{ board.topicCount || 0 }} 个主题 · 进入板块 ↗</small>
          </router-link>
        </div>
      </section>
      <section class="community-section">
        <div class="section-heading"><h2>最近讨论</h2><router-link to="/community/boards/project-share">去项目分享 ↗</router-link></div>
        <div v-if="loading" class="state-panel">正在加载讨论…</div>
        <div v-else-if="latest.length" class="topic-list"><TopicRow v-for="topic in latest" :key="topic.id" :topic="topic" /></div>
        <div v-else class="state-panel">还没有讨论，来发布第一个主题。</div>
      </section>
    </template>
    <CommunityComposer v-model="composerOpen" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'
import { listBoards, listTopics } from '@/api/community'

const router = useRouter()
const boards = ref([])
const latest = ref([])
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)

const boardIcon = (code) => ({ 'project-share': '↗', 'tech-talk': '⌘', lounge: '✦' })[code] || '·'

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [boardData, topicData] = await Promise.all([listBoards(), listTopics({ page: 1, size: 6 })])
    boards.value = boardData
    latest.value = topicData.records || []
  } catch {
    error.value = '社区暂时无法加载。'
  } finally { loading.value = false }
}

function handleSaved(topic) {
  ElMessage.success('主题已发布')
  router.push(`/community/topics/${topic.id}`)
}

onMounted(load)
</script>

<style scoped>
.community-page { max-width: 1320px; margin: 0 auto; display: grid; gap: 34px; }
.community-hero { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 42px; border: 1px solid var(--portal-line); border-radius: 24px; background: radial-gradient(circle at right top,var(--portal-glow),transparent 50%),var(--portal-surface); }
.eyebrow { color: var(--portal-accent); letter-spacing: .17em; font-size: 12px; }
h1 { margin: 8px 0; font-size: clamp(34px,5vw,58px); }
.community-hero p, .board-card p { color: var(--portal-text-soft); line-height: 1.6; }
.community-section { display: grid; gap: 18px; }
.community-section h2 { margin: 0; font-size: 23px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.section-heading a { color: var(--portal-accent); }
.board-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
.board-card { display: grid; align-content: start; gap: 9px; min-height: 180px; padding: 25px; border: 1px solid var(--portal-line); border-radius: 18px; background: var(--portal-surface); }
.board-card:hover { border-color: var(--portal-accent); }
.board-symbol { color: var(--portal-accent); font-size: 25px; }
.board-card strong { font-size: 20px; }
.board-card p { margin: 0; font-size: 13px; }
.board-card small { align-self: end; margin-top: 14px; color: var(--portal-text-soft); }
.topic-list { display: grid; gap: 10px; }
.state-panel { padding: 30px; border: 1px solid var(--portal-line); border-radius: 16px; color: var(--portal-text-soft); background: var(--portal-surface); }
@media (max-width: 800px) { .board-grid { grid-template-columns: 1fr; } .community-hero { padding: 25px; align-items: start; flex-direction: column; } }
</style>
