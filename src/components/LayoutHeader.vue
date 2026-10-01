<template>
  <header class="site-header">
    <div class="header-inner">
      <router-link class="brand" to="/" aria-label="KD 门户首页">
        <span class="brand-mark">KD</span>
        <span class="brand-copy"><strong>团队门户</strong><small>PROJECTS · KNOWLEDGE · AI</small></span>
      </router-link>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="mobileOpen"
        aria-controls="portal-navigation"
        @click="mobileOpen = !mobileOpen"
      >
        {{ mobileOpen ? '收起菜单' : '打开菜单' }}
        <span aria-hidden="true">{{ mobileOpen ? '×' : '☰' }}</span>
      </button>

      <nav id="portal-navigation" class="navigation" :class="{ open: mobileOpen }" aria-label="主导航">
        <router-link to="/" :class="{ active: route.path === '/' }" :aria-current="route.path === '/' ? 'page' : undefined">首页</router-link>
        <router-link to="/explore" :class="{ active: isExploreActive }" :aria-current="isExploreActive ? 'page' : undefined">资源广场</router-link>
        <router-link to="/growth-capsule" :class="{ active: route.path === '/growth-capsule' }" :aria-current="route.path === '/growth-capsule' ? 'page' : undefined">我的落地舱</router-link>
        <details ref="managementMenu" class="management-menu">
          <summary :class="{ active: isManagementActive }">管理 <span aria-hidden="true">⌄</span></summary>
          <div class="management-links">
            <router-link to="/ops-workbench">运营工作台</router-link>
            <router-link to="/project-studio">项目管理</router-link>
            <router-link to="/ai-workspace">AI 资产中心</router-link>
            <router-link to="/content-studio">资源管理</router-link>
          </div>
        </details>
      </nav>

      <form class="header-search" role="search" @submit.prevent="handleSearch">
        <label class="sr-only" for="header-search-input">搜索门户资源</label>
        <input id="header-search-input" v-model="searchKeyword" type="search" placeholder="搜索项目、文章、AI…" />
        <button type="submit" aria-label="搜索"><span aria-hidden="true">⌕</span></button>
      </form>

      <button type="button" class="user-chip" :title="account.profile?.publicId || '我的账户'" @click="accountOpen = true">
        {{ account.profile?.nickname || (account.needsRestore ? '找回账户' : '我的账户') }}
      </button>
    </div>
    <AccountPanel v-model="accountOpen" />
  </header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountPanel from '@/components/AccountPanel.vue'
import { useGuestAccount } from '@/store/guestAccount'

const route = useRoute()
const router = useRouter()
const account = useGuestAccount()
const accountOpen = ref(false)
const mobileOpen = ref(false)
const managementMenu = ref(null)
const searchKeyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')
const isExploreActive = computed(() => route.path.startsWith('/explore') || route.path.startsWith('/project/'))
const isManagementActive = computed(() => ['/ops-workbench', '/project-studio', '/ai-workspace', '/content-studio'].includes(route.path))

onMounted(() => account.initialize())
watch(() => account.freshRecoveryCode, (value) => { if (value) accountOpen.value = true })
watch(() => account.needsRestore, (value) => { if (value) accountOpen.value = true })

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  if (managementMenu.value) managementMenu.value.open = false
  searchKeyword.value = typeof route.query.keyword === 'string' ? route.query.keyword : ''
})

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  router.push({ path: '/explore', query: keyword ? { keyword } : {} })
}
</script>

<style scoped>
.site-header { position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid var(--portal-line); background: rgba(5, 17, 31, .94); backdrop-filter: blur(18px); }
.header-inner { max-width: 1600px; margin: 0 auto; padding: 13px 28px; display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(180px, 260px) auto; align-items: center; gap: 25px; }
.brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.brand-mark { display: grid; place-items: center; flex: 0 0 42px; height: 42px; border-radius: 12px; background: var(--portal-accent); color: #071724; font-size: 14px; font-weight: 900; letter-spacing: -.04em; }
.brand-copy { display: grid; gap: 2px; white-space: nowrap; }
.brand-copy strong { font-size: 17px; }
.brand-copy small { color: var(--portal-text-soft); font-size: 9px; letter-spacing: .12em; }
.navigation { display: flex; justify-content: center; align-items: center; gap: 4px; }
.navigation > a, .management-menu summary { display: block; border-radius: 9px; padding: 11px 12px; color: var(--portal-text-soft); font-size: 14px; white-space: nowrap; cursor: pointer; }
.navigation > a:hover, .navigation > a.active, .management-menu summary:hover, .management-menu summary.active { color: var(--portal-text); background: rgba(89, 208, 255, .12); }
.management-menu { position: relative; }
.management-menu summary { list-style: none; }
.management-menu summary::-webkit-details-marker { display: none; }
.management-menu summary span { margin-left: 3px; }
.management-links { position: absolute; top: calc(100% + 10px); left: 0; min-width: 180px; display: grid; padding: 8px; border: 1px solid var(--portal-line); border-radius: 14px; background: var(--portal-surface-strong); box-shadow: var(--portal-shadow); }
.management-links a { border-radius: 8px; padding: 11px 12px; color: var(--portal-text-soft); white-space: nowrap; font-size: 14px; }
.management-links a:hover, .management-links a.router-link-active { color: var(--portal-text); background: rgba(89, 208, 255, .12); }
.header-search { display: flex; min-width: 0; border: 1px solid var(--portal-line); border-radius: 10px; background: rgba(255, 255, 255, .045); }
.header-search input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 10px 11px; background: transparent; color: var(--portal-text); font: inherit; font-size: 13px; }
.header-search input::placeholder { color: var(--portal-text-soft); }
.header-search:focus-within { border-color: var(--portal-accent); box-shadow: 0 0 0 2px rgba(114, 217, 245, .18); }
.header-search button { border: 0; padding: 0 12px; color: var(--portal-accent); background: transparent; font-size: 22px; cursor: pointer; }
.user-chip { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 10px; border: 1px solid var(--portal-line); border-radius: 10px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 12px; cursor: pointer; }
.menu-toggle { display: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 1180px) {
  .header-inner { grid-template-columns: 1fr auto auto; gap: 12px; }
  .menu-toggle { display: flex; grid-column: 3; grid-row: 1; align-items: center; gap: 9px; border: 1px solid var(--portal-line); border-radius: 10px; padding: 10px 12px; color: var(--portal-text); background: var(--portal-surface); font: inherit; font-size: 13px; cursor: pointer; }
  .menu-toggle span { font-size: 17px; line-height: 1; }
  .header-search { grid-column: 1 / -1; grid-row: 2; }
  .navigation { display: none; grid-column: 1 / -1; grid-row: 3; align-items: stretch; flex-direction: column; padding: 7px 0; }
  .navigation.open { display: flex; }
  .navigation > a, .management-menu summary { padding: 12px; }
  .management-links { position: static; margin: 4px 0 0 10px; box-shadow: none; }
  .user-chip { grid-column: 2; grid-row: 1; max-width: 120px; }
}
@media (max-width: 640px) { .header-inner { padding: 11px 16px; } .brand-copy small { display: none; } }
</style>
