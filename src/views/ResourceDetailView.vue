<template>
  <div class="detail-page" :class="{ 'reading-mode': readingMode }">
    <section v-if="resource" class="detail-shell">
      <div v-if="kind === 'article' && resource.coverImage" class="hero-cover">
        <img :src="resource.coverImage" :alt="primaryTitle">
      </div>
      <div class="detail-top">
        <el-button text @click="router.back()">返回</el-button>
        <div class="detail-badge">{{ kindLabel }}</div>
        <h1>{{ primaryTitle }}</h1>
        <p>{{ primaryDesc }}</p>
        <div v-if="kind === 'article'" class="article-author">
          <span>{{ resource.author || '匿名作者' }}</span>
          <span>{{ resource.date || '未设置日期' }}</span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <span>类型/分类</span>
          <strong>{{ secondaryLabel }}</strong>
        </div>
        <div class="detail-card">
          <span>日期/版本</span>
          <strong>{{ metaLabel }}</strong>
        </div>
        <div v-if="kind === 'article'" class="detail-card">
          <span>阅读时长</span>
          <strong>{{ readingMinutes }} 分钟</strong>
        </div>
        <div v-if="kind === 'article'" class="detail-card">
          <span>内容结构</span>
          <strong>{{ articleHeadings.length }} 个小节</strong>
        </div>
      </div>

      <div v-if="tags.length > 0" class="tag-row">
        <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>

      <section v-if="kind === 'article'" class="section-card article-insight">
        <div class="insight-block">
          <span>阅读摘要</span>
          <strong>{{ articleSummary }}</strong>
          <div class="reading-tools">
            <el-button size="small" plain @click="copyArticleLink">复制文章链接</el-button>
            <el-button size="small" plain @click="toggleReadingMode">
              {{ readingMode ? '退出夜读' : '夜间阅读' }}
            </el-button>
          </div>
        </div>
        <div v-if="articleHeadings.length > 0" class="outline-block">
          <span>阅读目录</span>
          <div class="outline-list">
            <div
              v-for="item in articleHeadings"
              :key="item.id"
              class="outline-row"
            >
              <button
                type="button"
                class="outline-item"
                :style="{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </button>
              <button
                type="button"
                class="outline-copy"
                @click="copyHeadingLink(item.id)"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="kind === 'article'" class="section-card author-panel">
        <div class="author-card">
          <div class="author-avatar">{{ authorInitial }}</div>
          <div class="author-copy">
            <span>作者</span>
            <strong>{{ resource.author || '匿名作者' }}</strong>
            <p>{{ authorBio }}</p>
          </div>
        </div>
      </section>

      <section v-if="capabilities.length > 0" class="section-card">
        <h2>核心能力</h2>
        <div class="tag-row">
          <span v-for="item in capabilities" :key="item">{{ item }}</span>
        </div>
      </section>

      <section class="section-card">
        <h2>详细说明</h2>
        <div
          v-if="kind === 'article' && resource.contentBody"
          class="markdown-body"
          v-html="articleContentHtml"
        />
        <p v-else>{{ primaryDesc }}</p>
      </section>

      <section v-if="resource.entryUrl || resource.meta" class="section-card">
        <h2>{{ kind === 'ai' ? '入口地址' : '补充信息' }}</h2>
        <p class="accent-text">{{ resource.entryUrl || resource.meta }}</p>
      </section>

      <section v-if="relatedResources.length > 0" class="section-card">
        <h2>相关推荐</h2>
        <div class="recommend-grid">
          <button
            v-for="item in relatedResources"
            :key="`${item.kind}-${item.id}`"
            type="button"
            class="recommend-card"
            @click="goToResource(item)"
          >
            <strong>{{ item.name || item.title }}</strong>
            <span>{{ item.type || item.category || item.meta || '资源' }}</span>
          </button>
        </div>
      </section>

      <section v-if="sameAuthorResources.length > 0" class="section-card">
        <h2>同作者文章</h2>
        <div class="recommend-grid">
          <button
            v-for="item in sameAuthorResources"
            :key="item.id"
            type="button"
            class="recommend-card"
            @click="goToResource(item)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.category || item.date || '文章' }}</span>
          </button>
        </div>
      </section>

      <section v-if="recentItems.length > 0" class="section-card">
        <h2>最近浏览</h2>
        <div class="recommend-grid">
          <button
            v-for="item in recentItems"
            :key="`${item.kind}-${item.id}`"
            type="button"
            class="recommend-card"
            @click="goToHistory(item)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.subtitle }}</span>
          </button>
        </div>
      </section>

      <div class="detail-actions">
        <el-button v-if="kind === 'ai' && resource.entryUrl" type="primary" @click="openEntry">
          打开入口
        </el-button>
        <el-button plain @click="addToGrowthCapsule">加入我的落地舱</el-button>
        <el-button v-if="kind === 'ai'" plain @click="router.push('/ai-workspace')">
          进入 AI 管理
        </el-button>
        <el-button v-if="kind !== 'ai'" plain @click="router.push('/content-studio')">
          进入资源管理
        </el-button>
      </div>
    </section>

    <el-empty v-else description="未找到对应内容" />

    <aside v-if="kind === 'article' && articleHeadings.length > 0" class="floating-outline">
      <div class="floating-outline__title">目录导航</div>
      <button
        v-for="item in articleHeadings"
        :key="item.id"
        type="button"
        class="floating-outline__item"
        :class="{ active: activeHeadingId === item.id }"
        :style="{ paddingLeft: `${(item.level - 1) * 10 + 12}px` }"
        @click="scrollToHeading(item.id)"
      >
        {{ item.text }}
      </button>
    </aside>

    <button
      v-if="showBackToTop"
      type="button"
      class="back-top"
      @click="scrollToTop"
    >
      回到顶部
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  addGrowthCapsuleItem,
  getAiAssetsWithFallback,
  getContentResourcesWithFallback,
  getRecentViews,
  saveRecentView
} from '@/api/content'
import { getClientId } from '@/utils/clientId'
import { getRecentHistory, pushRecentHistory } from '@/utils/recentHistory'
import { getPortalUserId } from '@/utils/userIdentity'
import {
  estimateReadingMinutes,
  extractMarkdownHeadings,
  renderMarkdown,
  stripMarkdown
} from '@/utils/markdown'

