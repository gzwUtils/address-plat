<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --portal-bg: #ffffff;
  --portal-bg-soft: #f7f8f9;
  --portal-surface: #ffffff;
  --portal-surface-strong: #fafbfc;
  --portal-line: #e3e7e9;
  --portal-text: #1e2930;
  --portal-text-soft: #657179;
  --portal-accent: #a43d38;
  --portal-accent-ink: #ffffff;
  --portal-accent-2: #31596c;
  --portal-warm: #a43d38;
  --portal-glow: rgba(164, 61, 56, .05);
  --portal-hero-top: #ffffff;
  --portal-hero-bottom: #fafbfc;
  --portal-shadow: 0 3px 12px rgba(30, 41, 48, .035);
  --el-color-primary: var(--portal-accent);
  --el-color-primary-light-3: color-mix(in srgb, var(--portal-accent) 70%, white);
  --el-color-primary-light-5: color-mix(in srgb, var(--portal-accent) 50%, white);
  --el-color-primary-light-7: color-mix(in srgb, var(--portal-accent) 30%, white);
  --el-color-primary-light-8: color-mix(in srgb, var(--portal-accent) 20%, white);
  --el-color-primary-light-9: color-mix(in srgb, var(--portal-accent) 10%, white);
  --el-color-primary-dark-2: color-mix(in srgb, var(--portal-accent) 80%, black);
  --el-bg-color: var(--portal-surface);
  --el-bg-color-overlay: var(--portal-surface-strong);
  --el-fill-color-blank: var(--portal-surface);
  --el-fill-color-light: var(--portal-bg-soft);
  --el-text-color-primary: var(--portal-text);
  --el-text-color-regular: var(--portal-text-soft);
  --el-border-color: var(--portal-line);
  --el-border-radius-base: 4px;
  --el-border-radius-small: 3px;
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:root[data-theme='blue'] {
  --portal-bg: #fbfdff;
  --portal-bg-soft: #f3f7fa;
  --portal-surface-strong: #f8fbfd;
  --portal-line: #e0e7eb;
  --portal-accent: #2b5d78;
  --portal-accent-2: #a43d38;
  --portal-warm: #a43d38;
  --portal-glow: rgba(43, 93, 120, .05);
  --portal-hero-bottom: #f8fbfd;
}

:root[data-theme='green'] {
  --portal-bg: #fcfdfb;
  --portal-bg-soft: #f4f8f4;
  --portal-surface-strong: #f9fbf8;
  --portal-line: #e1e9e1;
  --portal-accent: #416e55;
  --portal-accent-2: #a43d38;
  --portal-warm: #a43d38;
  --portal-glow: rgba(65, 110, 85, .05);
  --portal-hero-bottom: #f9fbf8;
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
  background: var(--portal-bg);
  color: var(--portal-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2 { font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; }
.el-button { border-radius: 3px !important; }
.el-button--primary { background: var(--portal-accent) !important; border-color: var(--portal-accent) !important; color: var(--portal-accent-ink) !important; }
.el-button--primary:hover { filter: brightness(.94); }
.el-button.is-text { color: var(--portal-accent) !important; }
.el-button:not(.el-button--primary):not(.el-button--danger):not(.is-text) { background: var(--portal-surface); border-color: var(--portal-line); color: var(--portal-text); }
.el-input__wrapper, .el-textarea__inner, .el-select__wrapper { background-color: var(--portal-surface) !important; color: var(--portal-text); box-shadow: 0 0 0 1px var(--portal-line) inset !important; }
.el-input__inner, .el-textarea__inner { color: var(--portal-text); }

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid var(--portal-accent);
  outline-offset: 3px;
}
</style>
