<template>
  <main class="admin-shell">
    <section class="admin-card">
      <span class="eyebrow">PORTAL ADMIN</span>
      <h1>管理后台登录</h1>
      <p>输入管理员密码，处理社区举报与门户内容。</p>
      <form @submit.prevent="submit">
        <label for="admin-password">管理密码</label>
        <el-input id="admin-password" v-model="password" type="password" show-password autocomplete="current-password" placeholder="请输入管理密码" />
        <el-button native-type="submit" type="primary" :loading="loading" :disabled="!password">登录</el-button>
      </form>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminSignIn } from '@/api/community'

const route = useRoute()
const router = useRouter()
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await adminSignIn(password.value)
    password.value = ''
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//')
      ? route.query.next : '/admin/community/reports'
    router.replace(next)
  } catch (requestError) {
    error.value = requestError.response?.data?.message || '登录失败，请检查管理密码。'
  } finally { loading.value = false }
}
</script>

<style scoped>
.admin-shell { max-width: 560px; margin: 36px auto; }
.admin-card { padding: clamp(24px, 5vw, 46px); border: 1px solid var(--portal-line); border-radius: 24px; background: var(--portal-surface); box-shadow: var(--portal-shadow); }
.eyebrow { color: var(--portal-accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; }
h1 { margin: 12px 0; font-size: 34px; }
p { color: var(--portal-text-soft); line-height: 1.7; }
form { display: grid; gap: 13px; margin-top: 28px; }
label { font-weight: 700; }
form .el-button { justify-self: start; margin-top: 8px; }
.error { color: #ffb2aa; }
</style>
