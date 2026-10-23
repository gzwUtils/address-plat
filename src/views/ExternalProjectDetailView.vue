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
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOpenSourceProject } from '@/api/project'
import { addGrowthCapsuleItem } from '@/api/content'
import { getPortalUserId } from '@/utils/userIdentity'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const loading = ref(true)
const error = ref(false)
const adding = ref(false)

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
  } catch (loadError) {
    console.warn('读取站外项目资料失败', loadError)
    error.value = true
  } finally {
    loading.value = false
  }
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
@media (max-width: 600px) { .external-project-page { padding: 16px 14px 56px; } .breadcrumbs { margin-bottom: 14px; } .project-overview { padding: 24px 18px; } .overview-main h1 { margin-top: 27px; font-size: 34px; } .project-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; margin-top: 26px; } .source-tag { font-size: 9px; } .starting-note { padding: 22px 18px; } .record-heading { align-items: start; flex-direction: column; } .record-heading h2, .share-invitation h2 { font-size: 21px; } .record-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; } .share-invitation { align-items: start; flex-direction: column; } }
</style>
