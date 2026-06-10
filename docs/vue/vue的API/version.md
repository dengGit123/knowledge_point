### Vue version

> 📖 [官方文档 - version](https://cn.vuejs.org/api/general.html#version)

### 一、概述

`version` 是 Vue 3 提供的一个全局常量 API，用于在运行时获取当前正在使用的 Vue 版本号。它返回一个遵循 [语义化版本（SemVer）](https://semver.org/lang/zh-CN/) 规范的字符串，例如 `"3.5.13"`。

**为什么需要它？**

在日常开发中，我们通常很少关心 Vue 的版本号，因为项目一旦确定版本就不会频繁变动。但在以下场景中，`version` 就显得尤为重要：

- **开发 Vue 插件或第三方库时**：需要检测宿主环境的 Vue 版本是否满足兼容性要求
- **条件性使用新特性时**：某些 API 只在特定版本之后才可用（如 `defineModel` 需要 3.4+）
- **调试与错误上报时**：在错误报告中附带 Vue 版本号，能大幅提升问题定位效率
- **多版本共存环境**：在微前端或 monorepo 中，可能存在多个 Vue 版本同时运行的情况

```ts
import { version } from 'vue'

console.log(version) // "3.5.13"
```

### 二、核心原理

`version` 的实现非常简单，它是 Vue 包在构建时通过构建工具注入的一个**只读字符串常量**。

**源码层面**：

```ts
// Vue 源码中的定义（简化）
export const version: string = __VERSION__
```

其中 `__VERSION__` 是在构建阶段由 Vite / Rollup 通过 `define` 选项替换为 `package.json` 中的 `version` 字段值。

**关键特性**：

- **编译时常量**：值在构建阶段确定，运行时不可更改
- **字符串类型**：返回标准的 SemVer 格式字符串，如 `"3.5.13"`、`"3.4.0-beta.1"`
- **全局导出**：从 `vue` 包直接导出，无需通过应用实例获取
- **Tree-shaking 友好**：如果代码中没有引用 `version`，它不会被打包进最终产物

### 三、详细用法

#### 1. 基本用法

**直接获取版本号**：

```ts
import { version } from 'vue'

// 获取当前 Vue 版本
console.log(`当前项目使用的 Vue 版本: ${version}`)
// 输出: "当前项目使用的 Vue 版本: 3.5.13"
```

**在应用启动时打印版本信息**：

```ts
import { createApp, version } from 'vue'
import App from './App.vue'

// ✅ 在控制台以醒目的样式输出版本信息（开发环境调试用）
if (import.meta.env.DEV) {
  console.log(
    `%c Vue %c v${version} `,
    'background: #42b983; color: white; padding: 2px 6px; border-radius: 3px 0 0 3px; font-weight: bold;',
    'background: #35495e; color: white; padding: 2px 6px; border-radius: 0 3px 3px 0;'
  )
}

const app = createApp(App)
app.mount('#app')
```

**解析版本号各部分**：

```ts
import { version } from 'vue'

// 解析主版本号、次版本号、修订号
const [major, minor, patch] = version.split('.').map(Number)

console.log(`主版本: ${major}`)   // 3
console.log(`次版本: ${minor}`)   // 5
console.log(`修订号: ${patch}`)   // 13
```

#### 2. 进阶用法

**（1）版本比较工具类**：

```ts
// utils/version.ts
import { version } from 'vue'

/**
 * 语义化版本比较工具
 * 支持标准的版本号比较：大于、小于、等于、大于等于、小于等于
 */
class SemVer {
  private parts: number[]

  constructor(private versionStr: string) {
    // 去除预发布后缀，如 "3.5.13-beta.1" -> "3.5.13"
    const clean = versionStr.split('-')[0]
    this.parts = clean.split('.').map(Number)
  }

  private compare(other: string): number {
    const otherParts = other.split('-')[0].split('.').map(Number)

    for (let i = 0; i < Math.max(this.parts.length, otherParts.length); i++) {
      const a = this.parts[i] ?? 0
      const b = otherParts[i] ?? 0
      if (a > b) return 1
      if (a < b) return -1
    }
    return 0
  }

  gt(other: string): boolean { return this.compare(other) > 0 }
  gte(other: string): boolean { return this.compare(other) >= 0 }
  lt(other: string): boolean { return this.compare(other) < 0 }
  lte(other: string): boolean { return this.compare(other) <= 0 }
  eq(other: string): boolean { return this.compare(other) === 0 }
}

// 创建当前 Vue 版本的比较器实例
export const vueVersion = new SemVer(version)

// ✅ 使用示例
if (vueVersion.gte('3.4.0')) {
  console.log('当前 Vue 版本支持 defineModel')
}
```

**（2）基于版本的条件性特性检测**：

```ts
// utils/feature-detect.ts
import { version } from 'vue'

interface VersionInfo {
  major: number
  minor: number
  patch: number
  prerelease: string | null
}

function parseVersion(v: string): VersionInfo {
  const [main, prerelease] = v.split('-')
  const [major, minor, patch] = main.split('.').map(Number)
  return { major, minor, patch, prerelease: prerelease ?? null }
}

const info = parseVersion(version)

/**
 * 各版本引入的关键特性映射表
 * 用于在运行时判断当前 Vue 版本是否支持某个特性
 */
export function isFeatureSupported(feature: string): boolean {
  switch (feature) {
    case 'composition-api':
      return info.major >= 3 || (info.major === 2 && info.minor >= 7)
    case 'script-setup':
      return info.major === 3 && info.minor >= 2
    case 'defineOptions':
      return info.major === 3 && info.minor >= 3
    case 'defineModel':
      return info.major === 3 && info.minor >= 4
    case 'useId':
      return info.major === 3 && info.minor >= 5
    case 'reactive-props-destructure':
      return info.major === 3 && info.minor >= 5
    default:
      return false
  }
}

// ✅ 使用示例
console.log(`支持 defineModel: ${isFeatureSupported('defineModel')}`)    // true
console.log(`支持 useId: ${isFeatureSupported('useId')}`)                // 取决于版本
```

**（3）插件中的版本兼容性检查**：

```ts
// plugins/my-plugin/index.ts
import { version } from 'vue'
import type { App, Plugin } from 'vue'

const MIN_VUE_VERSION = '3.3.0'

/**
 * 比较版本号：当前版本是否 >= 目标版本
 */
function isVersionGte(current: string, target: string): boolean {
  const curr = current.split('-')[0].split('.').map(Number)
  const tgt = target.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if ((curr[i] ?? 0) > (tgt[i] ?? 0)) return true
    if ((curr[i] ?? 0) < (tgt[i] ?? 0)) return false
  }
  return true
}

export const MyPlugin: Plugin = {
  install(app: App, options?: Record<string, unknown>) {
    // ✅ 安装时检查 Vue 版本兼容性
    if (!isVersionGte(version, MIN_VUE_VERSION)) {
      console.error(
        `[MyPlugin] 需要 Vue >= ${MIN_VUE_VERSION}，` +
        `当前版本为 ${version}。插件将不会安装。`
      )
      return
    }

    console.log(`[MyPlugin] 已成功安装，运行在 Vue ${version} 上`)
    // 插件注册逻辑...
    app.provide('my-plugin', { version: '1.0.0', ...options })
  }
}
```

**（4）通过 CDN 全局访问**：

```html
<!-- 通过 CDN 引入 Vue 时，version 挂载在全局 Vue 对象上 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  // ✅ 通过全局对象访问
  console.log(Vue.version) // "3.5.13"

  // ❌ 不能通过 ES Module 方式导入
  // import { version } from 'vue' // CDN 环境下不适用
</script>
```

#### 3. API 参数说明

| 属性 | 说明 | 类型 | 值示例 |
| --- | --- | --- | --- |
| `version` | 当前 Vue 的版本号字符串 | `string`（只读） | `"3.5.13"` |

**返回值说明**：

| 返回值格式 | 说明 | 示例 |
| --- | --- | --- |
| `MAJOR.MINOR.PATCH` | 正式发布版本 | `"3.5.13"` |
| `MAJOR.MINOR.PATCH-alpha.x` | Alpha 预发布版本 | `"3.6.0-alpha.1"` |
| `MAJOR.MINOR.PATCH-beta.x` | Beta 预发布版本 | `"3.6.0-beta.2"` |
| `MAJOR.MINOR.PATCH-rc.x` | 候选发布版本 | `"3.6.0-rc.1"` |

### 四、实现效果

**1. 基本版本获取效果**：

```ts
import { version } from 'vue'

console.log(version)
// 控制台输出: "3.5.13"
```

**2. 版本解析效果**：

```ts
import { version } from 'vue'

const [major, minor, patch] = version.split('.').map(Number)

console.log(major)  // 3
console.log(minor)  // 5
console.log(patch)  // 13

// 判断是否为预发布版本
const isPrerelease = version.includes('-')
console.log(isPrerelease) // false（正式版）
```

**3. 版本兼容性检查效果**：

```ts
import { version } from 'vue'

const minor = parseInt(version.split('.')[1])

// ✅ 根据版本号决定使用哪种 API
if (minor >= 4) {
  // Vue 3.4+ 支持 defineModel
  console.log('可以使用 defineModel')
} else {
  // Vue 3.3 及以下使用 props + emit 模拟
  console.log('请使用 props + emit 模拟 v-model')
}
```

**4. 错误上报附带版本信息效果**：

```ts
import { version } from 'vue'

function reportError(error: Error): void {
  const report = {
    vueVersion: version,               // 自动附带 Vue 版本
    errorMessage: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  console.table(report)
  // ┌───────────────┬───────────────────────────┐
  // │    (index)    │          Values           │
  // ├───────────────┼───────────────────────────┤
  // │  vueVersion   │        '3.5.13'           │
  // │ errorMessage  │    'xxx is not defined'   │
  // │    stack      │    'Error: xxx at...'     │
  // │  userAgent    │   'Mozilla/5.0 ...'       │
  // │     url       │   'http://localhost:5173' │
  // │  timestamp    │  '2026-06-10T08:00:00Z'   │
  // └───────────────┴───────────────────────────┘
}
```

### 五、使用场景

#### 1. Vue 插件开发中的版本兼容性检查

开发第三方 Vue 插件时，应在 `install` 方法中检查宿主环境的 Vue 版本是否满足最低要求。

```ts
// plugins/acl-plugin.ts
import { version } from 'vue'
import type { App, Plugin } from 'vue'

const REQUIRED_VUE_VERSION = '3.2.0'

function checkVueVersion(): boolean {
  const current = version.split('.').map(Number)
  const required = REQUIRED_VUE_VERSION.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if ((current[i] ?? 0) > (required[i] ?? 0)) return true
    if ((current[i] ?? 0) < (required[i] ?? 0)) return false
  }
  return true
}

export const AclPlugin: Plugin = {
  install(app: App) {
    if (!checkVueVersion()) {
      throw new Error(
        `[AclPlugin] 需要 Vue >= ${REQUIRED_VUE_VERSION}，当前: ${version}`
      )
    }

    // 插件初始化逻辑...
    app.provide('acl', { /* ... */ })
    console.log(`[AclPlugin] 已安装，Vue ${version}`)
  }
}
```

#### 2. 第三方库的 peerDependencies 运行时校验

在库的入口文件中验证宿主 Vue 版本，防止因版本不匹配导致运行时异常。

```ts
// library/src/index.ts
import { version } from 'vue'

const MIN_VERSION = '3.3.0'

function validatePeerDependency(): void {
  const [major, minor] = version.split('.').map(Number)
  const [minMajor, minMinor] = MIN_VERSION.split('.').map(Number)

  const isSupported = major > minMajor || (major === minMajor && minor >= minMinor)

  if (!isSupported) {
    console.warn(
      `[VueAwesomeLib] 当前 Vue 版本 (${version}) 不满足最低要求 (>= ${MIN_VERSION})。\n` +
      '部分功能可能无法正常使用，请升级 Vue 版本。'
    )
  }
}

// ✅ 库初始化时自动执行校验
validatePeerDependency()

export function useAwesomeFeature() {
  // ...
}
```

#### 3. 条件性使用不同版本的 API

根据 Vue 版本动态选择不同的实现方案，确保在多个版本中都能正常工作。

```ts
// composables/useTwoWayBinding.ts
import { version } from 'vue'
import { ref, watch, computed } from 'vue'
import type { Ref, WritableComputedResult } from 'vue'

/**
 * 兼容多版本的 v-model 封装
 * Vue 3.4+ 使用 defineModel（由调用方使用）
 * Vue 3.3 及以下使用 props + emit + computed 手动实现
 */
export function useTwoWayBinding(
  modelValue: Ref<string>,
  emit: (event: 'update:modelValue', value: string) => void
): WritableComputedResult<string> {
  const minor = parseInt(version.split('.')[1])

  return computed({
    get: () => modelValue.value,
    set: (val: string) => emit('update:modelValue', val)
  })
}

// ✅ 在调用方根据版本选择不同的组件写法
// Vue 3.4+ 的组件可以直接使用 defineModel
// Vue 3.3- 的组件使用 useTwoWayBinding 手动绑定
```

#### 4. 开发环境调试信息展示

在开发环境的页面底部或控制台中展示 Vue 版本等调试信息，方便开发者快速了解运行环境。

```ts
// composables/useDebugInfo.ts
import { version } from 'vue'
import { ref, onMounted } from 'vue'

interface DebugInfo {
  vueVersion: string
  mode: string
  timestamp: string
  userAgent: string
}

export function useDebugInfo() {
  const debugInfo = ref<DebugInfo | null>(null)

  onMounted(() => {
    debugInfo.value = {
      vueVersion: version,
      mode: import.meta.env.DEV ? 'development' : 'production',
      timestamp: new Date().toLocaleString(),
      userAgent: navigator.userAgent
    }

    // ✅ 仅在开发环境输出
    if (import.meta.env.DEV) {
      console.group('%c[调试信息]', 'color: #42b983; font-weight: bold;')
      console.table(debugInfo.value)
      console.groupEnd()
    }
  })

  return { debugInfo }
}
```

```vue
<!-- components/DebugPanel.vue -->
<script setup lang="ts">
import { useDebugInfo } from '@/composables/useDebugInfo'

const { debugInfo } = useDebugInfo()
</script>

<template>
  <div v-if="debugInfo && import.meta.env.DEV" class="debug-panel">
    <p>Vue 版本: {{ debugInfo.vueVersion }}</p>
    <p>运行模式: {{ debugInfo.mode }}</p>
    <p>当前时间: {{ debugInfo.timestamp }}</p>
  </div>
</template>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #42b983;
  font-size: 12px;
  font-family: monospace;
  border-radius: 4px 0 0 0;
  z-index: 9999;
}
</style>
```

#### 5. 错误上报系统附带版本信息

在全局错误处理或 Sentry 等监控系统中附带 Vue 版本号，帮助快速定位版本相关的问题。

```ts
// utils/error-reporter.ts
import { version } from 'vue'
import type { App } from 'vue'

interface ErrorReport {
  vueVersion: string
  message: string
  stack?: string
  url: string
  timestamp: string
  userInfo?: Record<string, unknown>
}

export function setupErrorHandler(app: App): void {
  // ✅ 使用 Vue 的全局错误处理器
  app.config.errorHandler = (err, instance, info) => {
    const report: ErrorReport = {
      vueVersion: version,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    // 发送到错误监控服务
    sendErrorReport(report)

    // 开发环境同时输出到控制台
    if (import.meta.env.DEV) {
      console.error('[Vue Error]', report)
    }
  }
}

async function sendErrorReport(report: ErrorReport): Promise<void> {
  try {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
  } catch {
    // 上报失败时静默处理，避免无限递归
  }
}
```

```ts
// main.ts
import { createApp, version } from 'vue'
import App from './App.vue'
import { setupErrorHandler } from './utils/error-reporter'

const app = createApp(App)
setupErrorHandler(app)

console.log(`[应用启动] Vue ${version}`)
app.mount('#app')
```

#### 6. 微前端架构中的 Vue 版本检测

在微前端（如 qiankun、wujie）中，子应用可能使用不同版本的 Vue，需要检测版本以避免冲突。

```ts
// micro-app/vue-version-check.ts
import { version } from 'vue'

interface VersionCheckResult {
  compatible: boolean
  currentVersion: string
  message: string
}

/**
 * 微前端场景下的版本兼容性检测
 * @param hostVueVersion - 主应用传递过来的 Vue 版本号
 */
export function checkMicroFrontendCompatibility(
  hostVueVersion?: string
): VersionCheckResult {
  const currentVersion = version

  if (!hostVueVersion) {
    return {
      compatible: true,
      currentVersion,
      message: '未检测到主应用 Vue 版本，跳过兼容性检查'
    }
  }

  const [currentMajor] = currentVersion.split('.').map(Number)
  const [hostMajor] = hostVueVersion.split('.').map(Number)

  // ✅ 主版本号一致则认为兼容
  if (currentMajor === hostMajor) {
    return {
      compatible: true,
      currentVersion,
      message: `子应用 Vue ${currentVersion} 与主应用 Vue ${hostVueVersion} 兼容`
    }
  }

  // ❌ 主版本号不同则不兼容
  return {
    compatible: false,
    currentVersion,
    message: `版本不兼容: 子应用 Vue ${currentVersion} 与主应用 Vue ${hostVueVersion} 主版本号不同`
  }
}
```

#### 7. 构建时的环境信息注入

在 Vite 构建时将 Vue 版本信息注入到 HTML 中，方便运维和排查线上问题。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { version as vueVersion } from 'vue'  // 在构建时获取 Vue 版本
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'inject-version-meta',
      transformIndexHtml(html: string) {
        // ✅ 在 HTML 中注入 Vue 版本 meta 标签
        return html.replace(
          '<head>',
          `<head>\n    <meta name="vue-version" content="${vueVersion}">`
        )
      }
    }
  ],
  define: {
    // 将 Vue 版本暴露给应用代码使用
    __VUE_VERSION__: JSON.stringify(vueVersion)
  }
})
```

```html
<!-- 构建后的 index.html -->
<head>
  <meta name="vue-version" content="3.5.13">
  <!-- ... -->
