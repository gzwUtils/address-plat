<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --portal-bg: #f7f6f2;
  --portal-bg-soft: #f3f0e9;
  --portal-surface: #fffefa;
  --portal-surface-strong: #f8f3eb;
  --portal-line: #e7e1d8;
  --portal-text: #263442;
  --portal-text-soft: #68727b;
  --portal-accent: #a63d38;
  --portal-accent-ink: #fffdfa;
  --portal-accent-2: #2e607c;
  --portal-warm: #a63d38;
  --portal-glow: rgba(166, 61, 56, .1);
  --portal-hero-top: #fffdf9;
  --portal-hero-bottom: #f8eee9;
  --portal-shadow: 0 18px 46px rgba(59, 63, 68, .07);
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
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:root[data-theme='blue'] {
  --portal-bg: #f5f8f9;
  --portal-bg-soft: #eaf1f4;
  --portal-surface-strong: #f0f6f8;
  --portal-line: #dce6e9;
  --portal-accent: #2b617c;
  --portal-accent-2: #a63d38;
  --portal-warm: #a63d38;
  --portal-glow: rgba(43, 97, 124, .1);
  --portal-hero-bottom: #eaf2f6;
}

:root[data-theme='green'] {
  --portal-bg: #f7f8f4;
  --portal-bg-soft: #edf2e9;
  --portal-surface-strong: #f2f6ef;
  --portal-line: #e0e8dc;
  --portal-accent: #456d55;
  --portal-accent-2: #a63d38;
  --portal-warm: #a63d38;
  --portal-glow: rgba(69, 109, 85, .1);
  --portal-hero-bottom: #edf4ec;
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
    radial-gradient(ellipse 820px 530px at 100% -160px, var(--portal-glow), transparent 76%),
    radial-gradient(ellipse 760px 620px at -180px 64%, rgba(46, 96, 124, .045), transparent 75%),
    var(--portal-bg);
  background-attachment: fixed;
  color: var(--portal-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2 { font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; }
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
