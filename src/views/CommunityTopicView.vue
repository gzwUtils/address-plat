<template>
  <div class="topic-page">
    <nav class="breadcrumbs"><router-link to="/community">社区</router-link><span>/</span><router-link v-if="topic" :to="`/community/boards/${topic.boardCode}`">{{ topic.boardName }}</router-link></nav>
    <div v-if="loading" class="state-panel">正在加载讨论…</div>
    <div v-else-if="error" class="state-panel" role="alert">{{ error }} <el-button text @click="load">重试</el-button></div>
    <template v-else-if="topic">
      <article class="floor opener">
        <div class="floor-meta"><span class="floor-number">1 楼 · 楼主</span><span>{{ topic.authorNickname }}</span><time>{{ formatDate(topic.createTime) }}</time></div>
        <h1>{{ topic.title }}</h1>
        <div class="labels"><router-link :to="`/community/boards/${topic.boardCode}`">{{ topic.boardName }}</router-link><router-link v-if="topic.projectId" :to="`/project/${topic.projectId}`">关联项目 · {{ topic.projectName || topic.projectId }}</router-link></div>
        <SafeText :text="topic.body" />
        <div class="floor-actions">
          <el-button v-if="topic.canEdit" text @click="composerOpen = true">编辑主题</el-button>
          <el-button v-if="topic.canEdit" text type="danger" @click="removeTopic">删除主题</el-button>
          <el-button text @click="report('topic', topic.id)">举报</el-button>
        </div>
      </article>

      <div class="reply-heading"><h2>回复 · {{ topic.replyCount || 0 }}</h2><el-button @click="loadReplies">刷新</el-button></div>
      <button v-if="newCount > 0" type="button" class="new-replies" @click="showNewReplies">有 {{ newCount }} 条新回复，点击查看</button>
      <div v-if="replies.length" class="reply-list">
        <article v-for="reply in replies" :key="reply.id" :id="`floor-${reply.floorNo}`" class="floor">
          <div class="floor-meta"><span class="floor-number">{{ reply.floorNo }} 楼</span><span>{{ reply.authorNickname }}</span><time>{{ formatDate(reply.createTime) }}</time></div>
          <div v-if="reply.replyToId" class="quote-ref">回复了前面的楼层</div>
          <SafeText :text="reply.body" />
          <div v-if="reply.status === 'visible'" class="floor-actions">
            <el-button text @click="quote(reply)">引用回复</el-button>
            <el-button v-if="reply.canEdit" text @click="editReply(reply)">编辑</el-button>
            <el-button v-if="reply.canEdit" text type="danger" @click="removeReply(reply)">删除</el-button>
            <el-button text @click="report('reply', reply.id)">举报</el-button>
          </div>
        </article>
      </div>
      <div v-else class="state-panel">还没有回复，来聊第一句。</div>
      <el-pagination v-if="replyTotal > 20" background layout="prev, pager, next" :current-page="replyPage" :page-size="20" :total="replyTotal" @current-change="changePage" />

      <section ref="replyBox" class="reply-box">
        <h2>参与讨论</h2>
        <p v-if="replyTo" class="reply-target">正在引用 {{ replyTo.floorNo }} 楼 <el-button text @click="replyTo = null">取消</el-button></p>
        <el-input v-model="draft" type="textarea" :rows="5" maxlength="2000" show-word-limit placeholder="说说你的想法…" />
        <div class="reply-submit"><el-button type="primary" :loading="sending" @click="sendReply">发布回复</el-button></div>
      </section>
    </template>
    <CommunityComposer v-model="composerOpen" :topic="topic" :board-code="topic?.boardCode || 'project-share'" @saved="handleTopicSaved" />
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommunityComposer from '@/components/CommunityComposer.vue'
import SafeText from '@/components/SafeText.vue'
import { createReply, deleteReply, deleteTopic, getTopic, listReplies, reportContent, updateReply } from '@/api/community'

const route = useRoute()
const router = useRouter()
const topic = ref(null)
const replies = ref([])
const replyPage = ref(1)
const replyTotal = ref(0)
const loading = ref(true)
const error = ref('')
const composerOpen = ref(false)
const draft = ref('')
const replyTo = ref(null)
const replyBox = ref(null)
const sending = ref(false)
const newCount = ref(0)
const knownCount = ref(0)
let pollTimer = null
const formatDate = (value) => value ? new Date(value).toLocaleString('zh-CN') : ''

async function load() {
  loading.value = true
  error.value = ''
  try {
    topic.value = await getTopic(route.params.id)
    knownCount.value = topic.value.replyCount || 0
    await loadReplies()
  } catch { error.value = '讨论暂时无法加载，或已被删除。' }
  finally { loading.value = false }
}

async function loadReplies() {
  try {
    const data = await listReplies(route.params.id, replyPage.value)
    replies.value = data.records || []
    replyTotal.value = data.total || 0
  } catch { ElMessage.error('回复加载失败') }
}

