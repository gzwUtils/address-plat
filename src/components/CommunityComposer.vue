<template>
  <el-dialog v-model="dialogVisible" :title="topic?.id ? '编辑主题' : '发布主题'" width="min(650px, 94vw)">
    <div class="composer">
      <label>板块</label>
      <el-select v-model="form.boardCode" placeholder="选择板块">
        <el-option v-for="board in boards" :key="board.code" :label="board.name" :value="board.code" />
      </el-select>
      <label>标题</label>
      <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="用一句话说明要讨论什么" />
      <label>关联项目（可选）</label>
      <el-select v-model="form.projectId" clearable filterable placeholder="选择一个项目">
        <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
      </el-select>
      <label>正文</label>
      <el-input v-model="form.body" type="textarea" :rows="9" maxlength="10000" show-word-limit placeholder="分享你的想法、问题或经验…" />
      <p class="tip">帖子将以纯文本显示，其他人可以在下方回复。</p>
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
  projectId: { type: [Number, String], default: null }, topic: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'saved'])
const dialogVisible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const boards = ref([])
const projects = ref([])
const saving = ref(false)
const form = reactive({ boardCode: '', projectId: null, title: '', body: '' })

watch(() => props.modelValue, async (open) => {
  if (!open) return
  form.boardCode = props.topic?.boardCode || props.boardCode
  form.projectId = props.topic?.projectId || (props.projectId ? Number(props.projectId) : null)
  form.title = props.topic?.title || ''
  form.body = props.topic?.body || ''
  try {
    const [boardList, projectList] = await Promise.all([listBoards(), getProjects()])
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
    const payload = { boardCode: form.boardCode, projectId: form.projectId, title: form.title, body: form.body }
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
</style>
