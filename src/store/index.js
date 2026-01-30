import { createPinia, defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    role: '运维' // 可从登录接口获取，此处简化
  }),
  getters: {
    isEditor: (state) => state.role === '运维'
  }
})

export default createPinia()