async function checkNew() {
  if (document.visibilityState !== 'visible' || !topic.value) return
  try {
    const fresh = await getTopic(route.params.id)
    newCount.value = Math.max(0, (fresh.replyCount || 0) - knownCount.value)
  } catch { /* manual refresh remains available */ }
}

async function showNewReplies() {
  const fresh = await getTopic(route.params.id)
  topic.value = fresh
    const latest = await listReplies(route.params.id, 1, 1)
    replyPage.value = Math.max(1, Math.ceil((latest.total || 0) / 20))
  await loadReplies()
  knownCount.value = fresh.replyCount || 0
  newCount.value = 0
  await nextTick()
  document.querySelector('.reply-heading')?.scrollIntoView({ behavior: 'smooth' })
}

function changePage(page) { replyPage.value = page; loadReplies() }
function quote(reply) { replyTo.value = reply; replyBox.value?.scrollIntoView({ behavior: 'smooth' }) }

async function sendReply() {
  if (!draft.value.trim()) return ElMessage.warning('请输入回复内容')
  sending.value = true
  try {
    await createReply(route.params.id, { body: draft.value, replyToId: replyTo.value?.id || null })
    draft.value = ''
    replyTo.value = null
    topic.value = await getTopic(route.params.id)
    knownCount.value = topic.value.replyCount || 0
    replyPage.value = Math.max(1, Math.ceil((replyTotal.value + 1) / 20))
    await loadReplies()
    ElMessage.success('回复已发布')
  } catch (requestError) { ElMessage.error(requestError.response?.data?.message || '回复失败，草稿已保留') }
  finally { sending.value = false }
}

async function editReply(reply) {
  try {
    const { value } = await ElMessageBox.prompt('修改回复', '编辑楼层', { inputType: 'textarea', inputValue: reply.body })
    await updateReply(reply.id, value)
    await loadReplies()
  } catch (error) { if (error !== 'cancel') ElMessage.error('修改失败') }
}

async function removeReply(reply) {
  try {
    await ElMessageBox.confirm(`确定删除 ${reply.floorNo} 楼吗？`, '删除回复')
    await deleteReply(reply.id)
    topic.value = await getTopic(route.params.id)
    knownCount.value = topic.value.replyCount || 0
    await loadReplies()
  } catch (error) { if (error !== 'cancel') ElMessage.error('删除失败') }
}

async function removeTopic() {
  try {
    await ElMessageBox.confirm('确定删除这个主题吗？', '删除主题')
    await deleteTopic(route.params.id)
    router.push('/community')
  } catch (error) { if (error !== 'cancel') ElMessage.error('删除失败') }
}

async function report(type, id) {
  try {
    const { value } = await ElMessageBox.prompt('请简要说明原因', '举报内容', { inputType: 'textarea' })
    await reportContent(type, id, value)
    ElMessage.success('举报已提交')
  } catch (error) { if (error !== 'cancel') ElMessage.error('举报失败') }
}

function handleTopicSaved(updated) { topic.value = updated; ElMessage.success('主题已更新') }

onMounted(() => { load(); pollTimer = window.setInterval(checkNew, 10000) })
onBeforeUnmount(() => window.clearInterval(pollTimer))
watch(() => route.params.id, () => { replyPage.value = 1; replies.value = []; load() })
</script>

<style scoped>
.topic-page { max-width: 980px; margin: 0 auto; display: grid; gap: 18px; }
.breadcrumbs { display: flex; gap: 10px; color: var(--portal-text-soft); font-size: 13px; }
.breadcrumbs a, .labels a { color: var(--portal-accent); }
.floor, .reply-box, .state-panel { padding: 28px; border: 1px solid var(--portal-line); background: var(--portal-surface); }
.opener { padding: 36px; border-top: 2px solid var(--portal-text); }
.floor h1 { margin: 14px 0; font-size: clamp(30px,3.5vw,44px); }
.floor-meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; color: var(--portal-text-soft); font-size: 12px; }
.floor-number { color: var(--portal-accent); font-weight: 700; }
.labels { display: flex; gap: 12px; margin: 0 0 24px; font-size: 13px; }
.floor-actions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 18px; }
.reply-heading { display: flex; align-items: center; justify-content: space-between; }
.reply-heading h2, .reply-box h2 { margin: 0; }
.reply-list { display: grid; }
.reply-list .floor + .floor { border-top: 0; }
.quote-ref, .reply-target { margin: 10px 0; color: var(--portal-text-soft); font-size: 13px; }
.reply-box { display: grid; gap: 15px; }
.reply-submit { display: flex; justify-content: end; }
.new-replies { padding: 13px; border: 1px solid var(--portal-accent); background: var(--portal-bg-soft); color: var(--portal-accent); cursor: pointer; }
.state-panel { color: var(--portal-text-soft); }
@media (max-width: 650px) { .floor, .reply-box, .state-panel, .opener { padding: 20px; } }
</style>