const route = useRoute()
const router = useRouter()

const resource = ref(null)
const resourcePool = ref([])
const recentItems = ref([])
const activeHeadingId = ref('')
const showBackToTop = ref(false)
const readingMode = ref(false)

const kind = computed(() => String(route.params.kind || ''))
const id = computed(() => String(route.params.id || ''))

const kindLabel = computed(() => {
  if (kind.value === 'article') return resource.value?.category || '文章'
  if (kind.value === 'ai') return resource.value?.type || 'AI 资产'
  if (kind.value === 'life') return resource.value?.type || '生活灵感'
  return '资源'
})

const primaryTitle = computed(() => resource.value?.name || resource.value?.title || '未命名内容')
const primaryDesc = computed(() => resource.value?.desc || resource.value?.excerpt || '暂无描述')
const secondaryLabel = computed(() => resource.value?.type || resource.value?.category || resource.value?.meta || '未设置')
const metaLabel = computed(() => resource.value?.version || resource.value?.updatedAt || resource.value?.date || '未设置')
const tags = computed(() => (Array.isArray(resource.value?.tags) ? resource.value.tags : []))
const capabilities = computed(() => (Array.isArray(resource.value?.capabilities) ? resource.value.capabilities : []))
const articleHeadings = computed(() => extractMarkdownHeadings(resource.value?.contentBody || ''))
const readingMinutes = computed(() => estimateReadingMinutes(resource.value?.contentBody || primaryDesc.value))
const articleSummary = computed(() => {
  const plain = stripMarkdown(resource.value?.contentBody || '')
  if (!plain) {
    return primaryDesc.value
  }
  return plain.slice(0, 120) + (plain.length > 120 ? '...' : '')
})
const authorInitial = computed(() => {
  const author = resource.value?.author?.trim()
  return author ? author.slice(0, 1).toUpperCase() : 'A'
})
const authorBio = computed(() => {
  const author = resource.value?.author?.trim()
  if (!author) {
    return '这个作者还没有补充更多介绍。'
  }
  return `${author} 持续分享项目复盘、技术实践和一线经验，适合用来沉淀长期能力。`
})
const articleContentHtml = computed(() => {
  const html = renderMarkdown(resource.value?.contentBody || '')
  if (!articleHeadings.value.length) {
    return html
  }
  let nextHtml = html
  articleHeadings.value.forEach((item) => {
    const escaped = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    nextHtml = nextHtml.replace(
      new RegExp(`<(h[1-6])>${escaped}</\\1>`),
      `<$1 id="${item.id}">${item.text}</$1>`
    )
  })
  return nextHtml
})
const sameAuthorResources = computed(() =>
  resourcePool.value
    .filter((item) => item.kind === 'article')
    .filter((item) => String(item.id) !== id.value)
    .filter((item) => item.author && item.author === resource.value?.author)
    .slice(0, 3)
)
const relatedResources = computed(() =>
  resourcePool.value
    .filter((item) => String(item.id) !== id.value)
    .filter((item) => {
      if (kind.value === 'ai') {
        return item.type === resource.value?.type
      }
      const currentTags = Array.isArray(resource.value?.tags) ? resource.value.tags : []
      const itemTags = Array.isArray(item.tags) ? item.tags : []
      return itemTags.some((tag) => currentTags.includes(tag))
    })
    .slice(0, 3)
)

