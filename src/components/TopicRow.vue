<template>
  <article class="topic-row">
    <div class="topic-main">
      <div class="topic-labels">
        <span>{{ topic.boardName || '社区' }}</span>
        <span v-if="topic.projectName">关联项目 · {{ topic.projectName }}</span>
      </div>
      <router-link :to="`/community/topics/${topic.id}`" class="topic-title">{{ topic.title }}</router-link>
      <p>{{ topic.body }}</p>
      <div class="topic-meta">
        <span>{{ topic.authorNickname || '匿名用户' }}</span>
        <span>{{ formatDate(topic.createTime) }}</span>
        <span>{{ topic.replyCount || 0 }} 条回复</span>
      </div>
    </div>
    <router-link :to="`/community/topics/${topic.id}`" class="topic-arrow" :aria-label="`查看${topic.title}`">↗</router-link>
  </article>
</template>

<script setup>
defineProps({ topic: { type: Object, required: true } })
const formatDate = (value) => value ? new Date(value).toLocaleString('zh-CN') : ''
</script>

<style scoped>
.topic-row { display: flex; justify-content: space-between; gap: 20px; padding: 21px 23px; border: 1px solid var(--portal-line); border-radius: 16px; background: var(--portal-surface); }
.topic-main { min-width: 0; }
.topic-labels, .topic-meta { display: flex; flex-wrap: wrap; gap: 11px; color: var(--portal-text-soft); font-size: 12px; }
.topic-labels span:first-child { color: var(--portal-accent); }
.topic-title { display: inline-block; margin-top: 9px; color: var(--portal-text); font-size: 18px; font-weight: 750; }
.topic-title:hover { color: var(--portal-accent); }
.topic-main p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin: 8px 0 12px; color: var(--portal-text-soft); font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
.topic-arrow { align-self: center; color: var(--portal-accent); font-size: 20px; }
</style>
