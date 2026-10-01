import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createAccount, getMe, restoreAccount, rotateRecoveryCode, updateNickname } from '@/api/identity'

const PUBLIC_ID_KEY = 'portal_public_account_id'

export const useGuestAccount = defineStore('guestAccount', () => {
  const profile = ref(null)
  const ready = ref(false)
  const loading = ref(false)
  const needsRestore = ref(false)
  const error = ref('')
  const freshRecoveryCode = ref('')

  const remember = (account) => {
    profile.value = { publicId: account.publicId, nickname: account.nickname }
    localStorage.setItem(PUBLIC_ID_KEY, account.publicId)
    needsRestore.value = false
    error.value = ''
  }

  async function initialize() {
    if (ready.value || loading.value) return
    loading.value = true
    try {
      try {
        remember(await getMe())
      } catch (requestError) {
        if (requestError.response?.status !== 401) throw requestError
        const knownId = localStorage.getItem(PUBLIC_ID_KEY)
        if (knownId) {
          profile.value = { publicId: knownId, nickname: '' }
          needsRestore.value = true
        } else {
          const created = await createAccount()
          remember(created)
          freshRecoveryCode.value = created.recoveryCode
        }
      }
    } catch {
      error.value = '账户服务暂时不可用'
    } finally {
      ready.value = true
      loading.value = false
    }
  }

  async function restore(publicId, recoveryCode) {
    loading.value = true
    try {
      remember(await restoreAccount(publicId.trim(), recoveryCode.trim()))
      freshRecoveryCode.value = ''
    } finally {
      loading.value = false
    }
  }

  async function createNew() {
    loading.value = true
    try {
      const created = await createAccount()
      remember(created)
      freshRecoveryCode.value = created.recoveryCode
    } finally {
      loading.value = false
    }
  }

  async function rename(nickname) {
    remember(await updateNickname(nickname))
  }

  async function rotateRecovery() {
    const result = await rotateRecoveryCode()
    freshRecoveryCode.value = result.recoveryCode
  }

  function dismissRecovery() { freshRecoveryCode.value = '' }

  return { profile, ready, loading, needsRestore, error, freshRecoveryCode,
    initialize, restore, createNew, rename, rotateRecovery, dismissRecovery }
})
