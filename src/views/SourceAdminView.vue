<template>
  <div class="source-page">
    <header class="source-intro"><div><span class="eyebrow">运营工作台 / 内容来源</span><h1>项目来源</h1><p>让好的项目自己走进来。选择来源、设定节奏，系统按规则收录；每次执行结果都留在这里。</p></div><button type="button" class="add-button" @click="startNew">＋ 添加来源</button></header>

    <div class="source-layout">
      <section class="source-list" aria-labelledby="source-list-title"><div class="section-heading"><div><span class="eyebrow">SOURCES / 01</span><h2 id="source-list-title">已连接的来源</h2></div><button type="button" @click="loadSources">刷新 ↻</button></div>
        <p v-if="loading" class="state">正在加载来源…</p><p v-else-if="loadError" class="state" role="alert">{{ loadError }}</p>
        <p v-else-if="!sources.length" class="state">还没有来源。添加一个公开订阅地址，或配置 GitHub 仓库搜索。</p>
        <article v-for="source in sources" :key="source.id" class="source-item"><div class="item-top"><span class="type-label">{{ source.sourceType === 'rss' ? 'RSS / ATOM' : 'GITHUB SEARCH' }}</span><span class="state-label" :class="source.enabled ? 'is-on' : 'is-off'">{{ source.enabled ? '已启用' : '已停用' }}</span></div><h3>{{ source.displayName }}</h3><p class="source-detail">{{ source.sourceType === 'rss' ? source.feedUrl : (source.queryText || '全部公开仓库') }}</p><div class="source-metrics"><span>每 {{ source.intervalHours }} 小时</span><span>最多 {{ source.maxItems }} 条</span><span :class="source.lastStatus === 'FAILED' ? 'has-error' : ''">{{ statusText(source) }}</span></div><p v-if="source.lastError" class="source-error">上次失败：{{ source.lastError }}</p><div class="source-foot"><span>{{ source.lastRunAt ? `上次执行 ${displayTime(source.lastRunAt)}` : '尚未执行' }}<br />{{ source.nextRunAt ? `下次计划 ${displayTime(source.nextRunAt)}` : '等待调度' }}</span><div><button type="button" :disabled="runningId === source.id" @click="runSource(source)">{{ runningId === source.id ? '执行中…' : '立即执行' }}</button><button type="button" @click="editSource(source)">编辑 ↗</button></div></div></article>
      </section>

      <aside class="editor" aria-labelledby="editor-title"><span class="eyebrow">CONFIGURE / 02</span><h2 id="editor-title">{{ editingId ? '编辑来源' : '添加新来源' }}</h2><p>请求超时即记为失败，不自动重试。已收录的项目会保留到下次成功更新。</p><form @submit.prevent="submit"><label>来源名称<input v-model.trim="form.displayName" maxlength="80" placeholder="例如：开源工具周刊" required /></label><label>来源类型<select v-model="form.sourceType"><option value="github_search">GitHub 仓库搜索</option><option value="rss">RSS / Atom 订阅</option></select></label>
          <template v-if="form.sourceType === 'rss'"><label>公开订阅地址<input v-model.trim="form.feedUrl" type="url" placeholder="https://example.com/feed.xml" required /></label><small class="field-help">支持公开 HTTPS RSS/Atom。仅收录标题、摘要和原文链接。</small></template>
          <template v-else><label>搜索词或限定条件<input v-model.trim="form.queryText" maxlength="100" placeholder="可留空，例如 language:Java" /></label><div class="field-pair"><label>近多少天创建<input v-model.number="form.periodDays" type="number" min="1" max="30" required /></label><label>最低星标<input v-model.number="form.minStars" type="number" min="0" max="1000000" required /></label></div><small class="field-help">只收录公开、非 fork、具有常见开源许可证的仓库。</small></template>
          <div class="field-pair"><label>每次最多收录<input v-model.number="form.maxItems" type="number" min="1" max="10" required /></label><label>执行间隔（小时）<input v-model.number="form.intervalHours" type="number" min="1" max="720" required /></label></div><label class="enabled-field"><input v-model="form.enabled" type="checkbox" /> 启用这个来源</label><p v-if="saveMessage" class="form-message" :class="{ error: saveError }" role="status">{{ saveMessage }}</p><div class="form-actions"><button type="submit" :disabled="saving">{{ saving ? '保存中…' : (editingId ? '保存修改' : '添加来源') }}</button><button v-if="editingId" type="button" @click="startNew">取消编辑</button></div></form></aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listExternalSources, saveExternalSource, runExternalSource } from '@/api/project'