</head>
```

#### 8. 自动化测试中的版本断言

在 E2E 或单元测试中，断言 Vue 版本是否符合预期，防止因依赖升级引入意外问题。

```ts
// tests/setup.ts
import { version } from 'vue'
import { describe, it, expect } from 'vitest'

describe('Vue 版本检查', () => {
  it('应使用 Vue 3.x 版本', () => {
    const major = parseInt(version.split('.')[0])
    expect(major).toBe(3)
  })

  it('版本号应为合法的 SemVer 格式', () => {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/
    expect(version).toMatch(semverRegex)
  })

  it('应满足项目最低版本要求', () => {
    const MIN_VERSION = '3.3.0'
    const [major, minor] = version.split('.').map(Number)
    const [minMajor, minMinor] = MIN_VERSION.split('.').map(Number)

    const isGte = major > minMajor || (major === minMajor && minor >= minMinor)
    expect(isGte).toBe(true)
  })
})
```

#### 9. 国际化库中的版本适配

开发 Vue I18n 等国际化方案时，根据 Vue 版本选择不同的 Composition API 实现策略。

```ts
// plugins/i18n/index.ts
import { version } from 'vue'
import { ref, computed, inject, provide } from 'vue'
import type { App, Plugin, InjectionKey } from 'vue'

