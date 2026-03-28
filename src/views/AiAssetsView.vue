<template>
  <div class="ai-page">
    <section class="hero-card">
      <div>
        <span class="eyebrow">AI Workspace</span>
        <h1>AI 资产中心</h1>
        <p>
          将智能体、Skill、MCP 与 OpenClaw 工作流做成可管理资产。这里已经接入后端保存接口，
          支持真实新增、编辑、删除；当后端暂时不可用时，仍会显示本地兜底数据。
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ aiAssets.length }}</div>
          <div class="stat-label">总资产数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ onlineCount }}</div>
          <div class="stat-label">在线资产</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ ownerCount }}</div>
          <div class="stat-label">维护团队</div>
        </div>
      </div>
    </section>

    <section class="control-card">
      <div class="control-row">
        <div class="control-left">
          <el-radio-group v-model="activeType" size="large">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button
              v-for="item in typeOptions"
              :key="item"
              :label="item"
            >
              {{ item }}
            </el-radio-button>
          </el-radio-group>

          <el-select v-model="activeStatus" placeholder="全部状态" class="status-select">
            <el-option label="全部状态" value="all" />
            <el-option label="在线" value="online" />
            <el-option label="试运行" value="trial" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </div>

        <el-button type="primary" @click="openCreateDialog">新增 AI 资产</el-button>
      </div>

      <div class="control-summary">
        <el-tag effect="plain" type="info">筛选结果 {{ filteredAssets.length }}</el-tag>
        <el-tag effect="plain" :type="usingFallback ? 'warning' : 'success'">
          {{ usingFallback ? '当前使用本地兜底数据' : '当前使用后端数据' }}
        </el-tag>
      </div>
    </section>

    <section class="asset-layout">
      <div class="asset-list">
        <article
          v-for="item in filteredAssets"
          :key="item.id"
          class="asset-card"
          :class="{ selected: selectedAsset?.id === item.id }"
          @click="selectedAsset = item"
        >
          <div class="asset-head">
            <div>
              <div class="asset-type">{{ item.type }}</div>
              <h3>{{ item.name }}</h3>
            </div>
            <el-tag :type="statusTypeMap[item.status] || 'info'" effect="dark">
              {{ statusLabelMap[item.status] || item.status || '未知' }}
            </el-tag>
          </div>
          <p class="asset-desc">{{ item.desc }}</p>
          <div class="asset-meta">
            <span>维护：{{ item.owner || '未设置' }}</span>
            <span>版本：{{ item.version || '未设置' }}</span>
          </div>
          <div class="asset-tags">
            <span v-for="tag in item.tags || []" :key="tag">{{ tag }}</span>
          </div>
        </article>
        <el-empty v-if="filteredAssets.length === 0" description="没有匹配到 AI 资产" />
      </div>

      <aside v-if="selectedAsset" class="detail-card">
        <div class="detail-top">
          <div class="detail-kicker">{{ selectedAsset.type }}</div>
          <h2>{{ selectedAsset.name }}</h2>
          <p>{{ selectedAsset.desc }}</p>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span>状态</span>
            <strong>{{ statusLabelMap[selectedAsset.status] || selectedAsset.status || '未设置' }}</strong>
          </div>
          <div class="detail-item">
            <span>维护团队</span>
            <strong>{{ selectedAsset.owner || '未设置' }}</strong>
          </div>
          <div class="detail-item">
            <span>版本</span>
            <strong>{{ selectedAsset.version || '未设置' }}</strong>
          </div>
          <div class="detail-item">
            <span>更新日期</span>
            <strong>{{ selectedAsset.updatedAt || '未设置' }}</strong>
          </div>
        </div>

        <div class="capability-block">
          <h3>核心能力</h3>
          <div class="asset-tags">
            <span v-for="item in selectedAsset.capabilities || []" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="capability-block">
          <h3>入口地址</h3>
          <a class="entry-link" :href="selectedAsset.entryUrl" target="_blank" rel="noreferrer">
            {{ selectedAsset.entryUrl || '未设置' }}
          </a>
        </div>

        <div class="detail-actions">
          <el-button type="primary" :icon="Link" @click="openEntry(selectedAsset)">
            打开入口
          </el-button>
          <el-button plain :icon="EditPen" @click="openEditDialog(selectedAsset)">
            编辑
          </el-button>
          <el-button plain :icon="DocumentCopy" @click="copyEntry(selectedAsset.entryUrl)">
            复制地址
          </el-button>
          <el-button type="danger" plain :icon="Delete" @click="handleDelete(selectedAsset)">
            删除
          </el-button>
        </div>
      </aside>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="editingAsset.id ? '编辑 AI 资产' : '新增 AI 资产'"
      width="720px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editingAsset" :rules="rules" label-width="100px">
        <div class="form-grid">
          <el-form-item label="资产名称" prop="name">
            <el-input v-model="editingAsset.name" placeholder="例如：研发发布助手" />
          </el-form-item>
          <el-form-item label="资产类型" prop="type">
            <el-select v-model="editingAsset.type" placeholder="请选择资产类型">
              <el-option v-for="item in assetTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="editingAsset.status" placeholder="请选择状态">
              <el-option label="在线" value="online" />
              <el-option label="试运行" value="trial" />
              <el-option label="草稿" value="draft" />
            </el-select>
          </el-form-item>
          <el-form-item label="维护团队" prop="owner">
            <el-input v-model="editingAsset.owner" placeholder="例如：DevOps Team" />
          </el-form-item>
          <el-form-item label="版本号" prop="version">
            <el-input v-model="editingAsset.version" placeholder="例如：v1.0.0" />
          </el-form-item>
          <el-form-item label="更新日期" prop="updatedAt">
            <el-input v-model="editingAsset.updatedAt" placeholder="例如：2026-03-28" />
          </el-form-item>
        </div>

        <el-form-item label="入口地址" prop="entryUrl">
          <el-input v-model="editingAsset.entryUrl" placeholder="https://example.com/ai-workspace" />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="editingAsset.desc"
            type="textarea"
            :rows="3"
            placeholder="描述这个 AI 资产的作用"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="editingAsset.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入后回车"
          />
        </el-form-item>

        <el-form-item label="核心能力">
          <el-select
            v-model="editingAsset.capabilities"
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
import { Delete, DocumentCopy, EditPen, Link } from '@element-plus/icons-vue'
import { deleteAiAsset, getAiAssetsWithFallback, saveAiAsset } from '@/api/content'
import { portalResources } from '@/data/portal'

