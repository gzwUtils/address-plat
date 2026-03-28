<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --portal-bg: #07111f;
  --portal-bg-soft: #0d1b30;
  --portal-surface: rgba(8, 22, 42, 0.78);
  --portal-surface-strong: rgba(10, 29, 55, 0.92);
  --portal-line: rgba(148, 163, 184, 0.18);
  --portal-text: #e2ecff;
  --portal-text-soft: #94a6c8;
  --portal-accent: #59d0ff;
  --portal-accent-2: #7cffb7;
  --portal-warm: #ffc46b;
  --portal-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100vh;
  margin: 0;
}

body {
  background:
    radial-gradient(circle at top left, rgba(89, 208, 255, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(124, 255, 183, 0.12), transparent 24%),
    linear-gradient(180deg, #06101d 0%, #0a1526 48%, #0d1830 100%);
  color: var(--portal-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}
</style>
