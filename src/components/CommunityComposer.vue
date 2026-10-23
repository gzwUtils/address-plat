<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="min(650px, 94vw)">
    <div class="composer">
      <label>板块</label>
      <el-select v-model="form.boardCode" placeholder="选择板块" :disabled="isReflection">
        <el-option v-for="board in boards" :key="board.code" :label="board.name" :value="board.code" />
      </el-select>
      <label>标题</label>
      <el-input v-model="form.title" maxlength="120" show-word-limit :placeholder="titlePlaceholder" />
      <template v-if="form.externalProjectId">
        <label>关联项目</label>
        <div class="linked-project">{{ externalProjectName || topic?.externalProjectName || `站外项目 #${form.externalProjectId}` }}</div>
      </template>
      <template v-else>
        <label>关联项目（可选）</label>
        <el-select v-model="form.projectId" clearable filterable placeholder="选择一个项目">
          <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
        </el-select>
      </template>
      <div v-if="isReflection" class="reflection-guide">
        <strong>读完后，留下一个属于你的发现。</strong>
        <span>哪处设计让你停下来想了一下？它解决了什么，又带来了什么取舍？你会把什么带回自己的项目？</span>
      </div>
      <label>正文</label>
      <el-input v-model="form.body" type="textarea" :rows="9" maxlength="10000" show-word-limit :placeholder="bodyPlaceholder" />
      <p class="tip">内容会公开显示在这个项目的讨论区，其他人可以回复。</p>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">{{ topic?.id ? '保存修改' : '发布主题' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getProjects } from '@/api/project'
import { createTopic, listBoards, updateTopic } from '@/api/community'

const props = defineProps({ modelValue: Boolean, boardCode: { type: String, default: 'project-share' },
  projectId: { type: [Number, String], default: null }, externalProjectId: { type: [Number, String], default: null },
  externalProjectName: { type: String, default: '' }, contentType: { type: String, default: 'discussion' },
  topic: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'saved'])
const dialogVisible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const boards = ref([])
const projects = ref([])
const saving = ref(false)
const form = reactive({ boardCode: '', projectId: null, externalProjectId: null, contentType: 'discussion', title: '', body: '' })
const isReflection = computed(() => form.contentType === 'reflection')
const dialogTitle = computed(() => props.topic?.id ? '编辑主题' : (isReflection.value ? '写下读后感' : '发布主题'))
const titlePlaceholder = computed(() => isReflection.value ? '例如：我从这个项目学到的一点' : '用一句话说明要讨论什么')
const bodyPlaceholder = computed(() => isReflection.value
  ? '写下具体触发你思考的设计、你自己的判断，以及准备怎样把这个想法用起来…'
  : '分享你的想法、问题或经验…')

watch(() => props.modelValue, async (open) => {
  if (!open) return
  form.boardCode = props.topic?.boardCode || props.boardCode
  form.projectId = props.topic?.projectId || (props.projectId ? Number(props.projectId) : null)
  form.externalProjectId = props.topic?.externalProjectId || (props.externalProjectId ? Number(props.externalProjectId) : null)
  form.contentType = props.topic?.contentType || props.contentType || 'discussion'
  form.title = props.topic?.title || ''
  form.body = props.topic?.body || ''
  try {
    const [boardList, projectList] = await Promise.all([listBoards(), form.externalProjectId ? Promise.resolve([]) : getProjects()])
    boards.value = boardList
    projects.value = projectList
  } catch { ElMessage.warning('板块或项目列表暂时无法加载') }
})

async function submit() {
  if (form.title.trim().length < 5 || form.body.trim().length < 10) {
    ElMessage.warning('标题至少 5 字，正文至少 10 字')
    return
  }
  saving.value = true
  try {
    const payload = {
      boardCode: form.boardCode,
      projectId: form.projectId,
      externalProjectId: form.externalProjectId,
      contentType: form.contentType,
      title: form.title,
      body: form.body
    }
    const result = props.topic?.id ? await updateTopic(props.topic.id, payload) : await createTopic(payload)
    emit('saved', result)
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally { saving.value = false }
}
</script>

<style scoped>
.composer { display: grid; gap: 9px; }
.composer label { margin-top: 8px; font-weight: 650; color: var(--portal-text); }
.tip { margin: 3px 0; color: var(--portal-text-soft); font-size: 12px; }
.linked-project { border: 1px solid var(--portal-line); padding: 10px 12px; color: var(--portal-text); background: var(--portal-bg-soft); font-size: 13px; }
.reflection-guide { display: grid; gap: 5px; margin: 3px 0; border-left: 3px solid var(--portal-accent); padding: 12px 14px; background: var(--portal-bg-soft); }
.reflection-guide strong { color: var(--portal-text); font-size: 13px; }
.reflection-guide span { color: var(--portal-text-soft); font-size: 12px; line-height: 1.7; }
</style>
