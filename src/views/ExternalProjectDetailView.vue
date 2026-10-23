<template>
  <main class="external-project-page">
    <div class="page-shell">
      <nav class="breadcrumbs" aria-label="面包屑导航">
        <router-link to="/projects">项目广场</router-link>
        <span aria-hidden="true">/</span>
        <router-link to="/projects#open-source">站外项目</router-link>
        <span aria-hidden="true">/</span>
        <span>{{ project?.fullName || '项目资料' }}</span>
      </nav>

      <div v-if="loading" class="page-state">正在读取来源资料…</div>
      <section v-else-if="error" class="page-state" role="alert">
        <strong>暂时无法读取这个项目。</strong>
        <button type="button" @click="loadProject">重新加载 ↗</button>
      </section>
      <el-empty v-else-if="!project" description="没有找到这份项目资料" />

      <template v-else>
        <section class="project-overview">
          <div class="overview-main">
            <div class="source-label">
              <span class="source-mark" aria-hidden="true">↗</span>
              <span><strong>{{ project.sourceName || project.sourcePlatform || '公开来源' }}</strong><small>站外项目 · 原始资料</small></span>
              <span class="source-tag">来源页同步</span>
            </div>

            <h1>{{ project.fullName }}</h1>
            <p class="project-description">{{ project.description || '来源平台暂未提供项目简介，打开原始页面查看完整说明。' }}</p>

            <div class="project-metrics" aria-label="项目公开数据">
              <div><strong>★ {{ formatCount(project.starCount) }}</strong><span>Stars</span></div>
              <div><strong>{{ formatCount(project.forkCount) }}</strong><span>Forks</span></div>
              <div><strong>{{ project.language || '未提供' }}</strong><span>主要语言</span></div>
              <div><strong>{{ project.licenseSpdx || '未提供' }}</strong><span>许可证</span></div>
            </div>

            <div class="overview-actions">
              <a class="source-button" :href="project.sourceUrl" target="_blank" rel="noopener noreferrer">
                打开原站项目 <span aria-hidden="true">↗</span>
              </a>
              <button class="capsule-button" type="button" :disabled="adding" @click="addToCapsule">
                {{ adding ? '正在加入…' : '加入我的落地舱 +' }}
              </button>
            </div>
          </div>

          <aside class="starting-note">
            <div class="note-top"><span>START HERE</span><span>学习建议</span></div>
            <h2>先看原文，再动手。</h2>
            <ol>
              <li><span>01</span><p>读项目说明，确认它解决什么问题。</p></li>
              <li><span>02</span><p>核对运行环境、安装步骤和许可证。</p></li>
              <li><span>03</span><p>只跑通一个最小示例，把命令和卡点记下来。</p></li>
            </ol>
            <p class="note-foot">这是开始学习的提示。功能、维护状态与使用条件请以原站为准。</p>
          </aside>
        </section>

        <section class="reading-guide" aria-labelledby="reading-guide-title">
          <div class="guide-heading">
            <div><span class="section-kicker">PROJECT READING / 读懂一个真实项目</span><h2 id="reading-guide-title">不止看它做什么，也看看它怎么想。</h2><p>从项目资料出发，整理出可核对的阅读路径、设计取舍与一个小练习。</p></div>
            <span v-if="readingGuide" class="guide-status" :class="readingGuide.status.toLowerCase()">{{ guideStatusText(readingGuide.status) }}</span>
          </div>
          <div v-if="guideLoading" class="guide-state">正在整理项目资料…</div>
          <div v-else-if="guideError" class="guide-state" role="alert">项目解读暂时无法加载。<button type="button" @click="loadReadingGuide">重试</button></div>
          <template v-else-if="readingGuide?.content">
            <div v-if="readingGuide.status !== 'SUCCESS'" class="guide-refresh-note">{{ readingGuide.status === 'FAILED' ? '最新一轮解读没有完成，以下仍是上一版内容。' : '项目资料有更新，以下内容来自上一版解读。' }}</div>
            <blockquote v-if="readingGuide.content.hook" class="guide-hook">{{ readingGuide.content.hook }}</blockquote>
            <div class="guide-summary">
              <article v-for="item in summaryFields" :key="item.key"><div class="summary-label"><span>{{ item.label }}</span><small :class="guideField(readingGuide.content[item.key]).evidenceStatus">{{ guideField(readingGuide.content[item.key]).evidenceStatus === 'source-backed' ? '有资料依据' : '待核对' }}</small></div><p>{{ guideField(readingGuide.content[item.key]).text || item.fallback }}</p><div v-if="sourceRefs(guideField(readingGuide.content[item.key]).sourceIds).length" class="citations"><a v-for="source in sourceRefs(guideField(readingGuide.content[item.key]).sourceIds)" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.path || source.title }} ↗</a></div></article>
            </div>

            <div v-if="readingGuide.content.readingPath?.length" class="guide-block">
              <div class="guide-block-heading"><span>01</span><div><h3>按这条路读</h3><p>从入口开始，逐步建立整体认识。</p></div></div>
              <ol class="reading-path"><li v-for="(item, index) in readingGuide.content.readingPath" :key="`${item.title}-${index}`"><span class="path-index">{{ String(index + 1).padStart(2, '0') }}</span><div><div class="path-title"><h4>{{ item.title }}</h4><small class="path-evidence" :class="item.evidenceStatus">{{ item.evidenceStatus === 'source-backed' ? '有资料依据' : '待核对' }}</small></div><p>{{ item.why }}</p><div v-if="sourceRefs(item.sourceIds).length" class="citations"><a v-for="source in sourceRefs(item.sourceIds)" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.path || source.title }} ↗</a></div></div></li></ol>
            </div>

            <div v-if="readingGuide.content.designInsights?.length" class="guide-block insights-block">
              <div class="guide-block-heading"><span>02</span><div><h3>值得带走的设计启发</h3><p>不是给项目打分，而是观察它如何处理具体问题和取舍。</p></div></div>
              <div class="insight-grid"><article v-for="(insight, index) in readingGuide.content.designInsights" :key="`${insight.title}-${index}`" class="insight-card"><div class="insight-top"><span>{{ String(index + 1).padStart(2, '0') }}</span><span class="evidence-tag" :class="insight.evidenceStatus">{{ insight.evidenceStatus === 'source-backed' ? '有资料依据' : '待核对' }}</span></div><h4>{{ insight.title }}</h4><p class="insight-observation">{{ insight.observation }}</p><div class="insight-tradeoff"><span>它的取舍</span><p>{{ insight.tradeoff }}</p></div><div class="insight-try"><span>可以试着迁移</span><p>{{ insight.tryInOwnProject }}</p></div><div v-if="sourceRefs(insight.sourceIds).length" class="citations"><a v-for="source in sourceRefs(insight.sourceIds)" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">依据：{{ source.path || source.title }} ↗</a></div></article></div>
            </div>

            <div class="guide-takeaway-grid">
              <article class="first-try"><span>03 / FIRST TRY</span><h3>可以从一个小实验开始</h3><p>{{ readingGuide.content.firstTry || '先从项目文档中找一个最小、可验证的功能开始。' }}</p></article>
              <article class="afterthought"><span>留给你的读后感</span><h3>读完，留下些什么？</h3><p>{{ readingGuide.content.afterthought || '把你自己的判断写下来，和项目作者的选择对照看看。' }}</p></article>
            </div>
            <div v-if="readingGuide.content.reflectionPrompts?.length" class="guide-prompts"><strong>继续想一想</strong><ul><li v-for="(prompt, index) in readingGuide.content.reflectionPrompts" :key="index">{{ prompt }}</li></ul></div>
            <p v-if="readingGuide.content.limits" class="guide-limits"><strong>资料边界：</strong>{{ readingGuide.content.limits }}</p>
            <div v-if="readingGuide.content.sourceReferences?.length" class="guide-sources"><span>本次阅读资料</span><a v-for="source in readingGuide.content.sourceReferences" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.path || source.title }} ↗</a><small>基于 {{ readingGuide.sourceVersion ? readingGuide.sourceVersion.slice(0, 10) : '当前同步版本' }} 的公开资料；内容由 {{ readingGuide.engineName || '配置的解读引擎' }} 整理，请通过原文核对。</small></div>
          </template>
          <div v-else class="guide-state guide-empty">
            <template v-if="readingGuide?.status === 'PENDING' || readingGuide?.status === 'RUNNING'">管理员已提交解读任务，内容准备好后会显示在这里。</template>
            <template v-else-if="readingGuide?.status === 'FAILED'">这次项目解读没有生成。你仍可以从原站资料和下方的读者分享开始了解。</template>
            <template v-else>这份项目还没有解读。先从原始项目资料开始，也欢迎管理员配置引擎后生成阅读指南。</template>
          </div>
        </section>

        <section id="reader-reflections" class="reflection-room" aria-labelledby="reflection-title">
          <div class="reflection-heading">
            <div>
              <span class="section-kicker">读后感 / NOTES FROM READERS</span>
              <h2 id="reflection-title">读完之后，什么留在你手上？</h2>
              <p>不必写项目总结。记下一处让你停下来想的设计、你自己的判断，或一个想带回自己项目的点子。</p>
            </div>
            <button type="button" class="reflection-write" @click="reflectionComposerOpen = true">写下我的读后感 <span aria-hidden="true">↗</span></button>
          </div>
          <div class="reflection-prompt">
            <span>留给你的问题</span>
            <strong>这个项目把什么变简单了？它又把复杂性放到了哪里？</strong>
            <small>从一个具体选择开始，写出你自己的答案。</small>
          </div>
          <div v-if="reflectionsLoading" class="reflection-state">正在读大家的想法…</div>
          <div v-else-if="reflectionsError" class="reflection-state" role="alert">读后感暂时无法加载。<button type="button" @click="loadReflections">重试</button></div>
          <div v-else-if="reflections.length" class="reflection-list">
            <TopicRow v-for="reflection in reflections" :key="reflection.id" :topic="reflection" />
            <router-link class="reflection-all" :to="{ path: '/community/boards/project-share', query: { externalProjectId: project.id, contentType: 'reflection' } }">看全部读后感与回复 ↗</router-link>
          </div>
          <div v-else class="reflection-state empty-reflections">还没有读者留下想法。你可以成为第一个。</div>
        </section>

        <section class="source-record" aria-labelledby="source-record-title">
          <div class="record-heading">
            <div><span class="section-kicker">SOURCE RECORD</span><h2 id="source-record-title">这份资料从哪里来</h2></div>
            <span class="synced-date">最近同步 {{ formatDate(project.syncedAt) }}</span>
          </div>
          <dl class="record-grid">
            <div><dt>来源平台</dt><dd>{{ project.sourceName || project.sourcePlatform || '公开来源' }}</dd></div>
            <div><dt>项目路径</dt><dd>{{ project.fullName }}</dd></div>
            <div><dt>主要语言</dt><dd>{{ project.language || '来源未提供' }}</dd></div>
            <div><dt>许可证</dt><dd>{{ project.licenseSpdx || '来源未提供，请查看原站' }}</dd></div>
            <div><dt>Stars</dt><dd>{{ formatCount(project.starCount) }}</dd></div>
            <div><dt>Forks</dt><dd>{{ formatCount(project.forkCount) }}</dd></div>
          </dl>
          <a class="record-link" :href="project.sourceUrl" target="_blank" rel="noopener noreferrer">查看来源页面与完整说明 ↗</a>
        </section>

        <section class="share-invitation">
          <div><span class="section-kicker">AFTER YOU TRY IT</span><h2>跑通了，或者卡住了，都值得聊聊。</h2><p>把真实的使用过程写下来，让后来的人少绕一点路。</p></div>
          <router-link :to="{ path: '/community/boards/tech-talk', query: { compose: '1' } }">去技术交流发帖 <span aria-hidden="true">↗</span></router-link>
        </section>
      </template>
      <CommunityComposer
        v-model="reflectionComposerOpen"
        board-code="project-share"
        :external-project-id="project?.id"
        :external-project-name="project?.fullName"
        content-type="reflection"
        @saved="handleReflectionSaved"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOpenSourceProject, getProjectReadingGuide } from '@/api/project'
