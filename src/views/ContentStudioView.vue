<template>
  <div class="studio-page">
    <section class="hero-card">
      <div>
        <span class="eyebrow">Content Studio</span>
        <h1>统一资源管理</h1>
        <p>
          在一个视图里维护文章、AI 资产和生活内容。当前已接入后端统一资源接口，
          可用于门户运营、知识整理和内容编排。
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ resources.length }}</div>
          <div class="stat-label">资源总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ articleCount }}</div>
          <div class="stat-label">文章内容</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ lifeCount }}</div>
          <div class="stat-label">生活内容</div>
        </div>
      </div>
    </section>

    <section class="control-card">
      <div class="control-row">
        <div class="control-left">
          <el-radio-group v-model="activeKind" size="large">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="article">文章</el-radio-button>
            <el-radio-button label="ai">AI</el-radio-button>
            <el-radio-button label="life">生活</el-radio-button>
          </el-radio-group>
          <el-input v-model="keyword" placeholder="搜索标题、描述、标签" class="keyword-input" clearable />
        </div>
        <el-button type="primary" @click="openCreateDialog">新增资源</el-button>
      </div>
      <div class="control-summary">
        <el-tag effect="plain" type="info">筛选结果 {{ filteredResources.length }}</el-tag>
        <el-tag effect="plain" :type="usingFallback ? 'warning' : 'success'">
          {{ usingFallback ? '当前使用本地兜底数据' : '当前使用后端数据' }}
        </el-tag>
      </div>
    </section>

    <section class="content-layout">
      <div class="content-list">
        <article
          v-for="item in filteredResources"
          :key="`${item.kind}-${item.id}`"
          class="content-card"
          :class="{ selected: selectedResource?.id === item.id && selectedResource?.kind === item.kind }"
          @click="selectedResource = item"
        >
          <div v-if="item.kind === 'article' && item.coverImage" class="content-cover">
            <img :src="item.coverImage" :alt="item.title">
          </div>
          <div class="content-head">
            <div class="kind-badge">{{ kindLabelMap[item.kind] || item.kind }}</div>
            <div class="content-meta">{{ item.type || item.category || item.meta || '未分类' }}</div>
          </div>
          <h3>{{ item.name || item.title }}</h3>
          <p>{{ item.desc || item.excerpt || '暂无描述' }}</p>
          <div v-if="item.kind === 'article'" class="article-inline-meta">
            <span>{{ item.author || '匿名作者' }}</span>
            <span>{{ item.date || '未设置日期' }}</span>
          </div>
          <div class="tag-row">
            <span v-for="tag in item.tags || []" :key="tag">{{ tag }}</span>
          </div>
        </article>
        <el-empty v-if="filteredResources.length === 0" description="没有匹配到资源" />
      </div>

      <aside v-if="selectedResource" class="detail-card">
        <div class="detail-top">
          <div class="detail-kicker">{{ kindLabelMap[selectedResource.kind] }}</div>
          <h2>{{ selectedResource.name || selectedResource.title }}</h2>
          <p>{{ selectedResource.desc || selectedResource.excerpt || '暂无描述' }}</p>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <span>内容类型</span>
            <strong>{{ selectedResource.type || selectedResource.category || selectedResource.meta || '未设置' }}</strong>
          </div>
          <div class="detail-item">
            <span>日期</span>
            <strong>{{ selectedResource.updatedAt || selectedResource.date || '未设置' }}</strong>
          </div>
          <div v-if="selectedResource.kind === 'article'" class="detail-item">
            <span>作者</span>
            <strong>{{ selectedResource.author || '匿名作者' }}</strong>
          </div>
        </div>
        <div class="tag-row large">
          <span v-for="tag in selectedResource.tags || []" :key="tag">{{ tag }}</span>
        </div>
        <div class="detail-actions">
          <el-button plain :icon="EditPen" @click="openEditDialog(selectedResource)">编辑</el-button>
          <el-button type="danger" plain :icon="Delete" @click="handleDelete(selectedResource)">删除</el-button>
        </div>
      </aside>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="editingResource.id ? '编辑资源' : '新增资源'"
      width="760px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editingResource" :rules="rules" label-width="100px">
        <div class="form-grid">
          <el-form-item label="资源域" prop="kind">
            <el-select v-model="editingResource.kind">
              <el-option label="文章" value="article" />
              <el-option label="AI" value="ai" />
              <el-option label="生活" value="life" />
            </el-select>
          </el-form-item>
          <el-form-item :label="editingResource.kind === 'ai' ? '资产名称' : '标题'" prop="primaryName">
            <el-input v-model="primaryName" placeholder="请输入名称或标题" />
          </el-form-item>
          <el-form-item label="类型/分类">
            <el-input v-model="secondaryType" placeholder="文章填分类，AI/生活填类型" />
          </el-form-item>
          <el-form-item label="日期">
            <el-input v-model="editingResource.date" placeholder="例如：2026-03-28" />
          </el-form-item>
        </div>
        <template v-if="editingResource.kind === 'article'">
          <div class="form-grid">
            <el-form-item label="作者">
              <el-input v-model="editingResource.author" placeholder="例如：高致维 / 架构组" />
            </el-form-item>
            <el-form-item label="封面图">
              <el-input v-model="editingResource.coverImage" placeholder="https://example.com/cover.jpg" />
            </el-form-item>
          </div>
        </template>
        <el-form-item label="描述">
          <el-input v-model="descriptionText" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <template v-if="editingResource.kind === 'article'">
          <el-form-item label="Markdown 正文">
            <div class="markdown-editor">
              <div class="markdown-editor__head">
                <span>支持标题、列表、引用、代码块、加粗、链接</span>
                <div class="editor-head-actions">
                  <span v-if="draftSavedAtText" class="draft-tip">草稿已自动保存 · {{ draftSavedAtText }}</span>
                  <el-button text type="primary" @click="restoreDraft" :disabled="!hasDraft">恢复草稿</el-button>
                  <el-button text @click="clearDraft" :disabled="!hasDraft">清空草稿</el-button>
                  <el-tag effect="plain" type="info">在线写作</el-tag>
                </div>
              </div>
              <div class="markdown-toolbar">
                <el-input v-model="imageAltText" placeholder="图片说明，可选" class="image-field" clearable />
                <el-input v-model="imageUrl" placeholder="粘贴图片 URL 后插入 Markdown" class="image-field" clearable />
                <el-button plain @click="insertImageMarkdown">插入图片</el-button>
              </div>
              <div class="markdown-editor__body">
                <el-input
                  v-model="editingResource.contentBody"
                  type="textarea"
                  :rows="16"
                  resize="none"
                  placeholder="# 输入文章标题&#10;&#10;写下正文内容..."
                />
                <div class="markdown-preview markdown-body" v-html="markdownPreview" />
              </div>
            </div>
          </el-form-item>
        </template>
        <el-form-item label="标签">
          <el-select
            v-model="editingResource.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入后回车"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, EditPen } from '@element-plus/icons-vue'
