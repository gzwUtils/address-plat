<template>
  <div class="capsule-page">
    <section class="hero-card">
      <div>
        <span class="eyebrow">Growth Capsule</span>
        <h1>{{ overview.capsuleName || '我的灵感落地舱' }}</h1>
        <p class="hero-desc">{{ overview.tagline || '把看过的内容，变成会发生的改变。' }}</p>
        <p class="ai-brief">{{ overview.aiBrief || '把浏览内容转成行动卡、打卡记录和持续成长轨迹。' }}</p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ overview.totalItems || 0 }}</div>
          <div class="stat-label">行动卡</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overview.inProgressItems || 0 }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overview.doneItems || 0 }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overview.streakDays || 0 }}</div>
          <div class="stat-label">连续打卡天数</div>
        </div>
      </div>
    </section>

    <section class="insight-card">
      <div class="insight-main">
        <span class="insight-kicker">Today Suggestion</span>
        <h2>今日建议</h2>
        <p>{{ overview.todaySuggestion || '先从一张最容易开始的行动卡起步。' }}</p>
      </div>
      <div class="insight-side">
        <div class="insight-pill">今日打卡 {{ overview.todayCheckins || 0 }}</div>
        <div class="insight-pill">连续记录 {{ overview.streakDays || 0 }} 天</div>
      </div>
    </section>

    <section class="control-card">
      <div class="control-row">
        <el-radio-group v-model="activeStatus" size="large">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="todo">待开始</el-radio-button>
          <el-radio-button label="in_progress">进行中</el-radio-button>
          <el-radio-button label="done">已完成</el-radio-button>
        </el-radio-group>
        <el-input v-model="keyword" placeholder="搜索标题、分类或行动建议" class="keyword-input" clearable />
      </div>
      <div class="control-summary">
        <el-tag effect="plain" type="info">当前筛选 {{ filteredItems.length }}</el-tag>
        <el-tag effect="plain" type="success">只读 + 新增权限，也能沉淀个人成长轨迹</el-tag>
      </div>
    </section>

    <section class="capsule-layout">
      <div class="capsule-list">
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="capsule-card"
          :class="{ selected: selectedItem?.id === item.id }"
          @click="selectedItem = item"
        >
          <div class="card-head">
            <div>
              <div class="card-kicker">{{ sourceKindMap[item.sourceKind] || item.sourceKind }}</div>
              <h3>{{ item.title }}</h3>
            </div>
            <el-tag :type="statusTypeMap[item.status] || 'info'" effect="dark">
              {{ statusLabelMap[item.status] || item.status }}
            </el-tag>
          </div>
          <p class="card-subtitle">{{ item.subtitle || '未分类' }}</p>
          <p class="card-value">{{ item.valueSummary }}</p>
          <div class="meta-row">
            <span>预估 {{ item.expectedMinutes || 0 }} 分钟</span>
            <span>{{ item.checkinCount || 0 }} 次打卡</span>
          </div>
        </article>
        <el-empty v-if="filteredItems.length === 0" description="还没有行动卡，先从一条内容开始加入落地舱" />
      </div>

      <aside v-if="selectedItem" class="detail-card">
        <div class="detail-top">
          <div class="detail-kicker">{{ sourceKindMap[selectedItem.sourceKind] || selectedItem.sourceKind }}</div>
          <h2>{{ selectedItem.title }}</h2>
          <p>{{ selectedItem.subtitle || '未分类' }}</p>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span>当前状态</span>
            <strong>{{ statusLabelMap[selectedItem.status] || selectedItem.status }}</strong>
          </div>
          <div class="detail-item">
            <span>预计投入</span>
            <strong>{{ selectedItem.expectedMinutes || 0 }} 分钟</strong>
          </div>
        </div>

        <section class="content-block">
          <h3>AI 价值提炼</h3>
          <p>{{ selectedItem.valueSummary }}</p>
        </section>

        <section class="content-block">
          <h3>第一步建议</h3>
          <p>{{ selectedItem.firstStep }}</p>
        </section>

        <section class="content-block">
          <h3>7 天推进建议</h3>
          <p>{{ selectedItem.sevenDayPlan }}</p>
        </section>

        <section v-if="selectedItem.note" class="content-block">
          <h3>我的备注</h3>
          <p>{{ selectedItem.note }}</p>
        </section>

        <div class="detail-actions">
          <el-button plain @click="jumpToSource(selectedItem)">查看原内容</el-button>
          <el-select v-model="nextStatus" class="status-select" placeholder="更新状态">
            <el-option label="待开始" value="todo" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="done" />
          </el-select>
          <el-button type="primary" :loading="statusSubmitting" @click="submitStatus">更新状态</el-button>
          <el-button plain @click="openCheckinDialog">新增打卡</el-button>
        </div>

        <section class="content-block">
          <div class="checkin-head">
            <h3>最近打卡</h3>
            <span>{{ selectedItem.recentCheckins?.length || 0 }} 条</span>
          </div>
          <div v-if="selectedItem.recentCheckins?.length" class="checkin-list">
            <article v-for="checkin in selectedItem.recentCheckins" :key="checkin.id" class="checkin-card">
              <div class="checkin-meta">
                <strong>{{ moodLabelMap[checkin.mood] || checkin.mood || '记录' }}</strong>
                <span>{{ checkin.createTime }}</span>
              </div>
              <p>{{ checkin.content }}</p>
            </article>
          </div>
          <el-empty v-else description="还没有打卡，先记录第一步" />
        </section>
      </aside>
    </section>

    <el-dialog v-model="checkinDialogVisible" title="新增打卡" width="520px" destroy-on-close>
      <el-form :model="checkinForm" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="checkinForm.mood">
            <el-option label="稳定推进" value="steady" />
            <el-option label="有突破" value="boost" />
            <el-option label="遇到阻碍" value="stuck" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="checkinForm.content"
            type="textarea"
            :rows="4"
            placeholder="记录你今天做了什么、遇到了什么问题、下一步准备怎么做"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="checkinSubmitting" @click="submitCheckin">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  addGrowthCapsuleCheckin,
  getGrowthCapsuleOverview,
  updateGrowthCapsuleItemStatus
} from '@/api/content'
import { getPortalUserId } from '@/utils/userIdentity'

