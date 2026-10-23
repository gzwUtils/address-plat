<template>
  <main class="reading-admin">
    <header class="page-heading">
      <div>
        <span class="eyebrow">运营工作台 / PROJECT READING</span>
        <h1>项目解读</h1>
        <p>把公开项目资料整理成可追溯的阅读路径、设计取舍和动手练习。</p>
      </div>
      <router-link to="/admin/sources">返回项目来源 ↗</router-link>
    </header>

    <section class="privacy-note" aria-label="资料范围说明">
      <span class="note-mark">i</span>
      <div><strong>当前读取范围：GitHub 公开仓库</strong><p>项目说明、文档和少量入口文件会发送到下方配置的模型服务。企业私有仓库尚未接入权限隔离，请不要在这里处理私有源码。</p></div>
    </section>

    <div class="admin-grid">
      <section class="engine-section" aria-labelledby="engine-title">
        <div class="section-heading"><div><span class="eyebrow">MODEL ADAPTER / 01</span><h2 id="engine-title">解读引擎</h2></div><button type="button" class="text-button" @click="loadEngines">刷新</button></div>
        <p v-if="engineError" class="inline-error" role="alert">{{ engineError }}</p>
        <p v-else-if="engineLoading" class="muted-state">正在读取配置…</p>
        <div v-else-if="!engines.length" class="empty-engine"><strong>还没有配置解读引擎</strong><span>连接一个 OpenAI 兼容的 Chat Completions 接口后，即可生成项目导读。</span></div>
        <article v-for="engine in engines" :key="engine.id" class="engine-card" :class="{ selected: editingId === engine.id }">
          <div class="engine-card-top"><div><span class="engine-protocol">{{ engine.protocol }}</span><span v-if="engine.defaultForPublic" class="default-pill">公开项目默认</span></div><span class="enabled-pill" :class="engine.enabled ? 'enabled' : 'disabled'">{{ engine.enabled ? '已启用' : '已停用' }}</span></div>
          <h3>{{ engine.name }}</h3>
          <p class="engine-model">{{ engine.modelName }} · {{ engine.timeoutSeconds }} 秒超时</p>
          <p class="engine-url">{{ engine.baseUrl }}</p>
          <div class="engine-actions"><span>{{ engine.hasApiKey ? '密钥已加密保存' : '未配置密钥' }}</span><button type="button" @click="editEngine(engine)">编辑配置</button></div>
        </article>
      </section>

      <aside class="engine-editor" aria-labelledby="editor-title">
        <span class="eyebrow">CONFIGURE / 02</span>
        <h2 id="editor-title">{{ editingId ? '编辑引擎' : '连接新引擎' }}</h2>
        <p class="editor-intro">适配 OpenAI 兼容的 Chat Completions 接口。模型密钥仅在后端加密保存，不会回传到浏览器。</p>
        <form @submit.prevent="saveEngine">
          <label>配置名称<input v-model.trim="form.name" maxlength="100" placeholder="例如：团队学习模型" required /></label>
          <label>接口地址<input v-model.trim="form.baseUrl" maxlength="500" type="url" placeholder="https://api.example.com/v1" required /></label>
          <label>模型名称<input v-model.trim="form.modelName" maxlength="160" placeholder="例如：model-name" required /></label>
          <label>API Key<input v-model="form.apiKey" type="password" autocomplete="new-password" :placeholder="hasSavedKey ? '已保存；留空会保留原密钥' : '无鉴权接口可留空'" /></label>
          <div class="field-pair"><label>超时（秒）<input v-model.number="form.timeoutSeconds" type="number" min="5" max="180" required /></label><label>启用状态<select v-model="form.enabled"><option :value="true">启用</option><option :value="false">停用</option></select></label></div>
          <label class="check-field"><input v-model="form.defaultForPublic" type="checkbox" :disabled="!form.enabled" /> 用作公开项目的默认解读引擎</label>
          <p v-if="form.defaultForPublic" class="queue-note">保存默认引擎后，已收录但尚未生成的 GitHub 项目会自动加入解读队列。</p>
          <p class="key-note">保存 API Key 需要后端设置至少 32 字符的 <code>PORTAL_AI_ENCRYPTION_KEY</code>。建议使用 HTTPS 模型接口；密钥输入不会存入浏览器缓存。</p>
          <p v-if="saveMessage" class="form-message" :class="{ error: saveError }" role="status">{{ saveMessage }}</p>
          <div class="form-actions"><button type="submit" class="primary-button" :disabled="saving">{{ saving ? '保存中…' : '保存配置' }}</button><button v-if="editingId" type="button" class="text-button" @click="startNew">新建配置</button><button v-if="editingId" type="button" class="test-button" :disabled="testingId === editingId" @click="testEngine(editingId)">{{ testingId === editingId ? '测试中…' : '测试连接' }}</button></div>
          <p v-if="testMessage" class="test-message" :class="{ error: testError }" role="status">{{ testMessage }}</p>
        </form>
      </aside>
    </div>

    <section class="candidate-section" aria-labelledby="candidate-title">
      <div class="section-heading candidate-heading"><div><span class="eyebrow">READING QUEUE / 03</span><h2 id="candidate-title">已收录的站外项目</h2><p>选择一个项目生成或更新解读。系统读取仓库说明、清单、文档和少量入口代码，不会执行仓库代码。</p></div><div class="candidate-tools"><input v-model.trim="search" type="search" aria-label="筛选项目" placeholder="筛选项目名称" /><button type="button" class="text-button" @click="loadCandidates">刷新列表</button></div></div>
      <p v-if="candidateError" class="inline-error" role="alert">{{ candidateError }}</p>
      <p v-else-if="candidateLoading && !candidates.length" class="muted-state">正在读取项目…</p>
      <div v-else-if="!filteredCandidates.length" class="empty-candidates">{{ search ? '没有匹配的项目。' : '来源同步后，项目会出现在这里。' }}</div>
      <div v-else class="candidate-list">
        <article v-for="project in filteredCandidates" :key="project.id" class="candidate-row">
          <div class="candidate-main"><div class="candidate-labels"><span>{{ project.sourceName || project.sourcePlatform || '公开来源' }}</span><span :class="['guide-status', statusClass(project.readingGuideStatus)]">{{ statusText(project.readingGuideStatus) }}</span></div><h3><router-link :to="`/open-source/${project.id}`" target="_blank">{{ project.fullName }}</router-link></h3><p>{{ project.description || '暂无项目简介' }}</p><small>{{ project.language || '语言未提供' }}<template v-if="project.readingGuideUpdatedAt"> · 最近更新 {{ displayTime(project.readingGuideUpdatedAt) }}</template></small><div v-if="guideErrors[project.id]" class="guide-error">{{ guideErrors[project.id] }}</div><button v-if="project.readingGuideStatus === 'FAILED'" type="button" class="error-link" @click="loadGuideError(project.id)">查看失败原因</button></div>
          <div class="candidate-action"><button type="button" :disabled="!canGenerate(project) || activeId === project.id" :title="canGenerate(project) ? '' : '当前仅支持 GitHub 公开仓库'" @click="generateGuide(project)">{{ activeId === project.id ? '已加入队列…' : project.readingGuideStatus === 'SUCCESS' ? '重新解读 ↻' : project.readingGuideStatus === 'PENDING' || project.readingGuideStatus === 'RUNNING' ? '排队中…' : '生成解读 ↗' }}</button></div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAdminProjectReadingGuide, listProjectReadingCandidates, listProjectReadingEngines,
  queueProjectReadingGuide, saveProjectReadingEngine, testProjectReadingEngine
} from '@/api/project'