import { deleteContentResource, getContentResourcesWithFallback, saveContentResource } from '@/api/content'
import { portalResources } from '@/data/portal'
import { clearContentDraft, loadContentDraft, saveContentDraft } from '@/utils/contentDraft'
import { renderMarkdown } from '@/utils/markdown'

const fallbackResources = [...portalResources.articles, ...portalResources.aiAssets, ...portalResources.lifeFeeds]
const resources = ref([])
const selectedResource = ref(null)
const activeKind = ref('all')
const keyword = ref('')
const usingFallback = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const editingResource = ref(createEmptyResource())
const hasDraft = ref(false)
const draftSavedAtText = ref('')
const imageUrl = ref('')
const imageAltText = ref('')
let draftTimer = null

const kindLabelMap = {
  article: '文章',
  ai: 'AI',
  life: '生活'
}

const rules = {
  kind: [{ required: true, message: '请选择资源域', trigger: 'change' }],
  primaryName: [{ required: true, message: '请输入名称或标题', trigger: 'blur' }]
}

const filteredResources = computed(() =>
  resources.value.filter((item) => {
    const kindMatch = activeKind.value === 'all' || item.kind === activeKind.value
    const raw = [item.name, item.title, item.desc, item.excerpt, ...(item.tags || [])].join(' ').toLowerCase()
    const keywordMatch = !keyword.value.trim() || raw.includes(keyword.value.trim().toLowerCase())
    return kindMatch && keywordMatch
  })
)

