<!-- src/components/ProjectCard.vue -->
<template>
  <div class="project-card" @click="handleCardClick">
    <!-- 图片区域 -->
    <div class="card-image">
      <img
        :src="computedBackgroundImage"
        @error="handleImageError"
        alt="项目封面"
        class="project-logo"
      />
    </div>

    <!-- 内容区 -->
    <div class="card-content">
      <h3 class="card-title">
        {{ project.projectName || '未命名项目' }}
      </h3>
      <p class="card-desc">
        {{ project.description || '点击卡片进入项目' }}
      </p>
    </div>

    <!-- 操作按钮（仅编辑者可见，hover 显示） -->
    <div v-if="isEditor" class="card-actions-overlay">
      <el-button
        circle
        size="small"
        @click.stop="emit('edit', project)"
        title="编辑"
      >
        <el-icon><EditPen /></el-icon>
      </el-button>
      <el-button
        circle
        size="small"
        type="danger"
        @click.stop="emit('delete', project.id)"
        title="删除"
        style="margin-left: 6px;"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import { EditPen, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['edit', 'delete'])

const userStore = useUserStore()
const isEditor = userStore.isEditor

// ✅ 计算最终的背景图 URL
const computedBackgroundImage = computed(() => {
  // 如果已有 backgroundImage 且非空，直接用
  if (props.project.backgroundImage) {
    return props.project.backgroundImage
  }

  // 否则用 shortName 生成占位图
  const shortName = (props.project.shortName || props.project.projectName || 'App').substring(0, 6)
  // 对中文做安全处理：如果包含中文，用拼音首字母或固定缩写（简化方案：统一用英文 App）
  const hasChinese = /[\u4e00-\u9fa5]/.test(shortName)
  const displayText = hasChinese ? shortName : encodeURIComponent(shortName)

  return `https://placehold.co/600x300/4F46E5/FFFFFF?text= ${displayText}`
})

const handleImageError = (e) => {
  // 如果图片加载失败，fallback 到默认占位图
  e.target.src = 'https://placehold.co/600x300/4F46E5/FFFFFF?text=App'
}

const handleCardClick = () => {
  const url = props.project.platformUrl
  if (!url) {
    ElMessage.warning('该项目未配置访问地址')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<script>
import { computed } from 'vue'
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f2f5;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #e5e7eb;
}

.card-image {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
}

.project-logo {
  max-width: 90%;
  max-height: 80px;
  object-fit: contain;
  transition: transform 0.2s;
}

.project-card:hover .project-logo {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  word-break: break-word;
}

.card-desc {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
  flex: 1;
  word-break: break-word;
}

/* 右上角操作按钮 */
.card-actions-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.project-card:hover .card-actions-overlay {
  opacity: 1;
}

/* 禁用文本选中 */
.project-card {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
</style>
