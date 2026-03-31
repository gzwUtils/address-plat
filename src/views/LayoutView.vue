<template>
  <div class="layout-container">
    <LayoutHeader />
    <!-- 紧急推送已隐藏 -->
    <main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
// import EmergencyPushCenter from '@/components/EmergencyPushCenter.vue'
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-main {
  padding: 28px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 640px) {
  .layout-main {
    padding: 16px;
  }
}
</style>
