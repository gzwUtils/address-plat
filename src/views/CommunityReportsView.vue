<template>
  <main class="moderation">
    <header class="page-heading">
      <div><span class="eyebrow">COMMUNITY MODERATION</span><h1>社区举报</h1><p>查看待处理举报，决定隐藏内容或驳回举报。</p></div>
      <el-button @click="load">刷新</el-button>
    </header>
    <div v-if="loading" class="state">正在读取举报…</div>
    <div v-else-if="error" class="state" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <div v-else-if="!reports.length" class="state">目前没有待处理举报。</div>
    <div v-else class="report-list">
      <article v-for="report in reports" :key="report.id" class="report-card">
        <div class="report-meta"><strong>{{ report.targetType === 'topic' ? '主题' : '回复' }} #{{ report.targetId }}</strong><span>举报 #{{ report.id }}</span><time>{{ formatDate(report.createTime) }}</time></div>
        <p>{{ report.reason }}</p>
        <div class="actions">
          <router-link v-if="report.topicId" :to="`/community/topics/${report.topicId}`" target="_blank">查看内容 ↗</router-link>
          <el-button type="danger" plain :loading="busy === report.id" @click="handle(report, true)">隐藏内容</el-button>
          <el-button :loading="busy === report.id" @click="handle(report, false)">驳回举报</el-button>
        </div>
      </article>
    </div>
    <el-pagination v-if="total > 20" background layout="prev, pager, next" :total="total" :page-size="20" :current-page="page" @current-change="changePage" />
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminMe, listOpenReports, resolveReport } from '@/api/community'

const router = useRouter()
const reports = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')
const busy = ref(null)
const formatDate = (value) => value ? new Date(value).toLocaleString('zh-CN') : ''

async function load() {
  loading.value = true
  error.value = ''
  try {
    await adminMe()
    const result = await listOpenReports(page.value)
    reports.value = result.records || []
    total.value = result.total || 0
    if (page.value > 1 && !reports.value.length) { page.value -= 1; await load() }
  } catch (requestError) {
    if (requestError.response?.status === 401) {
      router.replace({ path: '/admin/sign-in', query: { next: '/admin/community/reports' } })
      return
    }
    error.value = requestError.response?.data?.message || '举报列表加载失败。'
  } finally { loading.value = false }
}

function changePage(value) { page.value = value; load() }

async function handle(report, hideTarget) {
  try {
    await ElMessageBox.confirm(hideTarget ? '确定隐藏被举报的内容吗？' : '确定驳回这条举报吗？', '处理举报')
    busy.value = report.id
    await resolveReport(report.id, hideTarget)
    ElMessage.success(hideTarget ? '内容已隐藏' : '举报已驳回')
    await load()
  } catch (requestError) {
    if (requestError !== 'cancel' && requestError.response?.status !== 401)
      ElMessage.error(requestError.response?.data?.message || '处理失败')
  } finally { busy.value = null }
}

onMounted(load)
</script>

<style scoped>
.moderation { max-width: 1000px; margin: 0 auto; display: grid; gap: 20px; }
.page-heading { display: flex; justify-content: space-between; gap: 20px; align-items: center; }
.eyebrow { color: var(--portal-accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; }
h1 { margin: 8px 0; font-size: 38px; }
.page-heading p, .state { color: var(--portal-text-soft); }
.state, .report-card { padding: 24px; border: 1px solid var(--portal-line); border-radius: 18px; background: var(--portal-surface); }
.report-list { display: grid; gap: 13px; }
.report-meta, .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.report-meta span, .report-meta time { color: var(--portal-text-soft); font-size: 12px; }
.report-card p { white-space: pre-wrap; line-height: 1.65; }
.actions a { margin-right: auto; color: var(--portal-accent); }
@media (max-width: 640px) { .page-heading { align-items: flex-start; } h1 { font-size: 30px; } }
</style>
