<template>
  <div class="safe-text"><template v-for="(part, index) in parts" :key="index"><a v-if="part.url" :href="part.url" target="_blank" rel="noopener noreferrer">{{ part.text }}</a><span v-else>{{ part.text }}</span></template></div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ text: { type: String, default: '' } })
const parts = computed(() => {
  const result = []
  const pattern = /https?:\/\/[^\s<>"']+/g
  let cursor = 0
  for (const match of props.text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > cursor) result.push({ text: props.text.slice(cursor, index) })
    let url = null
    try {
      const parsed = new URL(match[0])
      if (['http:', 'https:'].includes(parsed.protocol)) url = parsed.href
    } catch { /* malformed URL stays text */ }
    result.push({ text: match[0], url })
    cursor = index + match[0].length
  }
  if (cursor < props.text.length) result.push({ text: props.text.slice(cursor) })
  return result
})
</script>

<style scoped>
.safe-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.75; }
.safe-text a { color: var(--portal-accent); text-decoration: underline; }
</style>