const router = useRouter()
const overview = ref({ items: [] })
const selectedItem = ref(null)
const activeStatus = ref('all')
const keyword = ref('')
const nextStatus = ref('todo')
const statusSubmitting = ref(false)
const checkinDialogVisible = ref(false)
const checkinSubmitting = ref(false)
const checkinForm = ref({
  mood: 'steady',
  content: ''
})

const statusLabelMap = {
  todo: '待开始',
  in_progress: '进行中',
  done: '已完成'
}

const statusTypeMap = {
  todo: 'info',
  in_progress: 'warning',
  done: 'success'
}

const sourceKindMap = {
  project: '项目',
  article: '文章',
  ai: 'AI 资产',
  life: '生活灵感'
}

const moodLabelMap = {
  steady: '稳定推进',
  boost: '有突破',
  stuck: '遇到阻碍'
}

const filteredItems = computed(() =>
  (overview.value.items || []).filter((item) => {
    const statusMatch = activeStatus.value === 'all' || item.status === activeStatus.value
    const raw = [item.title, item.subtitle, item.valueSummary, item.firstStep, item.sevenDayPlan].join(' ').toLowerCase()
    const keywordMatch = !keyword.value.trim() || raw.includes(keyword.value.trim().toLowerCase())
    return statusMatch && keywordMatch
  })
)

watch(
  filteredItems,
  (items) => {
    if (!items.length) {
      selectedItem.value = null
      return
    }
    if (!selectedItem.value || !items.some((item) => item.id === selectedItem.value.id)) {
      selectedItem.value = items[0]
    }
  },
  { immediate: true }
)

watch(selectedItem, (item) => {
  nextStatus.value = item?.status || 'todo'
})

const loadOverview = async () => {
  try {
    overview.value = await getGrowthCapsuleOverview(getPortalUserId())
  } catch (error) {
    console.warn('加载灵感落地舱失败', error)
    ElMessage.error('落地舱暂时不可用，请稍后重试')
  }
}

const jumpToSource = (item) => {
  const path = item.sourceKind === 'project' ? `/project/${item.sourceId}` : `/explore/${item.sourceKind}/${item.sourceId}`
  router.push(path)
}

