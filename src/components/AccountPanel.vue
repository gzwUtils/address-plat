<template>
  <el-dialog v-model="dialogVisible" title="我的账户" width="min(520px, 94vw)" @closed="account.dismissRecovery()">
    <div class="account-panel">
      <el-alert v-if="account.error" :title="account.error" type="error" show-icon :closable="false" />
      <el-alert v-if="account.needsRestore" title="当前浏览器的账户已失效，请输入账户 ID 和恢复码找回。" type="warning" show-icon :closable="false" />

      <template v-if="account.profile && !account.needsRestore">
        <div class="account-identity">
          <span>账户 ID</span>
          <strong>{{ account.profile.publicId }}</strong>
          <el-button text @click="copyText(account.profile.publicId)">复制 ID</el-button>
        </div>
        <div class="account-identity">
          <span>昵称</span>
          <strong>{{ account.profile.nickname }}</strong>
        </div>
        <div class="form-row">
          <el-input v-model="nickname" maxlength="20" placeholder="修改昵称" aria-label="新昵称" />
          <el-button :loading="saving" @click="saveNickname">保存</el-button>
        </div>
        <router-link class="mine-link" to="/community/mine" @click="dialogVisible = false">查看我的讨论 ↗</router-link>
      </template>

      <div v-if="account.freshRecoveryCode" class="recovery-card">
        <strong>请保存这张身份卡</strong>
        <p>换浏览器时用账户 ID 和恢复码找回原账户。恢复码只显示这一次，请勿发给他人。</p>
        <code>{{ account.freshRecoveryCode }}</code>
        <div class="card-actions">
          <el-button @click="copyIdentityCard">复制身份卡</el-button>
          <el-button @click="downloadIdentityCard">下载身份卡</el-button>
        </div>
      </div>

      <div v-if="account.profile && !account.needsRestore" class="secondary-actions">
        <el-button text :loading="saving" @click="rotateCode">重新生成恢复码</el-button>
        <el-button text @click="restoreOpen = !restoreOpen">使用已有账户</el-button>
      </div>

      <form v-if="restoreOpen || account.needsRestore" class="restore-form" @submit.prevent="submitRestore">
        <h3>找回已有账户</h3>
        <el-input v-model="restoreId" placeholder="账户 ID，例如 P-1234567890" aria-label="要找回的账户 ID" autocomplete="username" />
        <el-input v-model="restoreCode" type="password" show-password placeholder="恢复码" aria-label="恢复码" autocomplete="off" />
        <el-button type="primary" native-type="submit" :loading="saving">找回账户</el-button>
        <el-button v-if="account.needsRestore" text :loading="saving" @click="createNew">创建新账户</el-button>
      </form>

      <p class="account-note">账户 ID 可公开，恢复码相当于账户密钥。若所有浏览器和恢复码都丢失，无法仅凭 ID 找回。</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGuestAccount } from '@/store/guestAccount'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
const account = useGuestAccount()
const dialogVisible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const nickname = ref('')
const restoreId = ref('')
const restoreCode = ref('')
const restoreOpen = ref(false)
const saving = ref(false)

watch(() => account.profile?.nickname, (value) => { nickname.value = value || '' }, { immediate: true })
watch(() => account.profile?.publicId, (value) => { if (value) restoreId.value = value }, { immediate: true })

const identityCard = () => `KD 门户账户\n账户 ID：${account.profile?.publicId || ''}\n恢复码：${account.freshRecoveryCode || ''}\n请保密保存此身份卡。\n`

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败，请手动选择文字')
  }
}

function copyIdentityCard() { copyText(identityCard()) }

function downloadIdentityCard() {
  const blob = new Blob([identityCard()], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `KD-账户-${account.profile?.publicId || '身份卡'}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

async function saveNickname() {
  saving.value = true
  try {
    await account.rename(nickname.value)
    ElMessage.success('昵称已更新')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改昵称失败')
  } finally { saving.value = false }
}

async function rotateCode() {
  try {
    await ElMessageBox.confirm('新恢复码会立即替换旧码。请保存新码。', '重新生成恢复码')
  } catch { return }
  saving.value = true
  try {
    await account.rotateRecovery()
    ElMessage.success('新恢复码已生成')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '生成失败')
  } finally { saving.value = false }
}

async function submitRestore() {
  if (!restoreId.value.trim() || !restoreCode.value.trim()) {
    ElMessage.warning('请输入账户 ID 和恢复码')
    return
  }
  if (account.profile && !account.needsRestore && account.profile.publicId !== restoreId.value.trim()) {
    try {
      await ElMessageBox.confirm('当前账户的项目和讨论不会合并到要找回的账户。确定切换？', '切换账户')
    } catch { return }
  }
  saving.value = true
  try {
    await account.restore(restoreId.value, restoreCode.value)
    restoreCode.value = ''
    restoreOpen.value = false
    ElMessage.success('已找回原账户')
    window.location.reload()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '账户 ID 或恢复码不正确')
  } finally { saving.value = false }
}

async function createNew() {
  try {
    await ElMessageBox.confirm('创建新账户后，原账户的内容不会自动转移。', '创建新账户')
  } catch { return }
  saving.value = true
  try { await account.createNew() } finally { saving.value = false }
}
</script>

<style scoped>
.account-panel { display: grid; gap: 16px; color: var(--portal-text); }
.account-identity { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.account-identity span { min-width: 65px; color: var(--portal-text-soft); }
.account-identity strong { font-size: 16px; }
.form-row { display: flex; gap: 8px; }
.mine-link { color: var(--portal-accent); }
.recovery-card { display: grid; gap: 10px; padding: 16px; border: 1px solid var(--portal-accent); border-radius: 12px; background: var(--portal-bg-soft); }
.recovery-card p, .account-note { margin: 0; color: var(--portal-text-soft); font-size: 13px; line-height: 1.6; }
.recovery-card code { overflow-wrap: anywhere; font-size: 14px; color: var(--portal-text); }
.card-actions, .secondary-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.restore-form { display: grid; gap: 10px; padding-top: 12px; border-top: 1px solid var(--portal-line); }
.restore-form h3 { margin: 0 0 4px; }
@media (max-width: 560px) { .form-row { flex-direction: column; } }
</style>
