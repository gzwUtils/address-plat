<template>
  <article class="topic-row">
    <div class="topic-main">
      <router-link :to="`/community/topics/${topic.id}`" class="topic-title">{{ topic.title }}</router-link>
      <p v-if="topic.body" class="topic-excerpt">{{ topic.body }}</p>
      <div class="topic-meta">
        <router-link v-if="topic.boardCode" class="board-label" :to="`/community/boards/${topic.boardCode}`">{{ topic.boardName || '社区' }}</router-link>
        <span v-else class="board-label">{{ topic.boardName || '社区' }}</span>
        <span>{{ topic.authorNickname || '匿名用户' }}</span>
        <time v-if="topic.createTime" :datetime="topic.createTime">{{ formatDate(topic.createTime) }}</time>
        <span v-if="topic.projectName" class="project-label">项目 · {{ topic.projectName }}</span>
      </div>
    </div>
    <div class="reply-count" :aria-label="`${topic.replyCount || 0} 条回复`"><strong>{{ topic.replyCount || 0 }}</strong><span>回复</span></div>
  </article>
</template>

<script setup>
defineProps({ topic: { type: Object, required: true } })
const formatDate = (value) => value ? new Date(value).toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' }) : ''
</script>

<style scoped>
.topic-row { display: flex; justify-content: space-between; align-items: center; gap: 22px; min-width: 0; padding: 19px 22px; border-bottom: 1px solid var(--portal-line); background: var(--portal-surface); }
.topic-row:last-child { border-bottom: 0; }
.topic-row:hover { background: var(--portal-surface-strong); }
.topic-main { min-width: 0; }
.topic-title { color: var(--portal-text); font-size: 16px; font-weight: 650; line-height: 1.5; }
.topic-title:hover { color: var(--portal-accent); }
.topic-excerpt { overflow: hidden; max-width: 68ch; margin: 6px 0 9px; color: var(--portal-text-soft); font-size: 13px; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.topic-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 10px; margin-top: 9px; color: var(--portal-text-soft); font-size: 12px; }
.board-label { border-radius: 3px; padding: 2px 6px; color: var(--portal-accent); background: var(--portal-bg-soft); }
.board-label:hover { text-decoration: underline; }
.project-label { overflow: hidden; max-width: 22ch; text-overflow: ellipsis; white-space: nowrap; }
.reply-count { display: grid; flex: 0 0 48px; justify-items: center; gap: 2px; color: var(--portal-text-soft); font-size: 11px; }
.reply-count strong { color: var(--portal-text); font-size: 16px; font-weight: 650; }
@media (max-width: 600px) { .topic-row { gap: 12px; padding: 16px 14px; } .topic-title { font-size: 15px; } .topic-excerpt { max-width: 40ch; } .reply-count { flex-basis: 35px; } }
</style>
