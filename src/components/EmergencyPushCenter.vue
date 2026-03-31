<template>
  <div class="emergency-center">
    <el-button
      v-if="isEditor"
      class="publish-button"
      type="danger"
      plain
      @click="openPublishDialog"
    >
      紧急推送
    </el-button>

    <el-dialog
      v-model="publishDialogVisible"
      title="发布紧急推送"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="标题">
          <el-input v-model="draftNotice.title" maxlength="40" show-word-limit placeholder="例如：发布窗口临时关闭" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="draftNotice.content"
            type="textarea"
            :rows="5"
            maxlength="300"
            show-word-limit
            placeholder="输入要通知所有人的紧急内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="publishNotice">立即推送</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="noticeDialogVisible"
      title="紧急通知"
      width="560px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div v-if="activeNotice" class="notice-body">
        <div class="notice-title">{{ activeNotice.title }}</div>
        <div class="notice-meta">
          <span>发布人：{{ activeNotice.publisherName || '系统' }}</span>
          <span>{{ formatTime(activeNotice.publishedAt) }}</span>
        </div>
        <p>{{ activeNotice.content }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmNotice">我已阅读并确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import {
  ackEmergencyNotice,
  getEmergencyNotice,
  hasEmergencyNoticeAck,
  saveEmergencyNotice
} from '@/utils/emergencyPush'

const userStore = useUserStore()
const isEditor = userStore.isEditor
const publishDialogVisible = ref(false)
const noticeDialogVisible = ref(false)
const activeNotice = ref(null)
const draftNotice = ref(createDraftNotice())

function createDraftNotice() {
  return {
    title: '',
    content: ''
  }
}

function formatTime(value) {
  if (!value) {
    return '刚刚'
  }
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function syncNoticeState() {
  const notice = getEmergencyNotice()
  activeNotice.value = notice
  noticeDialogVisible.value = Boolean(
    notice &&
    !hasEmergencyNoticeAck(notice.id, userStore.userId)
  )
}

function openPublishDialog() {
  draftNotice.value = createDraftNotice()
  publishDialogVisible.value = true
}

function publishNotice() {
  if (!draftNotice.value.title.trim() || !draftNotice.value.content.trim()) {
    ElMessage.warning('请先填写完整的推送标题和内容')
    return
  }

  const notice = {
    id: `notice-${Date.now()}`,
    title: draftNotice.value.title.trim(),
    content: draftNotice.value.content.trim(),
    publisherId: userStore.userId,
    publisherName: userStore.userName,
    publishedAt: new Date().toISOString()
  }

  saveEmergencyNotice(notice)
  activeNotice.value = notice
  noticeDialogVisible.value = true
  publishDialogVisible.value = false
  ElMessage.success('紧急推送已发布')
}

function confirmNotice() {
  if (!activeNotice.value?.id) {
    return
  }
  ackEmergencyNotice(activeNotice.value.id, userStore.userId)
  noticeDialogVisible.value = false
  ElMessage.success('已确认阅读')
}

function handleStorage(event) {
  if (event.key?.includes('portal_emergency_notice')) {
    syncNoticeState()
  }
}

onMounted(() => {
  syncNoticeState()
  window.addEventListener('storage', handleStorage)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorage)
})
</script>

<style scoped>
.publish-button {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 1200;
  box-shadow: 0 12px 28px rgba(243, 63, 94, 0.28);
}

.notice-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
}

.notice-body p {
  margin: 0;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .publish-button {
    right: 16px;
    bottom: 16px;
  }

  .notice-meta {
    flex-direction: column;
  }
}
</style>
