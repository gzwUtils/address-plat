<template>
  <div class="community-page">
    <section class="community-hero">
      <div class="hero-copy">
        <span class="eyebrow">团队门户 / 社区</span>
        <h1>社区</h1>
        <p>分享项目，也聊聊项目之外的事。</p>
      </div>
      <div class="hero-action">
        <span>从这里开始</span>
        <div class="hero-topics" aria-label="社区话题"><span>项目分享</span><span>技术交流</span><span>自由闲谈</span></div>
        <el-button type="primary" @click="composerOpen = true">发布主题 ↗</el-button>
      </div>
    </section>

    <div v-if="error" class="state-panel" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <template v-else>
      <section class="community-section">
        <h2>选择板块</h2>
        <div class="board-grid">
          <router-link v-for="(board, index) in boards" :key="board.code" :to="`/community/boards/${board.code}`" class="board-card">
            <span class="board-symbol">{{ index + 1 }}</span>
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
.community-page { max-width: 1320px; margin: 0 auto; display: grid; gap: 42px; }
.community-hero { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, .6fr); border-top: 2px solid var(--portal-text); border-bottom: 1px solid var(--portal-line); background: var(--portal-surface); }
.hero-copy { padding: 42px 46px; }
.eyebrow { color: var(--portal-accent); font-size: 12px; font-weight: 700; letter-spacing: .08em; }
h1 { margin: 22px 0 12px; font-size: clamp(56px, 7vw, 94px); line-height: 1.1; letter-spacing: -.04em; }
.community-hero p, .board-card p { color: var(--portal-text-soft); line-height: 1.6; }
.hero-action { display: flex; flex-direction: column; align-items: start; padding: 42px 36px; border-left: 1px solid var(--portal-line); background: var(--portal-surface-strong); }
.hero-action > span { color: var(--portal-accent); font-size: 12px; font-weight: 700; }
.hero-topics { display: grid; width: 100%; margin: 17px 0 26px; }
.hero-topics span { border-top: 1px solid var(--portal-line); padding: 9px 0; color: var(--portal-text); font-size: 14px; }
.hero-action .el-button { margin-top: auto; padding: 19px 24px; font-weight: 700; }
.community-section { display: grid; gap: 18px; }
.community-section h2 { margin: 0; font-size: 27px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 14px; border-top: 2px solid var(--portal-text); }
.section-heading a { color: var(--portal-accent); }
.board-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
.board-card { display: grid; align-content: start; gap: 10px; min-height: 210px; padding: 25px; border: 1px solid var(--portal-line); border-top: 2px solid var(--portal-accent-2); background: var(--portal-surface); }
.board-card:hover { border-color: var(--portal-accent); border-top-color: var(--portal-accent); }
.board-symbol { color: var(--portal-accent); font-size: 12px; font-weight: 700; }
.board-card strong { font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; font-size: 25px; }
.board-card p { margin: 0; font-size: 13px; }
.board-card small { align-self: end; margin-top: 14px; color: var(--portal-text-soft); }
.topic-list { display: grid; border-top: 1px solid var(--portal-line); }
.state-panel { padding: 26px; border: 1px solid var(--portal-line); color: var(--portal-text-soft); background: var(--portal-surface); }
@media (max-width: 800px) { .board-grid { grid-template-columns: 1fr; } .community-hero { grid-template-columns: 1fr; } .hero-copy, .hero-action { padding: 27px; } .hero-action { border-top: 1px solid var(--portal-line); border-left: 0; } .hero-topics { grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; } }
</style>