const minor = parseInt(version.split('.')[1])

interface I18nConfig {
  locale: string
  messages: Record<string, Record<string, string>>
}

// ✅ Vue 3.3+ 可以使用更简洁的 provide/inject 类型声明
export const i18nKey: InjectionKey<I18nConfig> = Symbol('i18n')

export const I18nPlugin: Plugin = {
  install(app: App, config: I18nConfig) {
    const locale = ref(config.locale)

    const t = (key: string): string => {
      return config.messages[locale.value]?.[key] ?? key
    }

    app.provide(i18nKey, config)

    // ✅ 根据版本决定全局属性注册方式
    app.config.globalProperties.$t = t
    app.config.globalProperties.$locale = locale

    console.log(`[I18n] 已安装，适配 Vue ${version}`)
  }
}
```

#### 10. 组件库按需加载与版本适配

组件库中根据 Vue 版本决定是否使用某些高级特性，以确保向下兼容。

```ts
// ui-library/src/utils/version-adapt.ts
import { version } from 'vue'

interface VueVersionInfo {
  major: number
  minor: number
  patch: number
  full: string
}

export function getVueVersionInfo(): VueVersionInfo {
  const [major, minor, patch] = version.split('.').map(Number)
  return { major, minor, patch, full: version }
}

/**
 * 根据版本返回对应组件的实现
 */
