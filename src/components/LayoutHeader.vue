<template>
  <header class="site-header">
    <div class="header-inner">
      <router-link class="brand" to="/" aria-label="在场首页"><span class="brand-symbol">场</span><span class="brand-copy"><strong>在场</strong><small>话题与作品社区</small></span></router-link>
      <nav class="navigation" aria-label="主导航">
        <router-link to="/" :class="{ active: route.path === '/' }" :aria-current="route.path === '/' ? 'page' : undefined">发现</router-link>
        <router-link to="/community" :class="{ active: isCommunityActive }" :aria-current="isCommunityActive ? 'page' : undefined">讨论</router-link>
        <router-link :to="{ path: '/explore', query: { type: 'project' } }" :class="{ active: isProjectsActive }" :aria-current="isProjectsActive ? 'page' : undefined">项目</router-link>
        <router-link :to="{ path: '/explore', query: { type: 'article' } }" :class="{ active: isReadingActive }" :aria-current="isReadingActive ? 'page' : undefined">阅读</router-link>
        <details ref="moreMenu" class="more-menu"><summary :class="{ active: isMoreActive }">更多 <span aria-hidden="true">⌄</span></summary><div class="more-links"><router-link to="/explore">资源广场</router-link><router-link to="/growth-capsule">我的落地舱</router-link><div class="menu-divider" /><router-link to="/ops-workbench">运营工作台</router-link><router-link to="/project-studio">项目管理</router-link><router-link to="/ai-workspace">AI 资产中心</router-link><router-link to="/content-studio">资源管理</router-link><router-link to="/admin/community/reports">社区举报</router-link></div></details>
      </nav>
      <form class="header-search" role="search" @submit.prevent="handleSearch"><label class="sr-only" for="header-search-input">搜索话题、项目与文章</label><input id="header-search-input" v-model="searchKeyword" type="search" placeholder="搜索话题、项目与文章" /><button type="submit" aria-label="搜索">⌕</button></form>
      <div class="theme-switcher" role="group" aria-label="切换国色配色"><button v-for="option in portalThemes" :key="option.id" type="button" class="theme-swatch" :class="[option.id, { selected: theme === option.id }]" :aria-label="`切换为${option.name}配色`" :aria-pressed="theme === option.id" :title="option.name" @click="setTheme(option.id)" /></div>
      <router-link class="compose-link" to="/community?compose=1">＋ 发一条</router-link>
      <button type="button" class="user-chip" :title="account.profile?.nickname || (account.needsRestore ? '找回账户' : '我的账户')" :aria-label="account.profile?.nickname ? `账户：${account.profile.nickname}` : '我的账户'" @click="accountOpen = true">{{ account.profile?.nickname?.[0] || (account.needsRestore ? '回' : '我') }}</button>
    </div>
    <AccountPanel v-model="accountOpen" />
  </header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountPanel from '@/components/AccountPanel.vue'
import { useGuestAccount } from '@/store/guestAccount'
import { applyPortalTheme, portalThemes, readPortalTheme } from '@/utils/portalTheme'

const route = useRoute()
const router = useRouter()
const account = useGuestAccount()
const accountOpen = ref(false)
const moreMenu = ref(null)
const searchKeyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')
const theme = ref(readPortalTheme())
const setTheme = (value) => { theme.value = applyPortalTheme(value) }
const isCommunityActive = computed(() => route.path.startsWith('/community'))
const isProjectsActive = computed(() => route.path.startsWith('/project/') || (route.path.startsWith('/explore') && route.query.type === 'project'))
const isReadingActive = computed(() => route.path.startsWith('/explore/article') || (route.path === '/explore' && route.query.type === 'article'))
const isMoreActive = computed(() => ['/growth-capsule', '/ops-workbench', '/project-studio', '/ai-workspace', '/content-studio'].includes(route.path) || route.path.startsWith('/admin/') || (route.path.startsWith('/explore') && !isProjectsActive.value && !isReadingActive.value))

onMounted(() => account.initialize())
watch(() => account.freshRecoveryCode, (value) => { if (value) accountOpen.value = true })
watch(() => account.needsRestore, (value) => { if (value) accountOpen.value = true })
watch(() => route.fullPath, () => {
  if (moreMenu.value) moreMenu.value.open = false
  searchKeyword.value = typeof route.query.keyword === 'string' ? route.query.keyword : ''
})
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  router.push({ path: '/explore', query: keyword ? { keyword } : {} })
}
</script>

