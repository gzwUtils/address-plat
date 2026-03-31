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
        <span v-if="project.ownerName" class="owner-tag">
          上传者: {{ project.ownerName }}
        </span>
      </div>
    </div>

    <div v-if="canEdit" class="card-actions-overlay">
      <el-button circle size="small" @click.stop="handleDelete" title="删除">
        <el-icon><Delete /></el-icon>
      </el-button>
      <el-button circle size="small" @click.stop="emit('edit', project)" title="编辑">
        <el-icon><EditPen /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { EditPen, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { deleteProject } from '@/api/project'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({})
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'deleted'])

const router = useRouter()

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

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteProject(props.project.id)
    ElMessage.success('删除成功')
    emit('deleted')
  } catch {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
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

.card-meta .owner-tag {
  color: var(--portal-accent);
  background: rgba(89, 208, 255, 0.15);
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
