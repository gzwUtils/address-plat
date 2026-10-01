<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --portal-bg: #f4f2ec;
  --portal-bg-soft: #efede6;
  --portal-surface: #fffefa;
  --portal-surface-strong: #f6f3ec;
  --portal-line: #d9d5ca;
  --portal-text: #202a2e;
  --portal-text-soft: #666e6d;
  --portal-accent: #a53732;
  --portal-accent-ink: #fffefa;
  --portal-accent-2: #2d5368;
  --portal-warm: #a53732;
  --portal-glow: rgba(165, 55, 50, .08);
  --portal-hero-top: #fffefa;
  --portal-hero-bottom: #f6f3ec;
  --portal-shadow: 0 5px 18px rgba(32, 42, 46, .035);
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
  --portal-bg: #f2f4f3;
  --portal-bg-soft: #e9efef;
  --portal-surface-strong: #f2f6f5;
  --portal-line: #d4dddc;
  --portal-accent: #2d5368;
  --portal-accent-2: #a53732;
  --portal-warm: #a53732;
  --portal-glow: rgba(45, 83, 104, .08);
  --portal-hero-bottom: #f2f6f5;
}

:root[data-theme='green'] {
  --portal-bg: #f3f4ed;
  --portal-bg-soft: #e9eee5;
  --portal-surface-strong: #f3f6ef;
  --portal-line: #d7ded1;
  --portal-accent: #456b56;
  --portal-accent-2: #a53732;
  --portal-warm: #a53732;
  --portal-glow: rgba(69, 107, 86, .08);
  --portal-hero-bottom: #f3f6ef;
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