const fallbackAssets = portalResources.aiAssets
const aiAssets = ref([])
const selectedAsset = ref(null)
const activeType = ref('all')
const activeStatus = ref('all')
const usingFallback = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const editingAsset = ref(createEmptyAsset())

const statusLabelMap = {
  online: '在线',
  trial: '试运行',
  draft: '草稿'
}

const statusTypeMap = {
  online: 'success',
  trial: 'warning',
  draft: 'info'
}

const assetTypeOptions = ['Agent', 'Skill', 'MCP', 'OpenClaw']

const rules = {
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择资产类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  owner: [{ required: true, message: '请输入维护团队', trigger: 'blur' }],
  entryUrl: [{ required: true, message: '请输入入口地址', trigger: 'blur' }]
}

const typeOptions = computed(() => [...new Set(aiAssets.value.map((item) => item.type).filter(Boolean))])

const filteredAssets = computed(() =>
  aiAssets.value.filter((item) => {
    const typeMatch = activeType.value === 'all' || item.type === activeType.value
    const statusMatch = activeStatus.value === 'all' || item.status === activeStatus.value
    return typeMatch && statusMatch
  })
)

watch(filteredAssets, (items) => {
  if (items.length === 0) {
    selectedAsset.value = null
    return
  }

  if (!selectedAsset.value || !items.some((item) => item.id === selectedAsset.value.id)) {
    selectedAsset.value = items[0]
  }
})

const onlineCount = computed(() => aiAssets.value.filter((item) => item.status === 'online').length)
const ownerCount = computed(() => new Set(aiAssets.value.map((item) => item.owner).filter(Boolean)).size)