export function getComponentStrategy(componentName: string): 'modern' | 'legacy' {
  const info = getVueVersionInfo()

  switch (componentName) {
    case 'ModelSelect':
      // defineModel 需要 3.4+
      return info.minor >= 4 ? 'modern' : 'legacy'
    case 'TeleportDialog':
      // Teleport 稳定版从 3.0 开始
      return 'modern'
    default:
      return info.minor >= 3 ? 'modern' : 'legacy'
  }
}

// ✅ 使用示例
const strategy = getComponentStrategy('ModelSelect')
if (strategy === 'modern') {
  console.log('使用 defineModel 现代实现')
} else {
  console.log('使用 props + emit 兼容实现')
}
```

### 六、注意事项

#### 1. version 是只读常量，不能修改

```ts
import { version } from 'vue'

// ❌ 不能修改 version 的值
// version = '4.0.0' // TypeError: Assignment to constant variable

// ✅ 如果需要修改后的值，创建新的变量
const displayVersion = `v${version}`
```

#### 2. 版本号遵循 SemVer 语义化版本规范

```ts
import { version } from 'vue'

// version 的格式始终为 "MAJOR.MINOR.PATCH" 或 "MAJOR.MINOR.PATCH-PRERELEASE"
// 例如: "3.5.13", "3.6.0-beta.1", "3.6.0-rc.2"

