# single-spa 微前端框架

## 一、什么是 single-spa

[single-spa](https://single-spa.js.org/) 是一个**JavaScript 微前端框架**，它允许你将大型前端应用拆分为多个可独立开发、部署和运行的小型应用（微应用）。这些微应用可以：

- 使用不同的框架（Vue、React、Angular 等）
- 独立构建和部署
- 在同一个页面中协同工作
- 共享依赖和状态

### 核心特性

| 特性 | 说明 |
|------|------|
| **框架无关** | 支持 React、Vue、Angular、Svelte 等任意框架 |
| **独立部署** | 各微应用可独立开发、测试、部署 |
| **应用生命周期** | 完善的生命周期管理（bootstrap、mount、unmount 等） |
| **懒加载** | 按需加载微应用，提升首屏性能 |
| **JS 沙箱隔离** | 通过拦截机制实现 JS 隔离 |

### 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (页面)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Single-spa 根容器                      │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │  导航栏应用   │  │  Header 应用  │              │  │
│  │  │  (Vue/React) │  │   (Static)   │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │         主内容区 (根据路由动态加载)             │ │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │ │  │
│  │  │  │ 应用 A  │  │ 应用 B  │  │ 应用 C  │      │ │  │
│  │  │  │ (React) │  │ (Vue)   │  │(Angular)│      │ │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘      │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 二、作用

### 1. 解决大型应用维护难题

```javascript
// 传统单体应用
monolith-app/
├── src/
│   ├── features/a/*      // 功能 A
│   ├── features/b/*      // 功能 B
│   ├── features/c/*      // 功能 C
│   └── ...
├── package.json          // 统一依赖
└── vite.config.ts        // 统一构建
// 问题：构建慢、部署风险高、技术栈无法演进

// single-spa 微前端
micro-frontend/
├── apps/
│   ├── nav-app/          // 独立仓库、独立部署
│   ├── app-a/            // React 应用
│   ├── app-b/            // Vue 应用
│   └── app-c/            // Angular 应用
└── root-config/          // 基座应用
```

### 2. 技术栈无关的集成

```javascript
// 可以在同一个页面混用不同框架
registerApplication({
  name: 'react-app',
  app: () => System.import('react-app'),
  activeWhen: '/react'
})

registerApplication({
  name: 'vue-app',
  app: () => System.import('vue-app'),
  activeWhen: '/vue'
})

registerApplication({
  name: 'angular-app',
  app: () => System.import('angular-app'),
  activeWhen: '/angular'
})
```

### 3. 团队独立开发

| 场景 | 传统方式 | 微前端方式 |
|------|---------|-----------|
| 开发 | 修改代码需协调、统一发布 | 各团队独立开发、独立发布 |
| 构建 | 全量构建，耗时 10-30 分钟 | 按需构建，1-5 分钟 |
| 风险 | 一处 bug 影响全局 | 故障隔离，影响范围可控 |

## 三、用法

### 3.1 基础概念

single-spa 定义了一套应用生命周期：

```javascript
// 生命周期函数
const myApp = {
  // 初始化阶段（只执行一次）
  bootstrap(props) {
    console.log('应用初始化', props)
    return Promise.resolve()
  },

  // 挂载阶段（每次激活时执行）
  mount(props) {
    console.log('应用挂载', props)
    return Promise.resolve()
  },

  // 卸载阶段（每次失活时执行）
  unmount(props) {
    console.log('应用卸载', props)
    return Promise.resolve()
  },

  // 更新阶段（可选）
  update(props) {
    console.log('应用更新', props)
    return Promise.resolve()
  }
}
```

### 3.2 创建根配置（基座应用）

```bash
# 创建根配置项目
npm init single-spa
# 或使用指定模板
npm init single-spa my-root-config --module root-config
```

```javascript
// root-config/src/index.ejs
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="importmap">
    {
      "imports": {
        "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
        "react": "https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js",
        "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"
      }
    }
  </meta>
</head>
<body>
  <noscript>请启用 JavaScript</noscript>
  <script type="module" src="/root-config.js"></script>
  <main id="app"></main>
</body>
</html>
```

```javascript
// root-config/src/root-config.js
import { registerApplication, start } from 'single-spa'

// 注册微应用
registerApplication({
  name: 'navbar',                    // 应用名称
  app: () => System.import('navbar'), // 应用加载函数
  activeWhen: '/',                    // 激活条件（路由前缀）
  customProps: {                      // 传递给应用的 props
    authToken: 'abc123'
  }
})

registerApplication({
  name: 'app1',
  app: () => System.import('app1'),
  activeWhen: ['/app1', '/app1/:id']
})

registerApplication({
  name: 'app2',
  app: () => System.import('app2'),
  activeWhen: (location) => {
    return location.pathname.startsWith('/app2')
  }
})

// 启动 single-spa
start({
  urlRerouteOnly: true  // 仅在路由变化时重新加载
})
```

### 3.3 创建 Vue 微应用

```bash
# 使用 single-spa 创建 Vue 应用
npm init single-spa my-vue-app
```

```javascript
// my-vue-app/src/main.js
import singleSpaVue from 'single-spa-vue'
import App from './App.vue'

const vueLifecycles = singleSpaVue({
  createApp: () => import('vue').then(m => m.createApp),
  appOptions: {
    render() {
      return h(App, {
        props: {
          // single-spa 传递的 props
          name: this.name,
          mountParcel: this.mountParcel,
          singleSpa: this.singleSpa
        }
      })
    }
  },
  handleInstance: (app) => {
    // 可配置 Vue 全局属性
    app.config.globalProperties.$global = 'global value'
  }
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
```

```javascript
// my-vue-app/package.json
{
  "name": "my-vue-app",
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "devDependencies": {
    "vue-cli-plugin-single-spa": "^3.3.0"
  }
}
```

### 3.4 创建 React 微应用

```javascript
// my-react-app/src/root.component.js
import React from 'react'
import ReactDOM from 'react-dom'

export default function Root(props) {
  return <section>{props.name} is mounted!</section>
}
```

```javascript
// my-react-app/src/main.js
import React from 'react'
import ReactDOM from 'react-dom'
import singleSpaReact from 'single-spa-react'
import Root from './root.component'

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    return <div>Error: {err.message}</div>
  }
})

export const bootstrap = reactLifecycles.bootstrap
export const mount = reactLifecycles.mount
export const unmount = reactLifecycles.unmount
```

### 3.5 使用 System.import 动态加载

```javascript
// 配置 Import Map
<script type="systemjs-importmap">
{
  "imports": {
    "app1": "http://localhost:8081/js/app.js",
    "app2": "http://localhost:8082/js/app.js",
    "navbar": "http://localhost:8083/js/app.js"
  }
}
</script>

// 注册应用时使用
registerApplication({
  name: 'app1',
  app: () => System.import('app1'),
  activeWhen: '/app1'
})
```

### 3.6 应用间通信

```javascript
// 方式 1: 通过 customProps 传递
registerApplication({
  name: 'child',
  app: () => System.import('child'),
  activeWhen: '/child',
  customProps: {
    sharedData: { user: 'admin' },
    emitEvent: (event, data) => console.log(event, data)
  }
})

// 方式 2: 使用自定义事件（跨框架）
// 发布者
window.dispatchEvent(new CustomEvent('user-update', {
  detail: { user: { name: 'John' } }
}))

// 订阅者
window.addEventListener('user-update', (event) => {
  console.log('用户更新:', event.detail.user)
})

// 方式 3: 使用 shared-state 库
import { createStore } from 'shared-state'

const store = createStore({
  id: 'global-store',
  state: { user: null, theme: 'light' }
})

// 任意应用中
store.subscribe((state) => {
  console.log('状态变更:', state)
})
```

## 四、使用场景

### 4.1 大型企业级应用

```
场景：一个包含多个业务模块的管理系统

适用性：⭐⭐⭐⭐⭐

原因：
- 多团队并行开发，独立发布
- 各业务模块可按需升级
- 故障隔离，降低整体风险
```

### 4.2 渐进式重构

```javascript
// 旧系统（jQuery + JSP）需要逐步迁移
// 架构设计

// 阶段 1：保留旧系统，新增微前端区域
registerApplication({
  name: 'legacy-app',      // 旧系统
  activeWhen: '/'
})
registerApplication({
  name: 'new-feature',     // 新功能用 Vue 重写
  activeWhen: '/new-feature'
})

// 阶段 2：逐步迁移各模块
// 旧系统各模块 → 独立微应用

// 阶段 3：全部迁移完成
```

### 4.3 跨团队协作

```
场景：不同技术栈团队共同开发一个大平台

适用性：⭐⭐⭐⭐⭐

团队 A（React 专家）    → 负责首页
团队 B（Vue 专家）      → 负责商品页
团队 C（Angular 专家）  → 负责订单页
```

### 4.4 第三方应用集成

```javascript
// 集成第三方微应用
registerApplication({
  name: 'analytics',
  app: () => System.import('https://cdn.example.com/analytics.js'),
  activeWhen: '/analytics',
  customProps: {
    apiKey: 'your-api-key'
  }
})
```

### 4.5 不适合的场景

| 场景 | 不适用原因 |
|------|-----------|
| 小型项目 | 架构复杂度 > 收益 |
| 对性能要求极高 | 额外的加载开销 |
| 应用间耦合严重 | 微前端解耦成本高 |
| 团队规模小 | 维护成本高 |

## 五、注意事项

### 5.1 CSS 隔离问题

```css
/* 问题：全局样式污染 */

/* 方案 1: CSS Modules */
/* 推荐度：⭐⭐⭐⭐ */
<style scoped>
/* Vue Scoped */
.container { color: red; }
</style>

/* 方案 2: 命名约定 */
/* 推荐度：⭐⭐⭐ */
.app1-header { }    /* 应用前缀 */
.app2-header { }

/* 方案 3: Shadow DOM */
/* 推荐度：⭐⭐⭐⭐⭐ */
// 完全隔离，但有浏览器兼容考虑
class MyElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
}
```

### 5.2 JS 沙箱隔离

```javascript
// single-spa 默认不提供 JS 隔离
// 需要配合其他方案

// 方案 1: 模块化规范（ESM / SystemJS）
// 方案 2: 快照沙箱
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {}
    this.modifyPropsMap = {}
  }

  activate() {
    this.windowSnapshot = {}
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop]
    }
  }

  deactivate() {
    for (const prop in this.modifyPropsMap) {
      window[prop] = this.modifyPropsMap[prop]
    }
  }
}

// 方案 3: 使用 qiankun（自带沙箱）
import { registerMicroApps, start } from 'qiankun'
```

### 5.3 公共依赖管理

```javascript
// 问题：重复加载框架代码，浪费资源

// 方案 1: External 配置
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router']
    }
  }
}

// 方案 2: 模块联邦 (Module Federation)
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      shared: {
        vue: { singleton: true },
        'vue-router': { singleton: true }
      }
    })
  ]
}
```

### 5.4 路由管理

```javascript
// 问题：各应用路由冲突

// 方案 1: 路由前缀区分
registerApplication({
  name: 'app1',
  activeWhen: '/app1'  // 所有路由以 /app1 开头
})

// 方案 2: 使用 Nginx 路径重写
location /app1 {
  try_files $uri $uri/ /app1/index.html;
}

// 方案 3: 统一路由管理
// 创建一个专门的路由应用
```

### 5.5 性能优化

```javascript
// 1. 预加载关键应用
// 在空闲时预加载
window.addEventListener('load', () => {
  setTimeout(() => {
    System.import('app1')  // 预加载
  }, 1000)
})

// 2. 设置超时时间
registerApplication({
  name: 'app1',
  app: () => System.import('app1'),
  activeWhen: '/app1',
  customProps: {},
  customProps: { domElementGetter: () => document.getElementById('app') }
})

// 3. 资源压缩与缓存
// webpack.config.js
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js'
  }
}
```

### 5.6 错误处理

```javascript
// 捕获应用加载错误
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

// single-spa 特定错误
import { addErrorHandler } from 'single-spa'

addErrorHandler((error) => {
  console.error('微应用错误:', error.appOrParcelName, error)

  // 错误降级处理
  if (error.appOrParcelName === 'critical-app') {
    // 显示友好错误页面
    document.getElementById('app').innerHTML = `
      <div class="error-page">
        <h2>应用加载失败</h2>
        <button onclick="location.reload()">重新加载</button>
      </div>
    `
  }
})
```

### 5.7 开发调试

```javascript
// single-spa DevTools
// https://single-spa.js.org/docs/ecosystem/#devtools

// 查看已注册的应用
import { getRegisteredApplications } from 'single-spa'
console.log(getRegisteredApplications())

// 检查应用状态
import { getAppStatus } from 'single-spa'
console.log(getAppStatus('app1'))
// 返回: NOT_LOADED | LOADING_SOURCE_CODE | NOT_BOOTSTRAPPED
//      | BOOTSTRAPPING | NOT_MOUNTED | MOUNTING | MOUNTED
//      | UPDATING | UNLOADING | UNMOUNTING | SKIP_BECAUSE_BROKEN
```

## 六、总结

### 何时选择 single-spa

| 条件 | 评分 |
|------|------|
| 团队规模 > 20 人 | ⭐⭐⭐⭐⭐ |
| 应用模块解耦需求强 | ⭐⭐⭐⭐⭐ |
| 需要技术栈演进 | ⭐⭐⭐⭐⭐ |
| 独立部署需求 | ⭐⭐⭐⭐⭐ |
| 对首屏性能敏感 | ⭐⭐⭐ |
| 团队微前端经验 | ⭐⭐⭐ |

### 学习资源

- [官方文档](https://single-spa.js.org/)
- [single-spa 示例](https://github.com/single-spa/single-spa-examples)
- [中文教程](https://zh.single-spa.js.org/)

### 相关框架对比

| 框架 | 特点 | 推荐指数 |
|------|------|---------|
| **single-spa** | 灵活、原生、生态丰富 | ⭐⭐⭐⭐⭐ |
| **qiankun** | 基于 single-spa，开箱即用、自带沙箱 | ⭐⭐⭐⭐⭐ |
| **Module Federation** | Webpack 原生支持，代码共享方便 | ⭐⭐⭐⭐ |
| **微件模式** | 最简单，隔离性差 | ⭐⭐⭐ |
