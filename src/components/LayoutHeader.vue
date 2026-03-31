<template>
  <header class="layout-header">
    <div class="header-brand" @click="router.push('/')">
      <div class="brand-mark">
        <el-icon :size="22"><Platform /></el-icon>
      </div>
      <div>
        <div class="brand-title">KD Portal Nexus</div>
        <div class="brand-subtitle">项目、知识、AI 能力统一入口</div>
      </div>
    </div>

    <nav class="header-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        type="button"
        class="nav-item"
        :class="{ active: route.path === item.path }"
        @click="router.push(item.path)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="header-actions">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目、文章、AI 资产"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-popover placement="bottom" :width="280" trigger="hover">
        <template #reference>
          <div class="header-status user-status">
            <el-icon><User /></el-icon>
            <span>{{ userDisplay.shortId }}</span>
          </div>
        </template>
        <div class="user-info-popover">
          <div class="user-info-row">
            <span class="label">用户标识:</span>
            <span class="value">{{ userDisplay.name }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">用户ID:</span>
            <span class="value">{{ userDisplay.id }}</span>
          </div>
          <div class="user-tip">
            <el-icon><InfoFilled /></el-icon>
            您只能修改和删除自己上传的项目
          </div>
        </div>
      </el-popover>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Platform, Search, User, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getUserDisplayInfo } from '@/utils/userIdentity'

const router = useRouter()
const route = useRoute()

const userDisplay = getUserDisplayInfo()

const navItems = [
  { label: '总览', path: '/' },
  { label: '资源广场', path: '/explore' },
  { label: '我的落地舱', path: '/growth-capsule' },
  { label: '运营工作台', path: '/ops-workbench' },
  { label: '项目管理', path: '/project-studio' },
  { label: 'AI 资产中心', path: '/ai-workspace' },
  { label: '资源管理', path: '/content-studio' }
]

const routeKeyword = computed(() => {
  const keyword = route.query.keyword
  return typeof keyword === 'string' ? keyword : ''
})

const searchKeyword = ref(routeKeyword.value)

watch(routeKeyword, (value) => {
  searchKeyword.value = value
})

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  router.push({
    path: '/explore',
    query: { keyword }
  })
}
</script>

<style scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 18px 28px;
  border-bottom: 1px solid var(--portal-line);
  backdrop-filter: blur(18px);
  background: rgba(4, 12, 22, 0.72);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #06111e;
  background: linear-gradient(135deg, var(--portal-accent), var(--portal-accent-2));
  box-shadow: 0 10px 30px rgba(89, 208, 255, 0.28);
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand-subtitle {
  font-size: 12px;
  color: var(--portal-text-soft);
}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.nav-item {
  border: 1px solid transparent;
  background: transparent;
  color: var(--portal-text-soft);
  font: inherit;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.nav-item:hover,
.nav-item.active {
  color: var(--portal-text);
  border-color: rgba(89, 208, 255, 0.2);
  background: rgba(89, 208, 255, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-input {
  width: 320px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  color: var(--portal-text);
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  color: var(--portal-text-soft);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--portal-line);
  font-size: 12px;
  white-space: nowrap;
}

.user-status {
  cursor: pointer;
  transition: all 0.25s ease;
}

.user-status:hover {
  color: var(--portal-accent);
  border-color: rgba(89, 208, 255, 0.3);
  background: rgba(89, 208, 255, 0.08);
}

.user-info-popover {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.user-info-row .label {
  color: var(--portal-text-soft);
}

.user-info-row .value {
  color: var(--portal-text);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 11px;
}

.user-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(89, 208, 255, 0.08);
  color: var(--portal-accent);
  font-size: 12px;
  line-height: 1.6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--portal-accent-2);
  box-shadow: 0 0 16px rgba(124, 255, 183, 0.8);
}

@media (max-width: 1080px) {
  .layout-header {
    grid-template-columns: 1fr;
  }

  .header-nav {
    justify-content: flex-start;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .layout-header {
    padding: 16px;
  }

  .brand-subtitle,
  .header-status {
    display: none;
  }
}
</style>