const openEntry = () => {
  if (!resource.value?.entryUrl) {
    ElMessage.warning('该 AI 资产未配置入口地址')
    return
  }
  window.open(resource.value.entryUrl, '_blank', 'noopener,noreferrer')
}

const findById = (items) => items.find((item) => String(item.id) === id.value)

const normalizeRecentItem = (item) => ({
  id: item.id ?? item.targetId,
  targetId: item.targetId ?? item.id,
  kind: item.kind,
  title: item.title,
  subtitle: item.subtitle
})

const filterCurrentRecent = (items) =>
  items.filter((entry) => !(entry.kind === kind.value && String(entry.targetId ?? entry.id) === id.value))

const refreshRemoteRecent = async () => {
  try {
    const data = await getRecentViews(getClientId())
    recentItems.value = filterCurrentRecent(data.map(normalizeRecentItem))
  } catch (error) {
    console.warn('读取后端最近浏览失败，沿用本地记录', error)
  }
}

const recordRecent = async (item) => {
  const history = pushRecentHistory({
    id: item.id,
    kind: kind.value,
    title: item.name || item.title,
    subtitle: item.type || item.category || item.meta || '资源'
  })
  recentItems.value = filterCurrentRecent(history.map(normalizeRecentItem))

  try {
    await saveRecentView({
      clientId: getClientId(),
      kind: kind.value,
      targetId: item.id,
      title: item.name || item.title,
      subtitle: item.type || item.category || item.meta || '资源'
    })
    await refreshRemoteRecent()
  } catch (error) {
    console.warn('同步最近浏览失败，使用本地记录兜底', error)
  }
}

const goToResource = (item) => {
  router.push(`/explore/${item.kind}/${item.id}`)
}

const goToHistory = (item) => {
  const targetId = item.targetId ?? item.id
  router.push(item.kind === 'project' ? `/project/${targetId}` : `/explore/${item.kind}/${targetId}`)
}