const blankForm = () => ({ name: '', protocol: 'openai-compatible', baseUrl: '', modelName: '', apiKey: '', timeoutSeconds: 60, enabled: true, defaultForPublic: true })
const engines = ref([])
const candidates = ref([])
const form = reactive(blankForm())
const editingId = ref(null)
const hasSavedKey = ref(false)
const engineLoading = ref(false)
const candidateLoading = ref(false)
const saving = ref(false)
const testingId = ref(null)
const activeId = ref(null)
const engineError = ref('')
const candidateError = ref('')
const saveMessage = ref('')
const saveError = ref(false)
const testMessage = ref('')
const testError = ref(false)
const search = ref('')
const guideErrors = reactive({})
let pollTimer

const filteredCandidates = computed(() => {
  const keyword = search.value.toLocaleLowerCase()
  return candidates.value.filter((project) => !keyword || `${project.fullName} ${project.description || ''} ${project.sourceName || ''}`.toLocaleLowerCase().includes(keyword))
})
const errorText = (error) => error?.response?.data?.message || error?.message || '操作失败，请稍后重试'
const canGenerate = (project) => project.sourceType === 'github_search' && !['PENDING', 'RUNNING'].includes(project.readingGuideStatus)
const statusText = (status) => ({ SUCCESS: '已有解读', PENDING: '等待处理', RUNNING: '正在生成', FAILED: '上次失败', NOT_GENERATED: '尚未生成' })[status] || '尚未生成'
const statusClass = (status) => ({ SUCCESS: 'success', FAILED: 'failed', RUNNING: 'running', PENDING: 'pending' })[status] || 'not-generated'
const displayTime = (value) => {
  const date = new Date(String(value).endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? String(value).replace('T', ' ').slice(0, 16) : new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

async function loadEngines() {
  engineLoading.value = true
  engineError.value = ''
  try { engines.value = await listProjectReadingEngines() || [] } catch (error) { engineError.value = errorText(error) } finally { engineLoading.value = false }
}
async function loadCandidates(silent = false) {
  if (!silent) candidateLoading.value = true
  candidateError.value = ''
  try { candidates.value = await listProjectReadingCandidates() || [] } catch (error) { if (!silent) candidateError.value = errorText(error) } finally { if (!silent) candidateLoading.value = false }
}
function startNew() {
  editingId.value = null
  hasSavedKey.value = false
  Object.assign(form, blankForm())
  saveMessage.value = ''
  testMessage.value = ''
}
function editEngine(engine) {
  editingId.value = engine.id
  hasSavedKey.value = engine.hasApiKey
  Object.assign(form, { ...blankForm(), ...engine, apiKey: '' })
  saveMessage.value = ''
  testMessage.value = ''
}
async function saveEngine() {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false
  try {
    const result = await saveProjectReadingEngine({ ...form, id: editingId.value })
    const saved = result.profile
    editingId.value = saved.id
    hasSavedKey.value = saved.hasApiKey
    form.apiKey = ''
    await Promise.all([loadEngines(), loadCandidates()])
    saveMessage.value = result.queuedProjectCount > 0
      ? `配置已保存，${result.queuedProjectCount} 个尚未生成的项目已加入解读队列。`
      : '配置已保存；当前没有尚未生成的项目需要排队。'
    ElMessage.success(result.queuedProjectCount > 0 ? '解读引擎已保存，项目已开始排队' : '解读引擎已保存')
  } catch (error) { saveMessage.value = errorText(error); saveError.value = true } finally { saving.value = false }
}
async function testEngine(id) {
  testingId.value = id
  testMessage.value = ''
  testError.value = false
  try {
    const result = await testProjectReadingEngine(id)
    testMessage.value = result.success ? `连接成功：${result.message}` : `连接失败：${result.message}`
    testError.value = !result.success
  } catch (error) { testMessage.value = errorText(error); testError.value = true } finally { testingId.value = null }
}
async function generateGuide(project) {
  if (!canGenerate(project)) return
  activeId.value = project.id
  delete guideErrors[project.id]
  try {
    await queueProjectReadingGuide(project.id)
    project.readingGuideStatus = 'PENDING'
    ElMessage.success('已加入项目解读队列')
  } catch (error) { ElMessage.error(errorText(error)) } finally { activeId.value = null }
}
async function loadGuideError(id) {
  try {
    const guide = await getAdminProjectReadingGuide(id)
    guideErrors[id] = guide.lastError || '暂无详细失败信息，请检查引擎连接配置。'
  } catch (error) { guideErrors[id] = errorText(error) }
}

onMounted(async () => {
  await Promise.all([loadEngines(), loadCandidates()])
  pollTimer = window.setInterval(() => {
    if (candidates.value.some((project) => ['PENDING', 'RUNNING'].includes(project.readingGuideStatus))) loadCandidates(true)
  }, 5000)
})
onUnmounted(() => window.clearInterval(pollTimer))
</script>

<style scoped>
.reading-admin { max-width: 1380px; margin: 0 auto; padding: 18px 12px 90px; color: var(--portal-text, #202b2d); }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; border-bottom: 2px solid #263b37; padding: 26px 0 27px; }
.eyebrow { color: var(--portal-accent, #376c55); font-size: 10px; font-weight: 820; letter-spacing: .14em; }
.page-heading h1 { margin: 11px 0 8px; font-size: clamp(36px, 4vw, 52px); letter-spacing: -.065em; }
.page-heading p, .candidate-heading p { margin: 0; color: var(--portal-text-soft, #75817b); font-size: 13px; line-height: 1.7; }
.page-heading > a { flex: 0 0 auto; color: var(--portal-accent, #376c55); font-size: 12px; font-weight: 750; }
.privacy-note { display: flex; gap: 13px; margin-top: 20px; border: 1px solid #ded7c7; padding: 15px 17px; background: #f4f1e9; }
.note-mark { display: grid; flex: 0 0 21px; place-items: center; width: 21px; height: 21px; border-radius: 50%; background: #957345; color: white; font-family: Georgia, serif; font-size: 14px; font-weight: 700; }
.privacy-note strong { color: #534a39; font-size: 12px; }.privacy-note p { margin: 5px 0 0; color: #766e5e; font-size: 11px; line-height: 1.7; }
.admin-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(340px, .9fr); gap: 38px; margin-top: 38px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 18px; padding-bottom: 19px; }
.section-heading h2, .engine-editor h2 { margin: 7px 0 0; font-size: 26px; letter-spacing: -.05em; }
.text-button { border: 0; padding: 4px 0; background: transparent; color: var(--portal-accent, #376c55); font: inherit; font-size: 12px; font-weight: 760; cursor: pointer; }
.empty-engine, .empty-candidates, .muted-state { border-top: 1px solid #dfe5df; padding: 22px 0; color: #7a8580; font-size: 12px; }
.empty-engine { display: grid; gap: 6px; }.empty-engine strong { color: #33423d; font-size: 14px; }.empty-engine span { line-height: 1.7; }
.engine-card { border-top: 1px solid #dfe5df; padding: 19px 3px 15px; }.engine-card.selected { border-top: 2px solid var(--portal-accent, #376c55); }
.engine-card-top, .engine-card-top > div, .engine-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.engine-protocol, .default-pill, .enabled-pill { display: inline-block; border-radius: 3px; padding: 5px 8px; font-size: 10px; font-weight: 760; }
.engine-protocol { color: #506a60; background: #e9efea; }.default-pill { color: #8c613b; background: #f3eadb; }.enabled-pill.enabled { color: #32624b; background: #e3eee7; }.enabled-pill.disabled { color: #807b72; background: #eeece7; }
.engine-card h3 { margin: 12px 0 5px; font-size: 18px; }.engine-model, .engine-url { margin: 0; color: #7a8580; font-size: 11px; }.engine-url { overflow-wrap: anywhere; margin-top: 5px; }
.engine-actions { margin-top: 14px; border-top: 1px solid #e7ebe7; padding-top: 12px; color: #85908b; font-size: 10px; }.engine-actions button { border: 0; padding: 0; background: none; color: var(--portal-accent, #376c55); font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; }
.engine-editor { align-self: start; border: 1px solid #dce3dc; padding: 24px; background: #fff; }.editor-intro { margin: 12px 0 20px; color: #77827d; font-size: 11px; line-height: 1.75; }.engine-editor form { display: grid; gap: 14px; }.engine-editor label { display: grid; gap: 6px; font-size: 11px; font-weight: 750; }
.engine-editor input:not([type=checkbox]), .engine-editor select, .candidate-tools input { width: 100%; min-width: 0; border: 1px solid #dce3dc; border-radius: 3px; padding: 10px 11px; background: #fff; color: var(--portal-text, #202b2d); font: inherit; font-size: 12px; }
.field-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }.check-field { display: flex !important; align-items: center; gap: 8px; }.queue-note { margin: -8px 0 0 22px; color: #6f7f75; font-size: 10px; line-height: 1.6; }.key-note { margin: -4px 0 0; color: #818b85; font-size: 10px; line-height: 1.7; }.key-note code { color: #526c60; font-size: 10px; }
.form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }.primary-button { border: 0; border-radius: 3px; padding: 11px 17px; background: var(--portal-accent, #376c55); color: white; font: inherit; font-size: 11px; font-weight: 780; cursor: pointer; }.primary-button:disabled, .candidate-action button:disabled { opacity: .55; cursor: not-allowed; }.test-button { border: 1px solid #dce3dc; padding: 9px 12px; background: white; color: #52685e; font: inherit; font-size: 11px; font-weight: 730; cursor: pointer; }.test-button:disabled { opacity: .5; cursor: wait; }
.form-message, .test-message { margin: 0; color: #32624b; font-size: 11px; line-height: 1.6; }.form-message.error, .test-message.error, .inline-error { color: #a4463f; }.inline-error { border-top: 1px solid #e4d6d2; padding: 16px 0; font-size: 12px; }
.candidate-section { margin-top: 55px; border-top: 2px solid #263b37; padding-top: 22px; }.candidate-heading { align-items: end; }.candidate-heading h2 { margin-bottom: 6px; }.candidate-heading p { max-width: 690px; }.candidate-tools { display: flex; align-items: center; gap: 16px; flex: 0 0 auto; }.candidate-tools input { width: 190px; }
.candidate-list { border-top: 1px solid #dfe5df; }.candidate-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 20px; border-bottom: 1px solid #dfe5df; padding: 17px 2px; }.candidate-main { min-width: 0; }.candidate-labels { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: #78837e; font-size: 10px; }.guide-status { border-radius: 3px; padding: 4px 7px; font-weight: 750; }.guide-status.success { color: #32624b; background: #e3eee7; }.guide-status.failed { color: #9a453c; background: #f5e7e3; }.guide-status.pending, .guide-status.running { color: #8a6635; background: #f4edde; }.guide-status.not-generated { color: #76817b; background: #eff1ed; }
.candidate-main h3 { overflow: hidden; margin: 8px 0 5px; font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }.candidate-main h3 a { color: #2c3d38; }.candidate-main h3 a:hover { color: var(--portal-accent, #376c55); }.candidate-main p { overflow: hidden; margin: 0 0 7px; color: #77827d; font-size: 11px; line-height: 1.6; text-overflow: ellipsis; white-space: nowrap; }.candidate-main small { color: #919a95; font-size: 10px; }.candidate-action button { border: 1px solid #376c55; padding: 9px 12px; background: white; color: #376c55; font: inherit; font-size: 11px; font-weight: 750; white-space: nowrap; cursor: pointer; }.candidate-action button:not(:disabled):hover { background: #376c55; color: white; }.guide-error { margin-top: 9px; border-left: 2px solid #a4463f; padding: 7px 10px; background: #fbf5f2; color: #94493f; font-size: 10px; line-height: 1.6; overflow-wrap: anywhere; }.error-link { display: block; border: 0; margin-top: 7px; padding: 0; background: none; color: #a4463f; font: inherit; font-size: 10px; cursor: pointer; }
@media (max-width: 900px) { .admin-grid { grid-template-columns: 1fr; gap: 26px; }.engine-editor { max-width: none; }.candidate-heading { align-items: start; flex-direction: column; }.candidate-tools { width: 100%; }.candidate-tools input { flex: 1; } }
@media (max-width: 600px) { .reading-admin { padding: 8px 0 60px; }.page-heading { align-items: start; flex-direction: column; }.privacy-note { padding: 13px; }.engine-editor { padding: 19px; }.candidate-tools { align-items: stretch; flex-wrap: wrap; }.candidate-tools input { flex-basis: 100%; }.candidate-row { align-items: start; grid-template-columns: 1fr; gap: 12px; }.candidate-action { justify-self: start; }.candidate-main h3, .candidate-main p { white-space: normal; }.candidate-heading p { font-size: 11px; } }
</style>