const submitStatus = async () => {
  if (!selectedItem.value) {
    return
  }
  statusSubmitting.value = true
  try {
    await updateGrowthCapsuleItemStatus(selectedItem.value.id, nextStatus.value)
    await loadOverview()
    selectedItem.value = overview.value.items.find((item) => item.id === selectedItem.value.id) || overview.value.items[0] || null
    ElMessage.success('状态已更新')
  } catch (error) {
    console.warn('更新行动卡状态失败', error)
    ElMessage.error('更新状态失败')
  } finally {
    statusSubmitting.value = false
  }
}

const openCheckinDialog = () => {
  checkinForm.value = {
    mood: 'steady',
    content: ''
  }
  checkinDialogVisible.value = true
}

const submitCheckin = async () => {
  if (!selectedItem.value || !checkinForm.value.content.trim()) {
    ElMessage.warning('请先填写打卡内容')
    return
  }
  checkinSubmitting.value = true
  try {
    await addGrowthCapsuleCheckin(selectedItem.value.id, checkinForm.value)
    checkinDialogVisible.value = false
    await loadOverview()
    selectedItem.value = overview.value.items.find((item) => item.id === selectedItem.value.id) || overview.value.items[0] || null
    nextStatus.value = selectedItem.value?.status || 'todo'
    ElMessage.success('打卡已记录')
  } catch (error) {
    console.warn('新增打卡失败', error)
    ElMessage.error('新增打卡失败')
  } finally {
    checkinSubmitting.value = false
  }
}

onMounted(loadOverview)
</script>

<style scoped>
.capsule-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.hero-card,
.insight-card,
.control-card,
.capsule-card,
.detail-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
  border-radius: 24px;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  padding: 28px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card h1 {
  margin: 16px 0 12px;
  font-size: clamp(30px, 4vw, 52px);
}

.hero-desc,
.ai-brief,
.content-block p,
.checkin-card p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.85;
}

.ai-brief {
  margin-top: 12px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.insight-card {
  display: grid;
  grid-template-columns: 1.1fr auto;
  gap: 16px;
  padding: 22px 24px;
}

.insight-kicker {
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.insight-card h2 {
  margin: 10px 0;
}

.insight-card p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.8;
}

.insight-side {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.insight-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--portal-line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--portal-text-soft);
}

.stat-card,
.detail-item,
.checkin-card {
  border: 1px solid var(--portal-line);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
}

.stat-card {
  padding: 18px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  margin-top: 6px;
  color: var(--portal-text-soft);
}

.control-card {
  padding: 20px 24px;
}

.control-row,
.control-summary,
.meta-row,
.detail-actions,
.checkin-head,
.checkin-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.control-row {
  flex-wrap: wrap;
}

.control-summary {
  margin-top: 16px;
  justify-content: flex-start;
}

.keyword-input {
  width: 320px;
}

.capsule-layout {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 20px;
}

.capsule-list {
  display: grid;
  gap: 14px;
  align-content: start;
}

.capsule-card {
  padding: 20px;
  cursor: pointer;
}

.capsule-card.selected {
  border-color: rgba(89, 208, 255, 0.35);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.card-kicker,
.detail-kicker {
  color: var(--portal-accent);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.capsule-card h3,
.detail-top h2 {
  margin: 10px 0 0;
}

.card-subtitle {
  margin: 10px 0 0;
  color: var(--portal-text-soft);
}

.card-value {
  margin: 14px 0 0;
  color: var(--portal-text-soft);
  line-height: 1.7;
}

.meta-row {
  margin-top: 14px;
  justify-content: flex-start;
  flex-wrap: wrap;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.detail-card {
  padding: 24px;
}

.detail-top p {
  margin: 10px 0 0;
  color: var(--portal-text-soft);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.detail-item {
  padding: 18px;
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

.content-block {
  margin-top: 20px;
}

.content-block h3,
.checkin-head h3 {
  margin: 0 0 10px;
}

.detail-actions {
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.status-select {
  width: 160px;
}

.checkin-list {
  display: grid;
  gap: 12px;
}

.checkin-card {
  padding: 16px;
}

.checkin-meta {
  font-size: 12px;
  color: var(--portal-text-soft);
}

@media (max-width: 1080px) {
  .hero-card,
  .insight-card,
  .capsule-layout {
    grid-template-columns: 1fr;
  }

  .keyword-input {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-card,
  .control-card,
  .capsule-card,
  .detail-card {
    border-radius: 18px;
  }

  .hero-card,
  .detail-card {
    padding: 18px;
  }

  .hero-stats,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