// ❌ 不要假设版本号始终是三段纯数字
const cleanVersion = version.split('-')[0] // 去除预发布后缀

// ✅ 解析时应考虑预发布后缀
const [major, minor, patch] = cleanVersion.split('.').map(Number)
```

#### 3. 使用构建工具时会正确注入

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // ✅ Vite 会自动处理 Vue 包中 __VERSION__ 的替换
  // 不需要额外配置
})

// webpack 配置同理，vue-loader 会自动处理
```

#### 4. 运行时获取的是实际运行的版本

```ts
import { version } from 'vue'

// ✅ version 始终反映运行时实际加载的 Vue 版本
// 而不是 package.json 中声明的版本
// 如果使用了 npm link 或 alias，version 可能与预期不同

// ❌ 不要混淆 package.json 的版本和运行时版本
// import pkg from 'vue/package.json'
// pkg.version // 这是包的声明版本，可能与实际运行版本不同
```

#### 5. 比较版本号时不要直接用字符串比较

```ts
import { version } from 'vue'

// ❌ 字符串比较不可靠
// '3.10.0' < '3.9.0' 为 true（因为 '10' < '9' 在字符串比较中成立）
if (version >= '3.9.0') { /* 不可靠 */ }

// ✅ 应该逐段比较数字
function isVersionGte(current: string, target: string): boolean {
  const curr = current.split('-')[0].split('.').map(Number)
  const tgt = target.split('-')[0].split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((curr[i] ?? 0) > (tgt[i] ?? 0)) return true
    if ((curr[i] ?? 0) < (tgt[i] ?? 0)) return false
  }
  return true
}

if (isVersionGte(version, '3.9.0')) { /* 可靠 */ }
```