function createEmptyAsset() {
  return {
    id: null,
    resourceCode: '',
    kind: 'ai',
    name: '',
    type: 'Agent',
    owner: '',
    status: 'draft',
    version: '',
    updatedAt: '',
    entryUrl: '',
    desc: '',
    tags: [],
    capabilities: []
  }
}

function normalizeAsset(asset) {
  return {
    ...createEmptyAsset(),
    ...asset,
    kind: 'ai',
    tags: Array.isArray(asset?.tags) ? asset.tags : [],
    capabilities: Array.isArray(asset?.capabilities) ? asset.capabilities : []
  }
}

async function loadAssets() {
  const { data, fallback } = await getAiAssetsWithFallback({ size: 100 })
  aiAssets.value = (fallback ? fallbackAssets : data).map(normalizeAsset)
  usingFallback.value = fallback

  if (fallback) {
    ElMessage.warning('AI 资产接口不可用，已切换为本地数据')
  }
}

function openCreateDialog() {
  editingAsset.value = createEmptyAsset()
  dialogVisible.value = true
}

function openEditDialog(asset) {
  editingAsset.value = normalizeAsset(asset)
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const saved = await saveAiAsset(editingAsset.value)
    const normalized = normalizeAsset(saved)
    const index = aiAssets.value.findIndex((item) => item.id === normalized.id)

    if (index >= 0) {
      aiAssets.value.splice(index, 1, normalized)
    } else {
      aiAssets.value.unshift(normalized)
    }

    usingFallback.value = false
    selectedAsset.value = normalized
    dialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.warn('保存 AI 资产失败', error)
    ElMessage.error('保存失败，请确认后端接口已启动')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(asset) {
  try {
    await ElMessageBox.confirm(`确认删除「${asset.name}」？`, '提示', { type: 'warning' })
    await deleteAiAsset(asset.id)
    aiAssets.value = aiAssets.value.filter((item) => item.id !== asset.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.warn('删除 AI 资产失败', error)
      ElMessage.error('删除失败，请确认后端接口已启动')
    }
  }
}

const openEntry = (asset) => {
  if (!asset.entryUrl) {
    ElMessage.warning('该资产未配置入口地址')
    return
  }
  window.open(asset.entryUrl, '_blank', 'noopener,noreferrer')
}

const copyEntry = async (entryUrl) => {
  if (!entryUrl) {
    ElMessage.warning('该资产未配置入口地址')
    return
  }

  try {
    await navigator.clipboard.writeText(entryUrl)
    ElMessage.success('入口地址已复制')
  } catch (error) {
    console.warn('复制失败', error)
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  loadAssets()
})
</script>

<style scoped>
.ai-page {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.control-card,
.detail-card,
.asset-card {
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

.hero-card p {
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
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.control-left {
  justify-content: flex-start;
}

.control-summary {
  margin-top: 16px;
}

.status-select {
  width: 160px;
}

.asset-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
}

.asset-list {
  display: grid;
  gap: 14px;
}

.asset-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.asset-card:hover,
.asset-card.selected {
  transform: translateY(-2px);
  border-color: rgba(89, 208, 255, 0.4);
}

.asset-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.asset-type,
.detail-kicker {
  color: var(--portal-warm);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.asset-head h3,
.detail-top h2 {
  margin: 8px 0 0;
  font-size: 22px;
}

.asset-desc,
.detail-top p {
  margin: 14px 0 0;
  color: var(--portal-text-soft);
  line-height: 1.7;
}

.asset-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 16px;
  color: var(--portal-text-soft);
  font-size: 13px;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.asset-tags span {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
}

.detail-card {
  padding: 24px;
  position: sticky;
  top: 104px;
  height: fit-content;
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

.capability-block {
  margin-top: 24px;
}

.capability-block h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.entry-link {
  color: var(--portal-accent);
  word-break: break-all;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

@media (max-width: 1080px) {
  .hero-card,
  .asset-layout {
    grid-template-columns: 1fr;
  }

  .detail-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .hero-card,
  .control-card,
  .detail-card,
  .asset-card {
    padding: 18px;
    border-radius: 18px;
  }

  .hero-stats,
  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
