<template>
  <div class="project-card" @click="handleCardClick">
    <div class="card-glow" />
    <div class="card-image">
      <img
        :src="computedBackgroundImage"
        alt="项目封面"
        class="project-logo"
        @error="handleImageError"
      />
    </div>

    <div class="card-content">
      <div class="card-badge">{{ project.category || project.type || '门户资源' }}</div>
      <h3 class="card-title">{{ project.projectName || '未命名项目' }}</h3>
      <p class="card-desc">{{ project.description || '点击卡片进入项目' }}</p>
      <div class="card-meta">
        <span>{{ project.shortName || 'Portal' }}</span>
        <span>{{ project.type || '项目' }}</span>
      </div>
    </div>

    <div v-if="isEditor" class="card-actions-overlay">
      <el-button circle size="small" @click.stop="emit('edit', project)" title="编辑">
        <el-icon><EditPen /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['edit'])

const router = useRouter()
const userStore = useUserStore()
const isEditor = userStore.isEditor

const computedBackgroundImage = computed(() => {
  if (props.project.backgroundImage) {
    return props.project.backgroundImage
  }

  const shortName = (props.project.shortName || props.project.projectName || 'Portal').substring(0, 8)
  return `https://placehold.co/600x300/0F3A5E/EAF6FF?text=${encodeURIComponent(shortName)}`
})

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/600x300/0F3A5E/EAF6FF?text=Portal'
}

const handleCardClick = () => {
  if (!props.project.id) {
    return
  }
  router.push(`/project/${props.project.id}`)
}
</script>

<style scoped>
.project-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 22px;
  border: 1px solid var(--portal-line);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    rgba(7, 20, 37, 0.9);
  cursor: pointer;
  transition: transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: rgba(89, 208, 255, 0.4);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
}

.card-glow {
  position: absolute;
  inset: -40% auto auto 55%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(89, 208, 255, 0.24), transparent 65%);
  pointer-events: none;
}

.card-image {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 138px;
  padding: 20px;
}

.project-logo {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 16px;
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 20px;
}

.card-badge,
.card-meta span {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.card-badge {
  color: var(--portal-accent);
  background: rgba(89, 208, 255, 0.12);
}

.card-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
}

.card-desc {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.7;
  flex: 1;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-meta span {
  color: #d9e8ff;
  background: rgba(255, 255, 255, 0.06);
}

.card-actions-overlay {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-card:hover .card-actions-overlay {
  opacity: 1;
}
</style>