#### 6. 建议使用成熟的版本比较库替代手动比较

```ts
// ✅ 推荐使用 semver 库进行版本比较，功能更完善
import semver from 'semver'
import { version } from 'vue'

if (semver.gte(version, '3.4.0')) {
  console.log('支持 defineModel')
}

// semver 还支持范围比较
if (semver.satisfies(version, '>=3.3.0 <4.0.0')) {
  console.log('版本在 3.3 到 4.0 之间')
}

// ⚠️ 如果不想引入额外依赖，才使用手动比较
```

#### 7. CDN 环境下通过全局对象访问

```html
<!-- ✅ CDN 引入时使用全局 Vue 对象 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  console.log(Vue.version) // "3.5.13"
</script>

<!-- ❌ CDN 环境下不能使用 ES Module 导入 -->
<script>
  // import { version } from 'vue' // ReferenceError
</script>

<!-- ✅ CDN + ES Module 方式 -->
<script type="module">
  import { version } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
  console.log(version) // "3.5.13"
</script>
```

#### 8. 预发布版本的检测

```ts
import { version } from 'vue'

// ✅ 检测是否为预发布版本
const isPrerelease = version.includes('-')
const isAlpha = version.includes('alpha')
const isBeta = version.includes('beta')
const isRC = version.includes('rc')

if (isPrerelease) {
  console.warn(`当前使用的是预发布版本: ${version}`)
  console.warn('预发布版本可能不稳定，不建议在生产环境中使用')
}

// ❌ 不要假设预发布后缀的格式
// 有些版本可能是 "3.6.0-beta.1" 或 "3.6.0-beta.1.2"
// 应该使用正则表达式进行更精确的匹配
```

