<template>
  <div class="mine-page">
    <nav><router-link to="/community">社区</router-link><span> / 我的讨论</span></nav>
    <header><div><span class="eyebrow">MY DISCUSSIONS</span><h1>我的讨论</h1><p>找回账户后，可以接着参与之前的话题。</p></div><router-link to="/community">浏览社区 ↗</router-link></header>
    <div v-if="error" class="state-panel" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <div v-else-if="loading" class="state-panel">正在加载…</div>
    <div v-else-if="topics.length" class="topic-list"><TopicRow v-for="topic in topics" :key="topic.id" :topic="topic" /></div>
    <div v-else class="state-panel">还没有参与的讨论。<router-link to="/community">去社区看看 ↗</router-link></div>
    <el-pagination v-if="total > 20" background layout="prev, pager, next" :current-page="page" :page-size="20" :total="total" @current-change="changePage" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import TopicRow from '@/components/TopicRow.vue'
import { getMyDiscussions } from '@/api/community'

const topics = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getMyDiscussions(page.value)
    topics.value = data.records || []
    total.value = data.total || 0
  } catch (requestError) {
    error.value = requestError.response?.status === 401 ? '请先找回账户，再查看自己的讨论。' : '暂时无法加载我的讨论。'
  } finally { loading.value = false }
}
function changePage(next) { page.value = next; load().catch(() => ElMessage.error('加载失败')) }
onMounted(load)
</script>

<style scoped>
.mine-page { max-width: 1100px; margin: 0 auto; display: grid; gap: 20px; }
.mine-page nav, .mine-page nav a, header a, .state-panel a { color: var(--portal-accent); }
header { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 30px; border: 1px solid var(--portal-line); border-radius: 20px; background: var(--portal-surface); }
.eyebrow { color: var(--portal-accent); font-size: 11px; letter-spacing: .15em; }
h1 { margin: 7px 0; }
header p { margin: 0; color: var(--portal-text-soft); }
.topic-list { display: grid; gap: 10px; }
.state-panel { padding: 30px; border: 1px solid var(--portal-line); border-radius: 16px; color: var(--portal-text-soft); background: var(--portal-surface); }
@media (max-width: 650px) { header { flex-direction: column; align-items: start; padding: 22px; } }
</style>