<style scoped>
.site-header { position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid var(--portal-line); background: #fff; }
.header-inner { display: flex; align-items: center; gap: 22px; max-width: 1380px; min-height: 75px; margin: 0 auto; padding: 0 42px; }
.brand { display: flex; align-items: center; gap: 11px; flex: 0 0 auto; }
.brand-symbol { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 4px 13px 4px 13px; background: var(--portal-accent); color: #fff; font-family: 'Songti SC', 'Noto Serif CJK SC', serif; font-size: 25px; font-weight: 900; }
.brand-copy { display: flex; flex-direction: column; gap: 1px; }
.brand-copy strong { color: var(--portal-text); font-size: 22px; font-weight: 850; letter-spacing: -.07em; line-height: 1; }
.brand-copy small { color: #879096; font-size: 10px; letter-spacing: .09em; white-space: nowrap; }
.navigation { display: flex; align-self: stretch; align-items: center; gap: 7px; margin-left: 35px; }
.navigation > a, .more-menu summary { display: grid; place-items: center; height: 100%; min-width: 65px; border-bottom: 3px solid transparent; color: #687279; font-size: 13px; font-weight: 650; white-space: nowrap; cursor: pointer; }
.navigation > a.active, .more-menu summary.active { border-color: var(--portal-accent); color: var(--portal-text); }
.navigation > a:hover, .more-menu summary:hover { color: var(--portal-accent); }
.more-menu { position: relative; height: 100%; }
.more-menu summary { display: flex; align-items: center; justify-content: center; gap: 4px; list-style: none; }
.more-menu summary::-webkit-details-marker { display: none; }
.more-links { position: absolute; top: calc(100% + 1px); left: 0; display: grid; min-width: 185px; padding: 8px; border: 1px solid var(--portal-line); border-radius: 8px; background: #fff; box-shadow: 0 14px 30px rgba(25, 35, 45, .12); }
.more-links a { border-radius: 5px; padding: 10px 12px; color: var(--portal-text-soft); font-size: 12px; white-space: nowrap; }
.more-links a:hover { background: var(--portal-bg-soft); color: var(--portal-accent); }
.menu-divider { height: 1px; margin: 6px 8px; background: var(--portal-line); }
.header-search { display: flex; align-items: center; width: 235px; min-width: 130px; margin-left: auto; border: 1px solid #dce0de; border-radius: 8px; background: #fff; }
.header-search:focus-within { border-color: var(--portal-accent); }
.header-search input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 11px 13px; background: none; color: var(--portal-text); font: inherit; font-size: 12px; }
.header-search input::placeholder { color: #91999e; }
.header-search button { border: 0; padding: 2px 12px; background: none; color: #63717d; font-size: 21px; line-height: 1; cursor: pointer; }
.theme-switcher { display: flex; align-items: center; gap: 6px; border-left: 1px solid var(--portal-line); padding-left: 15px; }
.theme-swatch { width: 16px; height: 16px; border: 2px solid #fff; border-radius: 50%; padding: 0; box-shadow: 0 0 0 1px #d0d4d2; cursor: pointer; }
.theme-swatch.red { background: #b5473d; }.theme-swatch.blue { background: #2b6583; }.theme-swatch.green { background: #3c7053; }
.theme-swatch.selected { box-shadow: 0 0 0 2px var(--portal-text); }
.compose-link { border-radius: 8px; padding: 12px 17px; background: var(--portal-accent); color: #fff; font-size: 12px; font-weight: 750; white-space: nowrap; }
.compose-link:hover { filter: brightness(.9); }
.user-chip { display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 auto; border: 1px solid #dbd5c9; border-radius: 50%; background: #efe9df; color: #566268; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 1200px) { .header-inner { gap: 16px; padding: 0 26px; } .navigation { margin-left: 8px; gap: 0; } .navigation > a, .more-menu summary { min-width: 55px; } .header-search { width: 195px; } }
@media (max-width: 900px) { .header-inner { flex-wrap: wrap; gap: 13px; padding: 11px 18px 0; } .brand-copy small, .header-search { display: none; } .navigation { order: 5; justify-content: space-around; width: 100%; height: 38px; margin: 0; } .navigation > a, .more-menu summary { height: 38px; } .more-menu { height: 38px; } .theme-switcher { margin-left: auto; padding-left: 10px; } .compose-link { padding: 10px 13px; } }
@media (max-width: 430px) { .brand-symbol { width: 34px; height: 34px; font-size: 21px; } .brand-copy strong { font-size: 19px; } .header-inner { gap: 9px; } .compose-link { padding: 9px 10px; font-size: 11px; } .theme-switcher { gap: 4px; padding-left: 7px; } .theme-swatch { width: 15px; height: 15px; } .user-chip { width: 31px; height: 31px; } .navigation > a, .more-menu summary { min-width: 51px; font-size: 12px; } .more-links { right: 0; left: auto; } }
</style>