const scrollToHeading = (headingId) => {
  const target = document.getElementById(headingId)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const copyText = async (value, successText) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(successText)
  } catch (error) {
    console.warn('复制失败', error)
    ElMessage.error('复制失败')
  }
}

const copyArticleLink = async () => {
  await copyText(window.location.href, '文章链接已复制')
}

const copyHeadingLink = async (headingId) => {
  await copyText(`${window.location.origin}${window.location.pathname}#${headingId}`, '小节链接已复制')
}

const toggleReadingMode = () => {
  readingMode.value = !readingMode.value
}

const updateReadingUi = () => {
  showBackToTop.value = window.scrollY > 360

  if (!articleHeadings.value.length) {
    activeHeadingId.value = ''
    return
  }

  let currentId = articleHeadings.value[0]?.id || ''
  articleHeadings.value.forEach((item) => {
    const node = document.getElementById(item.id)
    if (node && node.getBoundingClientRect().top <= 160) {
      currentId = item.id
    }
  })
  activeHeadingId.value = currentId
}

const addToGrowthCapsule = async () => {
  if (!resource.value) {
    return
  }
  try {
    await addGrowthCapsuleItem({
      userId: getPortalUserId(),
      sourceKind: kind.value,
      sourceId: resource.value.id,
      title: resource.value.name || resource.value.title,
      subtitle: resource.value.type || resource.value.category || resource.value.meta || '资源',
      note: primaryDesc.value
    })
    ElMessage.success('已加入灵感落地舱')
    router.push('/growth-capsule')
  } catch (error) {
    console.warn('加入灵感落地舱失败', error)
    ElMessage.error('加入灵感落地舱失败')
  }
}

async function loadResource() {
  if (kind.value === 'ai') {
    const { data } = await getAiAssetsWithFallback({ size: 200 })
    resourcePool.value = data
    resource.value = findById(data)
    if (resource.value) {
      await recordRecent(resource.value)
    }
    return
  }

  const { data } = await getContentResourcesWithFallback({ type: kind.value, size: 200 })
  resourcePool.value = data
  resource.value = findById(data)
  if (resource.value) {
    await recordRecent(resource.value)
  }
}

onMounted(async () => {
  recentItems.value = filterCurrentRecent(getRecentHistory().map(normalizeRecentItem))
  await refreshRemoteRecent()
  await loadResource()
  updateReadingUi()
  window.addEventListener('scroll', updateReadingUi, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateReadingUi)
})
</script>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
}

.detail-shell,
.detail-card,
.section-card {
  border: 1px solid var(--portal-line);
  background: var(--portal-surface);
  border-radius: 24px;
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.detail-shell {
  padding: 28px;
}

.hero-cover {
  margin: -28px -28px 24px;
  overflow: hidden;
  border-radius: 24px 24px 18px 18px;
  aspect-ratio: 16 / 7;
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.detail-top h1 {
  margin: 16px 0 12px;
  font-size: clamp(32px, 5vw, 56px);
}

.detail-top p,
.section-card p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.9;
}

.article-author {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  color: var(--portal-text-soft);
  font-size: 13px;
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
  margin: 0 0 14px;
  color: var(--portal-text-soft);
  line-height: 1.85;
}

.markdown-body :deep(ul) {
  padding-left: 18px;
}

.markdown-body :deep(blockquote) {
  padding: 12px 14px;
  border-left: 3px solid var(--portal-accent);
  background: rgba(89, 208, 255, 0.08);
  border-radius: 12px;
}

.markdown-body :deep(pre) {
  padding: 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  overflow: auto;
}

.markdown-body :deep(img) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 18px 0;
  border-radius: 18px;
  border: 1px solid var(--portal-line);
}

