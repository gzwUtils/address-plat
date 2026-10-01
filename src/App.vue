<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --portal-bg: #081625;
  --portal-bg-soft: #112236;
  --portal-surface: #102238;
  --portal-surface-strong: #152a42;
  --portal-line: rgba(171, 199, 220, 0.25);
  --portal-text: #ecf5ff;
  --portal-text-soft: #b0c2d7;
  --portal-accent: #72d9f5;
  --portal-accent-2: #7cffb7;
  --portal-warm: #ffc46b;
  --portal-shadow: 0 16px 42px rgba(0, 0, 0, 0.16);
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
    radial-gradient(circle at top left, rgba(89, 208, 255, 0.08), transparent 28%),
    linear-gradient(180deg, #081625 0%, #0b1b2c 100%);
  color: var(--portal-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid var(--portal-accent);
  outline-offset: 3px;
}
</style>
