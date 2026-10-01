<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  color-scheme: dark;
  --portal-bg: #0d2230;
  --portal-bg-soft: #163344;
  --portal-surface: #173343;
  --portal-surface-strong: #204353;
  --portal-line: rgba(226, 220, 199, .22);
  --portal-text: #f7f0e3;
  --portal-text-soft: #c9c9be;
  --portal-accent: #a8d5dc;
  --portal-accent-ink: #102b37;
  --portal-accent-2: #d8b683;
  --portal-warm: #efc78e;
  --portal-glow: rgba(85, 147, 166, .38);
  --portal-hero-top: #28576b;
  --portal-hero-bottom: #173447;
  --portal-shadow: 0 20px 54px rgba(2, 13, 19, .21);
  --el-color-primary: var(--portal-accent);
  --el-bg-color: var(--portal-surface);
  --el-bg-color-overlay: var(--portal-surface-strong);
  --el-fill-color-blank: var(--portal-surface);
  --el-fill-color-light: var(--portal-bg-soft);
  --el-text-color-primary: var(--portal-text);
  --el-text-color-regular: var(--portal-text-soft);
  --el-border-color: var(--portal-line);
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:root[data-theme='red'] {
  --portal-bg: #2c1b20;
  --portal-bg-soft: #3c252b;
  --portal-surface: #43292f;
  --portal-surface-strong: #55343a;
  --portal-line: rgba(243, 219, 202, .22);
  --portal-accent: #f0b1a0;
  --portal-accent-ink: #442329;
  --portal-accent-2: #ebcf9f;
  --portal-glow: rgba(167, 72, 66, .4);
  --portal-hero-top: #753b42;
  --portal-hero-bottom: #46262e;
}

:root[data-theme='green'] {
  --portal-bg: #14271f;
  --portal-bg-soft: #1f382c;
  --portal-surface: #234033;
  --portal-surface-strong: #2b4d3c;
  --portal-line: rgba(226, 227, 198, .22);
  --portal-accent: #b7d9b6;
  --portal-accent-ink: #1a3528;
  --portal-accent-2: #e4c392;
  --portal-glow: rgba(82, 144, 100, .38);
  --portal-hero-top: #3c6c52;
  --portal-hero-bottom: #234333;
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
    radial-gradient(ellipse 900px 620px at 6% 0%, var(--portal-glow), transparent 70%),
    radial-gradient(ellipse 740px 900px at 100% 52%, var(--portal-glow), transparent 78%),
    repeating-linear-gradient(115deg, transparent 0 90px, rgba(246, 236, 213, .025) 91px, transparent 92px),
    var(--portal-bg);
  background-attachment: fixed;
  color: var(--portal-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2 { font-family: 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif; }
.el-button--primary { background: var(--portal-accent) !important; border-color: var(--portal-accent) !important; color: var(--portal-accent-ink) !important; }
.el-button.is-text { color: var(--portal-accent) !important; }
.el-button:not(.el-button--primary):not(.el-button--danger):not(.is-text) { background: var(--portal-surface-strong); border-color: var(--portal-line); color: var(--portal-text); }
.el-input__wrapper, .el-textarea__inner, .el-select__wrapper { background-color: var(--portal-bg-soft) !important; color: var(--portal-text); box-shadow: 0 0 0 1px var(--portal-line) inset !important; }
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
