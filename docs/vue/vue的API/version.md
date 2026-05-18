# version

Vue 的全局 API，用于获取当前运行的 Vue 版本号。

## 语法

```javascript
import { version } from 'vue'

console.log(version)
```

## 返回值

返回一个字符串，表示当前 Vue 的版本号

## 基础用法

```javascript
import { version } from 'vue'

console.log('Vue 版本:', version)
// 输出: "3.4.0" 或其他版本号
```

## 版本检查

```javascript
import { version } from 'vue'

function checkVersion(requiredVersion) {
  const currentVersion = version.split('.').map(Number)
  const required = requiredVersion.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (currentVersion[i] > required[i]) return true
    if (currentVersion[i] < required[i]) return false
  }
  return true
}

if (checkVersion('3.2.0')) {
  console.log('Vue 版本符合要求')
}
```

## 兼容性处理

```javascript
import { version } from 'vue'

const [major, minor, patch] = version.split('.').map(Number)

if (major === 3) {
  if (minor >= 3) {
    // 使用 Vue 3.3+ 的新特性
    import('./vue33Features.js')
  } else {
    // 使用 Vue 3.0-3.2 的写法
    import('./vue30Features.js')
  }
}
```

## 特性检测

```javascript
import { version } from 'vue'

const features = {
  defineModel: () => {
    const [major, minor] = version.split('.').map(Number)
    return major > 3 || (major === 3 && minor >= 4)
  },
  defineOptions: () => {
    const [major, minor] = version.split('.').map(Number)
    return major > 3 || (major === 3 && minor >= 3)
  },
  suspense: () => {
    const [major, minor] = version.split('.').map(Number)
    return major === 3 && minor >= 0
  }
}

console.log('支持 defineModel:', features.defineModel())
console.log('支持 defineOptions:', features.defineOptions())
```

## 开发环境检测

```javascript
import { version } from 'vue'

const isDev = __DEV__ || version.includes('-') || version.includes('beta')

if (isDev) {
  console.log('正在使用开发版本')
}
```

## 在应用初始化时显示

```javascript
import { createApp, version } from 'vue'
import App from './App.vue'

const app = createApp(App)

console.log(
  `%c Vue %c ${version} `,
  'background: #42b983; color: white; padding: 2px 5px; border-radius: 3px 0 0 3px;',
  'background: #35495e; color: white; padding: 2px 5px; border-radius: 0 3px 3px 0;'
)

app.mount('#app')
```

## 版本比较工具

```javascript
import { version } from 'vue'

class Version {
  constructor(versionString) {
    this.parts = versionString.split('-')[0].split('.').map(Number)
  }

  compare(other) {
    const otherParts = other.split('-')[0].split('.').map(Number)

    for (let i = 0; i < Math.max(this.parts.length, otherParts.length); i++) {
      const a = this.parts[i] || 0
      const b = otherParts[i] || 0

      if (a > b) return 1
      if (a < b) return -1
    }

    return 0
  }

  gt(other) { return this.compare(other) > 0 }
  gte(other) { return this.compare(other) >= 0 }
  lt(other) { return this.compare(other) < 0 }
  lte(other) { return this.compare(other) <= 0 }
  eq(other) { return this.compare(other) === 0 }
}

const vueVersion = new Version(version)

console.log('大于 3.2:', vueVersion.gt('3.2.0'))
console.log('小于等于 3.4:', vueVersion.lte('3.4.0'))
```

## 条件导入

```javascript
// utils.js
import { version } from 'vue'

const VueVersion = {
  major: parseInt(version.split('.')[0]),
  minor: parseInt(version.split('.')[1]),
  patch: parseInt(version.split('.')[2].split('-')[0])
}

export function useFeature(featureName) {
  switch (featureName) {
    case 'defineModel':
      return VueVersion.major === 3 && VueVersion.minor >= 4
    case 'scriptSetup':
      return VueVersion.major === 3 && VueVersion.minor >= 2
    case 'suspense':
      return VueVersion.major === 3
    default:
      return false
  }
}
```

## 调试信息

```javascript
import { version } from 'vue'

export function logVueInfo() {
  const info = {
    version,
    major: version.split('.')[0],
    minor: version.split('.')[1],
    patch: version.split('.')[2],
    isProduction: !version.includes('-'),
    isBeta: version.includes('beta'),
    isAlpha: version.includes('alpha'),
    isRC: version.includes('rc')
  }

  console.table(info)
  return info
}
```

## 插件版本检查

```javascript
// my-plugin.js
import { version } from 'vue'

export default {
  install(app, options) {
    const [major] = version.split('.')

    if (major !== '3') {
      console.error('此插件需要 Vue 3')
      return
    }

    console.log('插件已安装，Vue 版本:', version)
    // 插件逻辑...
  }
}
```

## 库的兼容性声明

```javascript
// library.js
import { version } from 'vue'

export const REQUIRED_VUE_VERSION = '3.2.0'

export function checkCompatibility() {
  const current = version.split('.').map(Number)
  const required = REQUIRED_VUE_VERSION.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (current[i] > required[i]) return true
    if (current[i] < required[i]) {
      console.warn(
        `此库需要 Vue ${REQUIRED_VUE_VERSION} 或更高版本，当前版本: ${version}`
      )
      return false
    }
  }

  return true
}
```

## 错误报告

```javascript
import { version } from 'vue'

export function reportError(error) {
  const report = {
    vueVersion: version,
    errorMessage: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }

  // 发送到错误追踪服务
  fetch('/api/error-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  })
}
```

## 注意事项

1. **只读**：version 是只读常量，不能修改

2. **格式**：版本号遵循语义化版本规范，如 "3.4.0"

3. **开发版本**：开发版本可能包含 "-beta"、"-alpha"、"-rc" 等后缀

4. **运行时获取**：始终获取实际运行的 Vue 版本，而非开发时的版本

5. **构建工具**：使用 Vite 或 webpack 时，version 会被正确注入

6. **CDN 使用**：从 CDN 引入 Vue 时，也可以通过 Vue.version 访问

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  console.log(Vue.version) // "3.x.x"
</script>
```