watch(filteredResources, (items) => {
  if (items.length === 0) {
    selectedResource.value = null
    return
  }
  if (!selectedResource.value || !items.some((item) => item.id === selectedResource.value.id && item.kind === selectedResource.value.kind)) {
    selectedResource.value = items[0]
  }
})

const articleCount = computed(() => resources.value.filter((item) => item.kind === 'article').length)
const lifeCount = computed(() => resources.value.filter((item) => item.kind === 'life').length)

const primaryName = computed({
  get: () => editingResource.value.kind === 'ai' ? editingResource.value.name : editingResource.value.title,
  set: (value) => {
    if (editingResource.value.kind === 'ai') {
      editingResource.value.name = value
      editingResource.value.title = ''
    } else {
      editingResource.value.title = value
      editingResource.value.name = ''
    }
  }
})

const secondaryType = computed({
  get: () => {
    if (editingResource.value.kind === 'article') return editingResource.value.category
    return editingResource.value.type
  },
  set: (value) => {
    if (editingResource.value.kind === 'article') {
      editingResource.value.category = value
      editingResource.value.type = ''
    } else {
      editingResource.value.type = value
      editingResource.value.category = ''
    }
  }
})

const descriptionText = computed({
  get: () => editingResource.value.kind === 'article' ? editingResource.value.excerpt : editingResource.value.desc,
  set: (value) => {
    if (editingResource.value.kind === 'article') {
      editingResource.value.excerpt = value
      editingResource.value.desc = ''
    } else {
      editingResource.value.desc = value
      editingResource.value.excerpt = ''
    }
  }
})

const markdownPreview = computed(() => {
  if (editingResource.value.kind !== 'article') {
    return '<p>仅文章支持 Markdown 在线写作。</p>'
  }
  const content = editingResource.value.contentBody?.trim()
  if (!content) {
    return '<p>Markdown 预览将显示在这里。</p>'
  }
  return renderMarkdown(content)
})

function createEmptyResource() {
  return {
    id: null,
    resourceCode: '',
    kind: 'article',
    title: '',
    name: '',
    excerpt: '',
    desc: '',
    category: '',
    type: '',
    meta: '',
    date: '',
    author: '',
    coverImage: '',
    contentBody: '',
    tags: []
  }
}

function normalizeResource(item) {
  return {
    ...createEmptyResource(),
    ...item,
    author: item?.author || '',
    coverImage: item?.coverImage || '',
    contentBody: item?.contentBody || '',
    tags: Array.isArray(item?.tags) ? item.tags : []
  }
}

const currentDraftId = computed(() => editingResource.value.id || 'new')

const buildDraftPayload = () => ({
  kind: editingResource.value.kind,
  title: editingResource.value.title,
  name: editingResource.value.name,
  excerpt: editingResource.value.excerpt,
  desc: editingResource.value.desc,
  category: editingResource.value.category,
  type: editingResource.value.type,
  meta: editingResource.value.meta,
  date: editingResource.value.date,
  author: editingResource.value.author,
  coverImage: editingResource.value.coverImage,
  contentBody: editingResource.value.contentBody,
  tags: editingResource.value.tags
})