#### 9. 不应将 version 用于运行时的条件渲染

```vue
<script setup lang="ts">
import { version } from 'vue'
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <!-- ❌ 不要在模板中使用 version 做条件渲染 -->
  <!-- <div v-if="version >= '3.4.0'">...</div> -->

  <!-- ✅ version 适合在 setup 阶段做逻辑判断，而不是模板中 -->
  <div>{{ count }}</div>
</template>
```

```ts
// ✅ 正确做法：在 setup 阶段根据版本选择不同的组件或逻辑
import { version } from 'vue'
import { defineAsyncComponent } from 'vue'

const minor = parseInt(version.split('.')[1])

// 根据版本动态加载不同的组件实现
const MyComponent = minor >= 4
  ? defineAsyncComponent(() => import('./MyComponentModern.vue'))
  : defineAsyncComponent(() => import('./MyComponentLegacy.vue'))
```

#### 10. 在 SSR 场景中 version 同样可用

```ts
// server.ts（Node.js 环境）
import { version } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './App.vue'

// ✅ SSR 环境中 version 同样可以正常获取
console.log(`[SSR] Vue ${version}`)

export async function render(url: string): Promise<string> {
  const app = createSSRApp(App)
  const html = await renderToString(app)

  // ✅ 可以在 SSR 上下文中使用 version
  return html.replace(
    '</head>',
    `<meta name="vue-version" content="${version}"></head>`
  )
}
```

### 七、相关 API 对比

| API | 说明 | 返回值 | 使用场景 |
| --- | --- | --- | --- |
| `version` | 运行时获取 Vue 版本号 | `string`，如 `"3.5.13"` | 插件兼容性检查、错误上报 |
| `import.meta.env.VUE_VERSION` | 通过 Vite 环境变量获取 | `string`（需手动配置） | 构建时注入版本信息 |
| `package.json` 的 `version` | 读取 npm 包的声明版本 | `string` | 构建脚本中使用 |
| `app.version` | Vue 2 的全局 API | `string` | Vue 2 中使用（已废弃） |

> 💡 **提示：** `version` 是 Vue 3 中推荐的方式。Vue 2 中通过 `Vue.version` 访问，但在 Vue 3 中应使用 `import { version } from 'vue'`。

### 八、总结

`version` 是一个简单但实用的全局 API，核心要点：

- **本质**：一个编译时注入的只读字符串常量，遵循 SemVer 语义化版本规范
- **核心用途**：运行时获取当前 Vue 版本号
- **典型场景**：插件兼容性检查、库的 peerDependencies 校验、错误上报、调试信息展示、微前端版本检测
- **版本比较**：不要直接用字符串比较，应逐段转为数字比较，或使用 `semver` 库
- **适用环境**：浏览器端、Node.js（SSR）、CDN 全局引入均可使用
- **最佳实践**：在插件和库的入口处统一进行版本校验，提前发现不兼容问题

```ts
// 总结：version 的典型使用模式
import { version } from 'vue'

// 1. 直接使用
console.log(version)

// 2. 解析使用
const [major, minor] = version.split('.').map(Number)

// 3. 比较使用（推荐使用 semver 库）
import semver from 'semver'
semver.gte(version, '3.4.0')

// 4. 信息上报
const report = { vueVersion: version, /* ... */ }
```