const blank = () => ({ displayName: '', sourceType: 'rss', feedUrl: '', queryText: '', periodDays: 7, minStars: 10, maxItems: 5, intervalHours: 168, enabled: true })
const sources = ref([])
const loading = ref(true)
const loadError = ref('')
const form = ref(blank())
const editingId = ref(null)
const saving = ref(false)
const runningId = ref(null)
const saveMessage = ref('')
const saveError = ref(false)
const displayTime = (value) => {
  const date = new Date(String(value).endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? String(value).replace('T', ' ').slice(0, 16)
    : new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}
const statusText = (source) => source.lastStatus === 'FAILED' ? '上次失败' : source.lastStatus === 'SUCCESS' ? '上次成功' : '等待首次执行'
const errorText = (error) => error?.response?.data?.message || error?.message || '操作失败，请稍后再试'

async function loadSources() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await listExternalSources()
    sources.value = Array.isArray(result) ? result : []
  } catch (error) { loadError.value = errorText(error) } finally { loading.value = false }
}
function startNew() { editingId.value = null; form.value = blank(); saveMessage.value = ''; saveError.value = false }
function editSource(source) { editingId.value = source.id; form.value = { ...blank(), ...source }; saveMessage.value = ''; saveError.value = false; window.scrollTo({ top: 0, behavior: 'smooth' }) }
async function submit() {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false
  try {
    await saveExternalSource({ ...form.value, id: editingId.value })
    saveMessage.value = '已保存。启用的来源会在下次调度时执行。'
    await loadSources()
    if (!editingId.value) form.value = blank()
  } catch (error) { saveMessage.value = errorText(error); saveError.value = true } finally { saving.value = false }
}
async function runSource(source) {
  runningId.value = source.id
  saveMessage.value = ''
  try {
    const result = await runExternalSource(source.id)
    saveMessage.value = result.lastStatus === 'SUCCESS' ? `${source.displayName} 收录完成。` : `${source.displayName} 执行失败：${result.lastError || '未知错误'}`
    saveError.value = result.lastStatus !== 'SUCCESS'
    await loadSources()
  } catch (error) { saveMessage.value = errorText(error); saveError.value = true } finally { runningId.value = null }
}
onMounted(loadSources)
</script>

<style scoped>
.source-page { max-width: 1360px; margin: 0 auto; color: var(--portal-text); }
.source-intro { display: flex; justify-content: space-between; align-items: end; gap: 24px; border-bottom: 2px solid var(--portal-text); padding: 32px 12px 33px; }
.eyebrow { color: var(--portal-accent); font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.source-intro h1 { margin: 15px 0 12px; font-size: clamp(38px, 4.5vw, 58px); letter-spacing: -.07em; }
.source-intro p, .editor > p { max-width: 650px; margin: 0; color: var(--portal-text-soft); font-size: 14px; line-height: 1.8; }
.add-button, .form-actions button:first-child { border: 0; border-radius: 6px; padding: 13px 20px; background: var(--portal-accent); color: white; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.source-layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(310px, .75fr); gap: 32px; padding: 35px 12px 90px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; padding-bottom: 20px; }
.section-heading h2, .editor h2 { margin: 8px 0 0; font-size: 26px; letter-spacing: -.05em; }
.section-heading button, .source-foot button, .form-actions button:last-child { border: 0; padding: 4px 0; background: none; color: var(--portal-accent); font: inherit; font-size: 12px; font-weight: 750; cursor: pointer; }
.state { border-top: 1px solid var(--portal-line); padding: 25px 0; color: var(--portal-text-soft); font-size: 13px; }
.source-item { border-top: 1px solid var(--portal-line); padding: 22px 3px 18px; }
.item-top, .source-metrics, .source-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.type-label { color: var(--portal-accent); font-size: 10px; font-weight: 800; letter-spacing: .13em; }
.state-label { border-radius: 50px; padding: 5px 9px; font-size: 10px; font-weight: 750; }
.is-on { background: #e2eee7; color: #31624b; }.is-off { background: #ebe8e3; color: #847c73; }
.source-item h3 { margin: 13px 0 7px; font-size: 20px; }
.source-detail { overflow-wrap: anywhere; margin: 0; color: var(--portal-text-soft); font-size: 12px; line-height: 1.7; }
.source-metrics { justify-content: flex-start; gap: 8px; flex-wrap: wrap; margin: 16px 0; }
.source-metrics span { border: 1px solid var(--portal-line); border-radius: 3px; padding: 5px 8px; color: var(--portal-text-soft); font-size: 10px; }
.source-metrics .has-error { color: #a4463f; border-color: #d8b2aa; }
.source-error { margin: 0 0 13px; color: #a4463f; font-size: 11px; }
.source-foot { border-top: 1px solid var(--portal-line); padding-top: 14px; color: var(--portal-text-soft); font-size: 11px; }
.source-foot > div { display: flex; gap: 17px; }
.source-foot button:disabled { opacity: .5; cursor: not-allowed; }
.editor { align-self: start; border: 1px solid var(--portal-line); border-radius: 8px; padding: 26px; background: #fff; }
.editor > p { margin: 14px 0 25px; font-size: 12px; }
.editor form { display: grid; gap: 17px; }
.editor label { display: grid; gap: 7px; font-size: 12px; font-weight: 750; }
.editor input:not([type=checkbox]), .editor select { width: 100%; min-width: 0; border: 1px solid var(--portal-line); border-radius: 5px; padding: 10px 11px; background: white; color: var(--portal-text); font: inherit; font-size: 12px; }
.field-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.field-help { margin-top: -10px; color: var(--portal-text-soft); font-size: 11px; line-height: 1.6; }
.editor .enabled-field { display: flex; align-items: center; gap: 8px; }
.form-message { margin: 0; color: #31624b; font-size: 12px; }.form-message.error { color: #a4463f; }
.form-actions { display: flex; gap: 18px; align-items: center; }
@media (max-width: 900px) { .source-layout { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .source-intro { align-items: start; flex-direction: column; } .source-layout { padding: 25px 0 60px; } .field-pair { grid-template-columns: 1fr; } }
</style>