function syncDraftState() {
  const draft = loadContentDraft(editingResource.value.kind, currentDraftId.value)
  hasDraft.value = !!draft
  draftSavedAtText.value = draft?.savedAt
    ? new Date(draft.savedAt).toLocaleString('zh-CN', { hour12: false })
    : ''
}

function restoreDraft() {
  const draft = loadContentDraft(editingResource.value.kind, currentDraftId.value)
  if (!draft) {
    ElMessage.info('当前没有可恢复的草稿')
    return
  }
  editingResource.value = normalizeResource({
    ...editingResource.value,
    ...draft
  })
  syncDraftState()
  ElMessage.success('草稿已恢复')
}

function clearDraft() {
  clearContentDraft(editingResource.value.kind, currentDraftId.value)
  syncDraftState()
  ElMessage.success('草稿已清空')
}

function insertImageMarkdown() {
  const url = imageUrl.value.trim()
  if (!url) {
    ElMessage.warning('请先输入图片 URL')
    return
  }
  const alt = imageAltText.value.trim() || '文章配图'
  const block = `\n\n![${alt}](${url})\n\n`
  editingResource.value.contentBody = `${editingResource.value.contentBody || ''}${block}`
  imageUrl.value = ''
  imageAltText.value = ''
  ElMessage.success('图片语法已插入')
}

function scheduleDraftSave() {
  if (!dialogVisible.value || editingResource.value.kind !== 'article') {
    return
  }
  if (draftTimer) {
    clearTimeout(draftTimer)
  }
  draftTimer = setTimeout(() => {
    saveContentDraft(editingResource.value.kind, currentDraftId.value, buildDraftPayload())
    syncDraftState()
  }, 600)
}

async function loadResources() {
  const { data, fallback } = await getContentResourcesWithFallback({ size: 200 })
  resources.value = (fallback ? fallbackResources : data).map(normalizeResource)
  usingFallback.value = fallback
  if (fallback) {
    ElMessage.warning('统一资源接口不可用，已切换为本地数据')
  }
}

function openCreateDialog() {
  editingResource.value = createEmptyResource()
  imageUrl.value = ''
  imageAltText.value = ''
  dialogVisible.value = true
  syncDraftState()
}

function openEditDialog(item) {
  editingResource.value = normalizeResource(item)
  imageUrl.value = ''
  imageAltText.value = ''
  dialogVisible.value = true
  syncDraftState()
}

