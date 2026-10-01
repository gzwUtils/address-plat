<template>
  <router-link class="discovery-card" :to="destination">
    <div class="card-top">
      <span class="kind-label">{{ kindLabel }}</span>
      <span v-if="secondaryLabel" class="secondary-label">{{ secondaryLabel }}</span>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <div class="card-bottom">
      <span class="card-meta">{{ meta }}</span>
      <span class="card-action">{{ actionLabel }} <span aria-hidden="true">↗</span></span>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  kind: { type: String, required: true },
  item: { type: Object, required: true }
})

const labels = { project: '项目', topic: '社区讨论', article: '文章', ai: 'AI 资产', life: '生活内容' }
const actions = { project: '查看项目', topic: '参与讨论', article: '阅读文章', ai: '查看资产', life: '查看内容' }

const kindLabel = computed(() => labels[props.kind] || '资源')
const actionLabel = computed(() => actions[props.kind] || '查看详情')
const title = computed(() => props.item.projectName || props.item.title || props.item.name || '未命名资源')
const description = computed(() => props.item.description || props.item.excerpt || props.item.body || props.item.desc || '暂无简介')
const secondaryLabel = computed(() => props.item.boardName || props.item.category || props.item.type || '')
const meta = computed(() => {
  if (props.kind === 'project') return props.item.shortName || props.item.ownerName || '项目入口'
  if (props.kind === 'topic') return `${props.item.authorNickname || '社区成员'} · ${props.item.replyCount || 0} 条回复`
  if (props.kind === 'ai') return [props.item.owner, props.item.status].filter(Boolean).join(' · ') || 'AI 能力'
  return props.item.date || props.item.author || props.item.meta || kindLabel.value
})
const destination = computed(() => props.kind === 'project'
  ? `/project/${props.item.id}`
  : props.kind === 'topic' ? `/community/topics/${props.item.id}` : `/explore/${props.kind}/${props.item.id}`)
</script>

<style scoped>
.discovery-card {
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-width: 0;
  min-height: 215px;
  padding: 22px 22px 20px;
  border: 1px solid var(--portal-line);
  border-top: 2px solid var(--portal-accent-2);
  background: var(--portal-surface);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.discovery-card:hover,
.discovery-card:focus-visible {
  border-color: var(--portal-accent);
  background: var(--portal-surface-strong);
}

.card-top,
.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kind-label {
  color: var(--portal-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.secondary-label,
.card-meta {
  color: var(--portal-text-soft);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h3 {
  margin: 0;
  color: var(--portal-text);
  font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif;
  font-size: 23px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

p {
  margin: 0;
  color: var(--portal-text-soft);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  flex: 1;
}

.card-bottom {
  padding-top: 13px;
  border-top: 1px solid var(--portal-line);
}

.card-action {
  flex-shrink: 0;
  color: var(--portal-accent);
  font-size: 13px;
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  .discovery-card { transition: none; }
  .discovery-card:hover,
  .discovery-card:focus-visible { transform: none; }
}
</style>
