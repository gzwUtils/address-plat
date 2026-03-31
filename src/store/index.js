import { createPinia, defineStore } from 'pinia'
import { getPortalUserProfile } from '@/utils/userIdentity'

export const useUserStore = defineStore('user', {
  state: () => ({
    role: '运维',
    ...getPortalUserProfile()
  }),
  getters: {
    isEditor: (state) => state.role === '运维'
  }
})

export default createPinia()