async function submitForm() {
  if (!primaryName.value) {
    ElMessage.warning('请输入名称或标题')
    return
  }

  submitting.value = true
  try {
    const saved = await saveContentResource(editingResource.value)
    const normalized = normalizeResource(saved)
    const index = resources.value.findIndex((item) => item.id === normalized.id)
    if (index >= 0) {
      resources.value.splice(index, 1, normalized)
    } else {
      resources.value.unshift(normalized)
    }
    selectedResource.value = normalized
    usingFallback.value = false
    if (normalized.kind === 'article') {
      clearContentDraft(normalized.kind, 'new')
      if (normalized.id) {
        clearContentDraft(normalized.kind, normalized.id)
      }
    }
    hasDraft.value = false
    draftSavedAtText.value = ''
    dialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.warn('保存统一资源失败', error)
    ElMessage.error('保存失败，请确认后端接口已启动')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  try {
    await ElMessageBox.confirm(`确认删除「${item.name || item.title}」？`, '提示', { type: 'warning' })
    await deleteContentResource(item.id)
    resources.value = resources.value.filter((resource) => resource.id !== item.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.warn('删除统一资源失败', error)
      ElMessage.error('删除失败，请确认后端接口已启动')
    }
  }
}

onMounted(() => {
  loadResources()
})

watch(
  () => dialogVisible.value,
  (visible) => {
    if (!visible && draftTimer) {
      clearTimeout(draftTimer)
      draftTimer = null
    }
    if (visible) {
      syncDraftState()
    }
  }
)

watch(
  () => [
    dialogVisible.value,
    editingResource.value.kind,
    editingResource.value.title,
    editingResource.value.excerpt,
    editingResource.value.category,
    editingResource.value.date,
    editingResource.value.author,
    editingResource.value.coverImage,
    editingResource.value.contentBody,
    JSON.stringify(editingResource.value.tags || [])
  ],
  ([visible, kind]) => {
    if (!visible || kind !== 'article') {
      return
    }
    scheduleDraftSave()
  }
)
</script>

<style scoped>
.studio-page {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.control-card,
.detail-card,
.content-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  border-radius: 24px;
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.hero-card {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  padding: 28px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-card h1 {
  margin: 16px 0 10px;
  font-size: clamp(30px, 4vw, 48px);
}

.hero-card p,
.content-card p,
.detail-top p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--portal-accent-2);
}

.stat-label {
  margin-top: 8px;
  color: var(--portal-text-soft);
}

.control-card {
  padding: 20px 24px;
}

.control-row,
.control-summary,
.control-left {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.control-left {
  justify-content: flex-start;
}

.control-summary {
  margin-top: 16px;
}

.keyword-input {
  width: 260px;
}

.content-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
}

.content-list {
  display: grid;
  gap: 14px;
}

.content-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.content-card:hover,
.content-card.selected {
  transform: translateY(-2px);
  border-color: rgba(89, 208, 255, 0.4);
}

.content-cover {
  margin: -20px -20px 16px;
  overflow: hidden;
  border-radius: 20px 20px 16px 16px;
  aspect-ratio: 16 / 8;
}

.content-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.kind-badge,
.tag-row span {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.kind-badge {
  color: var(--portal-accent);
  background: rgba(89, 208, 255, 0.12);
}

.content-meta {
  color: var(--portal-text-soft);
  font-size: 12px;
}

.content-card h3,
.detail-top h2 {
  margin: 14px 0 10px;
  font-size: 22px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.article-inline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.tag-row span {
  background: rgba(255, 255, 255, 0.06);
  color: var(--portal-text-soft);
}

.large {
  margin-top: 20px;
}

.detail-card {
  padding: 24px;
  position: sticky;
  top: 104px;
  height: fit-content;
}

.detail-kicker {
  color: var(--portal-warm);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.detail-item {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--portal-line);
}

.detail-item span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.detail-item strong {
  display: block;
  margin-top: 8px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.markdown-editor {
  width: 100%;
  display: grid;
  gap: 12px;
}

.markdown-toolbar {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.image-field {
  width: 100%;
}

.markdown-editor__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.editor-head-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.draft-tip {
  color: var(--portal-accent-2);
}

.markdown-editor__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.markdown-preview {
  min-height: 100%;
  padding: 16px;
  border: 1px solid var(--portal-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  overflow: auto;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 0 0 12px;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(blockquote),
.markdown-body :deep(pre) {
  margin: 0 0 12px;
  line-height: 1.8;
}

.markdown-body :deep(ul) {
  padding-left: 18px;
}

.markdown-body :deep(blockquote) {
  padding: 10px 14px;
  border-left: 3px solid var(--portal-accent);
  background: rgba(89, 208, 255, 0.08);
  color: var(--portal-text-soft);
}

.markdown-body :deep(pre) {
  padding: 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.24);
  overflow: auto;
}

.markdown-body :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

@media (max-width: 1080px) {
  .hero-card,
  .content-layout {
    grid-template-columns: 1fr;
  }

  .detail-card {
    position: static;
  }

  .markdown-editor__body {
    grid-template-columns: 1fr;
  }

  .markdown-toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-card,
  .control-card,
  .detail-card,
  .content-card {
    padding: 18px;
    border-radius: 18px;
  }

  .hero-stats,
  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .keyword-input {
    width: 100%;
  }

  .detail-actions {
    flex-direction: column;
  }

  .markdown-editor__head,
  .editor-head-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