.markdown-body :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.detail-badge,
.tag-row span {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.detail-badge {
  margin-top: 12px;
  background: rgba(89, 208, 255, 0.12);
  color: var(--portal-accent);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.detail-card {
  padding: 18px;
}

.detail-card span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.detail-card strong {
  display: block;
  margin-top: 8px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.tag-row span {
  background: rgba(255, 255, 255, 0.06);
  color: var(--portal-text-soft);
}

.article-insight {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 16px;
}

.insight-block,
.outline-block {
  border: 1px solid var(--portal-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  padding: 18px;
}

.author-panel {
  padding: 0;
  overflow: hidden;
}

.author-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(89, 208, 255, 0.08), rgba(255, 184, 107, 0.08));
}

.author-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(89, 208, 255, 0.18);
  color: var(--portal-text);
  font-weight: 700;
}

.author-copy span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.author-copy strong {
  display: block;
  margin-top: 6px;
}

.author-copy p {
  margin-top: 8px;
}

.insight-block span,
.outline-block span {
  display: block;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.insight-block strong {
  display: block;
  margin-top: 10px;
  line-height: 1.8;
}

.reading-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.outline-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.outline-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.outline-item {
  border: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.outline-copy {
  border: 0;
  border-radius: 12px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--portal-text-soft);
  cursor: pointer;
}

.reading-mode .detail-shell,
.reading-mode .section-card,
.reading-mode .detail-card,
.reading-mode .floating-outline,
.reading-mode .back-top {
  background: rgba(9, 10, 14, 0.94);
  border-color: rgba(255, 231, 190, 0.08);
}

.reading-mode .detail-top p,
.reading-mode .section-card p,
.reading-mode .markdown-body :deep(p),
.reading-mode .markdown-body :deep(ul),
.reading-mode .markdown-body :deep(blockquote) {
  color: #e7dcc3;
}

.reading-mode .detail-top h1,
.reading-mode .section-card h2,
.reading-mode .insight-block strong,
.reading-mode .outline-item,
.reading-mode .floating-outline__item.active,
.reading-mode .back-top {
  color: #fff3da;
}

.reading-mode .markdown-body :deep(blockquote) {
  background: rgba(255, 231, 190, 0.08);
  border-left-color: #f2c572;
}

.reading-mode .markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.42);
}

.section-card {
  margin-top: 20px;
  padding: 20px;
}

.section-card h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.accent-text {
  color: var(--portal-accent);
  word-break: break-all;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.recommend-card {
  text-align: left;
  padding: 16px;
  border: 1px solid var(--portal-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  cursor: pointer;
}

.recommend-card strong {
  display: block;
}

.recommend-card span {
  display: block;
  margin-top: 8px;
  color: var(--portal-text-soft);
  font-size: 12px;
}

.floating-outline {
  position: fixed;
  top: 120px;
  right: max(20px, calc((100vw - 1100px) / 2 - 220px));
  width: 190px;
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--portal-line);
  border-radius: 20px;
  background: rgba(4, 12, 22, 0.82);
  box-shadow: var(--portal-shadow);
  backdrop-filter: blur(18px);
}

.floating-outline__title {
  font-size: 12px;
  color: var(--portal-text-soft);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.floating-outline__item {
  border: 0;
  border-radius: 12px;
  padding-top: 9px;
  padding-bottom: 9px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--portal-text-soft);
  text-align: left;
  cursor: pointer;
}

.floating-outline__item.active {
  color: var(--portal-text);
  background: rgba(89, 208, 255, 0.14);
}

.back-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  border: 1px solid rgba(89, 208, 255, 0.24);
  border-radius: 999px;
  padding: 12px 16px;
  background: rgba(6, 17, 30, 0.86);
  color: var(--portal-text);
  box-shadow: var(--portal-shadow);
  cursor: pointer;
}

@media (max-width: 640px) {
  .detail-shell,
  .detail-card,
  .section-card {
    border-radius: 18px;
  }

  .detail-shell {
    padding: 18px;
  }

  .hero-cover {
    margin: -18px -18px 18px;
    border-radius: 18px 18px 14px 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .article-insight {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 1380px) {
  .floating-outline {
    display: none;
  }
}
</style>