import { listTopics } from '@/api/community'
import { addGrowthCapsuleItem } from '@/api/content'
import { getPortalUserId } from '@/utils/userIdentity'
import CommunityComposer from '@/components/CommunityComposer.vue'
import TopicRow from '@/components/TopicRow.vue'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const loading = ref(true)
const error = ref(false)
const adding = ref(false)
const reflections = ref([])
const reflectionsLoading = ref(false)
const reflectionsError = ref(false)
const reflectionComposerOpen = ref(false)
const readingGuide = ref(null)
const guideLoading = ref(false)
const guideError = ref(false)

const formatCount = (value) => value === null || value === undefined ? '—' : Number(value).toLocaleString('en-US')

const formatDate = (value) => {
  if (!value) return '暂无记录'
  const date = new Date(String(value).endsWith('Z') ? value : `${value}Z`)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date)
}

async function loadProject() {
  loading.value = true
  error.value = false
  project.value = null
  try {
    project.value = await getOpenSourceProject(route.params.id)
    await Promise.all([loadReflections(), loadReadingGuide()])
  } catch (loadError) {
    console.warn('读取站外项目资料失败', loadError)
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadReadingGuide() {
  if (!project.value) return
  guideLoading.value = true
  guideError.value = false
  readingGuide.value = null
  try { readingGuide.value = await getProjectReadingGuide(project.value.id) } catch (loadError) {
    console.warn('读取项目解读失败', loadError)
    guideError.value = true
  } finally { guideLoading.value = false }
}

const guideStatusText = (status) => ({ SUCCESS: '已整理', PENDING: '正在排队', RUNNING: '正在生成', FAILED: '更新失败', NOT_GENERATED: '待整理' })[status] || '项目阅读'
const summaryFields = [
  { key: 'projectPurpose', label: '它在解决什么', fallback: '现有资料不足以确认。' },
  { key: 'whoIsItFor', label: '适合谁了解', fallback: '现有资料没有明确说明目标使用者。' },
  { key: 'howItWorks', label: '目前能看出的工作方式', fallback: '请沿下方阅读路径核对项目资料。' }
]
function guideField(field) {
  if (field && typeof field === 'object') return field
  return { text: typeof field === 'string' ? field : '', sourceIds: [], evidenceStatus: 'needs-review' }
}
function sourceRefs(ids) {
  const references = readingGuide.value?.content?.sourceReferences || []
  if (!Array.isArray(ids)) return []
  const allowed = new Set(ids)
  return references.filter((source) => allowed.has(source.id))
}

async function loadReflections() {
  if (!project.value) return
  reflectionsLoading.value = true
  reflectionsError.value = false
  try {
    const result = await listTopics({
      board: 'project-share',
      externalProjectId: project.value.id,
      contentType: 'reflection',
      sort: 'recent',
      page: 1,
      size: 5
    })
    reflections.value = result?.records || []
  } catch (loadError) {
    console.warn('读取项目读后感失败', loadError)
    reflectionsError.value = true
  } finally {
    reflectionsLoading.value = false
  }
}

async function handleReflectionSaved() {
  ElMessage.success('读后感已发布')
  await loadReflections()
}

async function addToCapsule() {
  if (!project.value || adding.value) return
  adding.value = true
  try {
    await addGrowthCapsuleItem({
      userId: getPortalUserId(),
      sourceKind: 'open_source_project',
      sourceId: project.value.id,
      title: project.value.fullName,
      subtitle: [project.value.sourceName || project.value.sourcePlatform, project.value.language].filter(Boolean).join(' · '),
      note: ''
    })
    ElMessage.success('已加入落地舱，可以记录你的学习进展了')
    router.push('/growth-capsule')
  } catch (saveError) {
    console.warn('加入落地舱失败', saveError)
    ElMessage.error('加入失败，请稍后重试')
  } finally {
    adding.value = false
  }
}

watch(() => route.params.id, loadProject, { immediate: true })
</script>

<style scoped>
.external-project-page { min-height: calc(100vh - 76px); padding: 22px 28px 88px; background: var(--portal-bg, #f2f4ef); color: var(--portal-text, #202b2d); }
.page-shell { max-width: 1240px; margin: 0 auto; }
.breadcrumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0 0 22px; color: #798582; font-size: 12px; }
.breadcrumbs a { color: #426d59; }
.breadcrumbs span:last-child { overflow: hidden; max-width: min(45vw, 420px); text-overflow: ellipsis; white-space: nowrap; }
.project-overview { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr); gap: 42px; padding: clamp(30px, 5vw, 64px); border: 1px solid #dce3dc; background: #fff; }
.overview-main { min-width: 0; }
.source-label { display: flex; align-items: center; gap: 12px; }
.source-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: #e7efe9; color: #376b55; font-size: 20px; }
.source-label strong, .source-label small { display: block; }
.source-label strong { color: #283735; font-size: 13px; }
.source-label small { margin-top: 4px; color: #8a9490; font-size: 11px; }
.source-tag { margin-left: auto; border: 1px solid #d9e4dc; padding: 6px 9px; color: #527563; font-size: 10px; white-space: nowrap; }
.overview-main h1 { margin: 35px 0 14px; overflow-wrap: anywhere; font-size: clamp(32px, 5vw, 54px); font-weight: 780; letter-spacing: -.055em; line-height: 1.12; }
.project-description { max-width: 760px; margin: 0; color: #65716e; font-size: 15px; line-height: 1.9; }
.project-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-top: 36px; border-top: 1px solid #e3e8e3; border-bottom: 1px solid #e3e8e3; padding: 18px 0; }
.project-metrics div { min-width: 0; }
.project-metrics strong, .project-metrics span { display: block; overflow-wrap: anywhere; }
.project-metrics strong { color: #293a37; font-size: 15px; font-weight: 720; }
.project-metrics span { margin-top: 5px; color: #8b9591; font-size: 10px; letter-spacing: .04em; }
.overview-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 26px; }
.source-button, .capsule-button { display: inline-flex; align-items: center; justify-content: center; gap: 16px; min-height: 46px; border: 1px solid #376c55; padding: 0 17px; font: inherit; font-size: 12px; font-weight: 760; cursor: pointer; }
.source-button { background: #376c55; color: #fff; }
.capsule-button { background: #fff; color: #376c55; }
.capsule-button:disabled { opacity: .6; cursor: wait; }
.starting-note { align-self: stretch; padding: 28px; background: #f4f1e9; }
.note-top { display: flex; justify-content: space-between; gap: 12px; color: #7b6a4e; font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.note-top span:last-child { color: #8e9185; letter-spacing: 0; }
.starting-note h2 { margin: 29px 0 16px; font-size: 24px; letter-spacing: -.04em; }
.starting-note ol { margin: 0; padding: 0; list-style: none; }
.starting-note li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; border-top: 1px solid #ded9cc; padding: 15px 0; }
.starting-note li > span { color: #a85a4a; font-size: 10px; font-weight: 800; }
.starting-note li p { margin: 0; color: #5d6761; font-size: 12px; line-height: 1.7; }
.note-foot { margin: 8px 0 0; color: #8a8a7e; font-size: 10px; line-height: 1.7; }
.source-record { margin-top: 20px; border: 1px solid #dce3dc; padding: clamp(24px, 4vw, 42px); background: #fff; }
.reading-guide { margin-top: 20px; border: 1px solid #dce3dc; padding: clamp(24px, 4vw, 42px); background: #fff; }
.guide-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; }
.guide-heading h2 { margin: 8px 0 8px; font-size: clamp(24px, 3vw, 34px); letter-spacing: -.05em; }
.guide-heading p { margin: 0; color: #74807b; font-size: 12px; line-height: 1.7; }
.guide-status { flex: 0 0 auto; border: 1px solid #dce3dc; padding: 6px 9px; color: #64716b; font-size: 10px; }
.guide-status.success { border-color: #cee0d2; color: #376c55; background: #eff5f0; }.guide-status.failed { border-color: #e7ceca; color: #a4463f; background: #fbf1ef; }.guide-status.running, .guide-status.pending { border-color: #eadcbf; color: #8c6936; background: #faf5e9; }
.guide-state { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-height: 92px; border-top: 1px solid #e3e8e3; margin-top: 20px; color: #7d8883; font-size: 12px; line-height: 1.7; }
.guide-state button { border: 0; padding: 0; color: #376c55; background: none; font: inherit; font-weight: 750; cursor: pointer; }
.guide-empty { margin-top: 22px; padding: 18px 0; }
.guide-refresh-note { margin-top: 20px; border-left: 3px solid #c29652; padding: 9px 12px; color: #78643f; background: #faf5eb; font-size: 11px; }
.guide-hook { margin: 24px 0 0; border-left: 4px solid #376c55; padding: 13px 17px; color: #263b37; background: #f1f5f0; font-family: Georgia, "Noto Serif SC", serif; font-size: clamp(17px, 2vw, 22px); font-weight: 650; line-height: 1.6; }
.guide-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; margin-top: 20px; border-top: 1px solid #e2e8e2; border-bottom: 1px solid #e2e8e2; }
.guide-summary article { padding: 17px 0; }.guide-summary article + article { border-left: 1px solid #e2e8e2; padding-left: 20px; }.summary-label { display: flex; justify-content: space-between; align-items: center; gap: 6px; }.guide-summary span, .guide-sources > span { color: #48735e; font-size: 10px; font-weight: 800; letter-spacing: .06em; }.summary-label small, .path-evidence { border: 1px solid #d8e4d9; padding: 3px 5px; color: #376c55; font-size: 8px; white-space: nowrap; }.summary-label small.needs-review, .path-evidence.needs-review { border-color: #e6d5b5; color: #8a693b; background: #faf5eb; }.guide-summary p { margin: 8px 0 0; color: #53625c; font-size: 12px; line-height: 1.8; }
.guide-block { margin-top: 30px; }.guide-block-heading { display: flex; align-items: start; gap: 13px; margin-bottom: 15px; }.guide-block-heading > span { padding-top: 3px; color: #b44b43; font-size: 11px; font-weight: 850; }.guide-block-heading h3 { margin: 0; font-size: 20px; letter-spacing: -.04em; }.guide-block-heading p { margin: 5px 0 0; color: #8a9490; font-size: 11px; }
.reading-path { margin: 0; padding: 0; border-top: 1px solid #e2e8e2; list-style: none; }.reading-path li { display: grid; grid-template-columns: 42px 1fr; gap: 13px; border-bottom: 1px solid #e2e8e2; padding: 16px 3px; }.path-index { color: #93a098; font-family: Georgia, serif; font-size: 16px; }.path-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.reading-path h4, .insight-card h4 { margin: 0; color: #2c3b37; font-size: 15px; }.reading-path p, .insight-card p { margin: 6px 0 0; color: #687570; font-size: 12px; line-height: 1.8; }
.citations { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 9px; }.citations a { color: #47745d; font-size: 10px; font-weight: 720; }.citations a:hover, .guide-sources a:hover { text-decoration: underline; }
.insight-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }.insight-card { min-width: 0; border: 1px solid #e0e6e0; padding: 17px; background: #fbfcfa; }.insight-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; color: #9a5a4a; font-size: 10px; font-weight: 800; }.evidence-tag { border: 1px solid #d8e4d9; padding: 4px 6px; color: #376c55; font-size: 9px; }.evidence-tag.needs-review { border-color: #e6d5b5; color: #8a693b; background: #faf5eb; }.insight-tradeoff, .insight-try { margin-top: 13px; border-top: 1px solid #e6eae5; padding-top: 10px; }.insight-tradeoff > span, .insight-try > span { color: #8a6a44; font-size: 10px; font-weight: 780; }.insight-tradeoff p, .insight-try p { margin-top: 5px; }
.guide-takeaway-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }.first-try, .afterthought { min-width: 0; padding: 20px; }.first-try { background: #25443c; color: #f5f3eb; }.afterthought { background: #f4f1e9; color: #34443d; }.first-try > span, .afterthought > span { color: #c8d7cb; font-size: 9px; font-weight: 820; letter-spacing: .11em; }.afterthought > span { color: #9a654b; }.first-try h3, .afterthought h3 { margin: 10px 0 7px; font-size: 17px; }.first-try p, .afterthought p { margin: 0; color: inherit; opacity: .82; font-size: 12px; line-height: 1.8; }
.guide-prompts { margin-top: 22px; border-top: 1px solid #e2e8e2; padding-top: 17px; }.guide-prompts > strong { color: #2f423a; font-size: 12px; }.guide-prompts ul { display: grid; gap: 8px; margin: 10px 0 0; padding-left: 18px; color: #67736d; font-size: 12px; line-height: 1.7; }.guide-limits { margin: 17px 0 0; border-left: 2px solid #c8b58f; padding: 8px 11px; color: #7b7568; background: #f8f5ee; font-size: 10px; line-height: 1.7; }.guide-limits strong { color: #675b47; }
.guide-sources { display: flex; flex-wrap: wrap; align-items: center; gap: 9px 14px; margin-top: 20px; border-top: 1px solid #e2e8e2; padding-top: 14px; }.guide-sources a { color: #47745d; font-size: 10px; }.guide-sources small { flex-basis: 100%; color: #909a95; font-size: 9px; line-height: 1.6; }
.reflection-room { margin-top: 20px; border: 1px solid #dce3dc; padding: clamp(24px, 4vw, 42px); background: #fff; }
.reflection-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; }
.reflection-heading h2 { margin: 8px 0 8px; font-size: clamp(23px, 3vw, 31px); letter-spacing: -.045em; }
.reflection-heading p { max-width: 650px; margin: 0; color: #73807b; font-size: 13px; line-height: 1.8; }
.reflection-write { flex: 0 0 auto; border: 0; border-bottom: 1px solid #376c55; padding: 8px 0; color: #376c55; background: transparent; font: inherit; font-size: 12px; font-weight: 760; cursor: pointer; }
.reflection-write span { margin-left: 10px; }
.reflection-prompt { display: grid; gap: 7px; margin-top: 24px; border-left: 3px solid #b94a42; padding: 15px 18px; background: #f5f2eb; }
.reflection-prompt span { color: #9c594b; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.reflection-prompt strong { color: #2b3a37; font-size: 16px; font-weight: 680; }
.reflection-prompt small { color: #7f8984; font-size: 11px; }
.reflection-list { display: grid; margin-top: 14px; border-top: 1px solid #e3e8e3; }
.reflection-list .topic-row { border-bottom: 1px solid #e3e8e3; }
.reflection-all { justify-self: start; margin-top: 15px; color: #376c55; font-size: 12px; font-weight: 740; }
.reflection-state { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 80px; color: #7d8883; font-size: 13px; }
.reflection-state button { border: 0; padding: 0; color: #376c55; background: none; font: inherit; font-weight: 700; cursor: pointer; }
.empty-reflections { margin-top: 12px; border-top: 1px solid #e3e8e3; }
.record-heading { display: flex; justify-content: space-between; align-items: end; gap: 18px; border-bottom: 1px solid #e1e7e1; padding-bottom: 18px; }
.section-kicker { color: #47745d; font-size: 10px; font-weight: 800; letter-spacing: .13em; }
.record-heading h2, .share-invitation h2 { margin: 7px 0 0; font-size: 24px; letter-spacing: -.04em; }
.synced-date { color: #89938f; font-size: 11px; }
.record-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; margin: 0; }
.record-grid div { min-width: 0; border-bottom: 1px solid #e9ede8; padding: 16px 0; }
.record-grid dt { color: #89938f; font-size: 10px; }
.record-grid dd { margin: 6px 0 0; overflow-wrap: anywhere; color: #354541; font-size: 12px; font-weight: 650; }
.record-link { display: inline-block; margin-top: 19px; color: #376c55; font-size: 12px; font-weight: 750; }
.share-invitation { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 20px; border-top: 2px solid #263c39; border-bottom: 1px solid #d8e0d9; padding: 28px 0; }
.share-invitation p { margin: 9px 0 0; color: #74807b; font-size: 12px; }
.share-invitation > a { flex: 0 0 auto; border-bottom: 1px solid #376c55; padding: 8px 0; color: #376c55; font-size: 12px; font-weight: 760; }
.page-state { display: grid; justify-items: start; gap: 14px; min-height: 300px; align-content: center; padding: 32px; border: 1px solid #dce3dc; background: #fff; color: #66716d; }
.page-state strong { color: #2a3936; font-size: 20px; }
.page-state button { border: 0; padding: 0; background: none; color: #376c55; font: inherit; font-weight: 750; cursor: pointer; }
@media (max-width: 820px) { .project-overview { grid-template-columns: 1fr; gap: 28px; } .starting-note { max-width: none; } }
@media (max-width: 760px) { .guide-summary { grid-template-columns: 1fr; }.guide-summary article + article { border-top: 1px solid #e2e8e2; border-left: 0; padding-left: 0; }.insight-grid, .guide-takeaway-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .reflection-heading { align-items: start; flex-direction: column; } }
@media (max-width: 600px) { .external-project-page { padding: 16px 14px 56px; } .breadcrumbs { margin-bottom: 14px; } .project-overview { padding: 24px 18px; } .overview-main h1 { margin-top: 27px; font-size: 34px; } .project-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; margin-top: 26px; } .source-tag { font-size: 9px; } .starting-note { padding: 22px 18px; } .record-heading { align-items: start; flex-direction: column; } .record-heading h2, .share-invitation h2 { font-size: 21px; } .record-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; } .share-invitation { align-items: start; flex-direction: column; } .guide-heading { align-items: start; flex-direction: column; } .guide-heading h2 { font-size: 24px; } .reading-path li { grid-template-columns: 30px 1fr; gap: 8px; } }
</style>
