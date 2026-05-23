# qiankun 微前端框架

## 一、简介

[qiankun](https://qiankun.umijs.org/) 是阿里开源的**基于 single-spa 的微前端框架**，它解决了 single-spa 使用过程中的痛点，提供了更开箱即用的体验。

### qiankun vs single-spa

| 特性 | single-spa | qiankun |
|------|-----------|---------|
| **JS 沙箱** | 需要自己实现 | ✅ 内置 ProxySandbox |
| **样式隔离** | 需要自己处理 | ✅ Shadow DOM / scoped CSS |
| **预加载** | 手动实现 | ✅ 自动预加载 |
| **HTML Entry** | JS Entry | ✅ HTML Entry（更简单） |
| **全局状态** | 需要自己实现 | ✅ 内置 initGlobalState |
| **使用难度** | 较复杂 | 简单，开箱即用 |

### 核心特性

```
┌─────────────────────────────────────────────────────────────┐
│                      qiankun 架构                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    主应用 (Base)                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │   侧边栏     │  │   Header     │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │              微应用挂载容器                       │  │   │
│  │  │   ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │   │
│  │  │   │ 子应用 A │  │ 子应用 B │  │ 子应用 C │        │  │   │
│  │  │   │  (Vue)  │  │ (React)  │  │(Angular) │        │  │   │
│  │  │   └─────────┘  └─────────┘  └─────────┘        │  │   │
│  │  │                                                    │  │   │
│  │  │              🔁 全局状态管理                       │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  🔐 沙箱隔离：JS 沙箱 | CSS 样式隔离                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、完整实现步骤

从零开始搭建一个包含 Vue 主应用 + Vue 子应用 A + Vue 子应用 B 的微前端项目。

### 2.1 项目结构

```
micro-frontend-project/
├── main-app/              # 主应用（Vue3）
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── sub-app-a/             # Vue3 子应用 A
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── sub-app-b/             # Vue2 子应用 B
│   ├── src/
│   ├── vue.config.js
│   └── package.json
└── README.md
```

### 2.2 第一步：创建 Vue3 主应用

```bash
# 1. 创建 Vue3 主应用
npm create vite@latest main-app -- --template vue
cd main-app

# 2. 安装依赖
npm install
npm install vue-router qiankun

# 3. 启动主应用（默认端口 5173）
npm run dev
```

```typescript
// main-app/src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { registerMicroApps, start, initGlobalState } from 'qiankun'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') }
  ]
})

// 创建 Vue 实例
const app = createApp(App)
app.use(router)
app.mount('#app')

// 初始化全局状态
const actions = initGlobalState({
  user: { name: '游客', id: 0 },
  theme: 'light'
})

// 注册微应用
const microApps = [
  {
    name: 'sub-app-a',
    entry: '//localhost:5174',
    container: '#subapp-container',
    activeRule: '/app-a',
    props: {
      actions,
      routerBase: '/app-a'
    }
  },
  {
    name: 'sub-app-b',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/app-b',
    props: {
      actions,
      routerBase: '/app-b'
    }
  }
]

registerMicroApps(microApps, {
  beforeLoad: (app) => console.log(`[主应用] 加载 ${app.name}`),
  afterMount: (app) => console.log(`[主应用] 挂载完成 ${app.name}`)
})

// 启动 qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
})
```

```vue
<!-- main-app/src/App.vue -->
<template>
  <div class="main-app">
    <header class="header">
      <h1>微前端主应用</h1>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/app-a">子应用 A</router-link>
        <router-link to="/app-b">子应用 B</router-link>
      </nav>
    </header>

    <main class="content">
      <router-view v-if="!isSubApp" />
      <div
        v-show="isSubApp"
        id="subapp-container"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isSubApp = computed(() => {
  return route.path.startsWith('/app-a') || route.path.startsWith('/app-b')
})
</script>

<style scoped>
.main-app { min-height: 100vh; }
.header {
  background: #42b883;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav a {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  padding: 8px 16px;
  border-radius: 4px;
}
.nav a:hover,
.nav a.router-link-active { background: rgba(255,255,255,0.2); }
.content { padding: 40px; }
#subapp-container { min-height: 400px; }
</style>
```

```typescript
// main-app/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173
  }
})
```

### 2.3 第二步：创建 Vue3 子应用 A

```bash
# 1. 创建 Vue3 子应用
npm create vite@latest sub-app-a -- --template vue
cd sub-app-a

# 2. 安装依赖
npm install
npm install vue-router vite-plugin-qiankun

# 3. 启动子应用
npm run dev
```

```typescript
// sub-app-a/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('sub-app-a', {
      useDevMode: true
    })
  ],
  server: {
    port: 5174,
    cors: true,
    origin: 'http://localhost:5174'
  }
})
```

```typescript
// sub-app-a/src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'
import { qiankunWindow, qiankunUnmount } from 'vite-plugin-qiankun/dist/helper'

let app: any
let router: any
let history: any

export async function bootstrap() {
  console.log('[子应用 A] bootstrap')
}

export async function mount(props: any) {
  console.log('[子应用 A] mount', props)

  const { container, routerBase, actions } = props

  // 创建路由
  history = createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__ ? routerBase : '/'
  )

  router = createRouter({
    history,
    routes
  })

  // 监听全局状态
  if (actions) {
    actions.onGlobalStateChange((state: any, prev: any) => {
      console.log('[子应用 A] 状态变化:', state, prev)
      app.config.globalProperties.$globalState = state
    }, true)
  }

  // 创建实例
  app = createApp(App)
  app.use(router)

  const containerElement = container
    ? container.querySelector('#app')
    : document.querySelector('#app')

  app.mount(containerElement)
}

export async function unmount() {
  console.log('[子应用 A] unmount')
  app?.unmount()
  history = null
  router = null
  app = null
}

// 独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  mount({})
}

qiankunUnmount()
```

```typescript
// sub-app-a/src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

export default routes
```

```vue
<!-- sub-app-a/src/App.vue -->
<template>
  <div class="sub-app-a">
    <h2>子应用 A (Vue3)</h2>
    <nav class="sub-nav">
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const globalState = instance?.appContext.config.globalProperties.$globalState
</script>

<style scoped>
.sub-app-a {
  padding: 20px;
  background: #e6f7ff;
  border-radius: 8px;
  border: 2px solid #91d5ff;
}
.sub-nav a {
  margin-right: 15px;
  color: #1890ff;
  text-decoration: none;
}
.sub-nav a.router-link-active {
  font-weight: bold;
}
</style>
```

### 2.4 第三步：创建 Vue2 子应用 B

```bash
# 1. 创建 Vue2 子应用
vue create sub-app-b
# 选择 Vue 2、Vue Router

cd sub-app-b

# 2. 安装依赖
npm install

# 3. 修改配置（见下方）

# 4. 启动子应用
npm run serve
```

```javascript
// sub-app-b/vue.config.js
const { name } = require('./package.json')

module.exports = {
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
}
```

```javascript
// sub-app-b/src/main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'

Vue.use(VueRouter)
Vue.config.productionTip = false

let router = null
let instance = null

export async function bootstrap() {
  console.log('[子应用 B] bootstrap')
}

export async function mount(props) {
  console.log('[子应用 B] mount', props)

  const { container, routerBase, actions } = props

  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : '/',
    mode: 'history',
    routes
  })

  // 监听全局状态
  if (actions) {
    actions.onGlobalStateChange((state, prev) => {
      console.log('[子应用 B] 状态变化:', state, prev)
      Vue.prototype.$globalState = state
    }, true)
  }

  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

export async function unmount() {
  console.log('[子应用 B] unmount')
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}

if (!window.__POWERED_BY_QIANKUN__) {
  mount({})
}
```

```vue
<!-- sub-app-b/src/App.vue -->
<template>
  <div class="sub-app-b">
    <h2>子应用 B (Vue2)</h2>
    <nav class="sub-nav">
      <router-link to="/">首页</router-link>
      <router-link to="/user">用户</router-link>
    </nav>
    <router-view />
    <p>当前用户: {{ $globalState?.user?.name || '未知' }}</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.sub-app-b {
  padding: 20px;
  background: #f6ffed;
  border-radius: 8px;
  border: 2px solid #b7eb8f;
}
.sub-nav a {
  margin-right: 15px;
  color: #52c41a;
  text-decoration: none;
}
.sub-nav a.router-link-active {
  font-weight: bold;
}
</style>
```

### 2.5 第四步：启动测试

```bash
# 终端 1：启动主应用
cd main-app
npm start
# 访问: http://localhost:3000

# 终端 2：启动 Vue 子应用
cd vue-sub-app
npm run serve
# 访问: http://localhost:8081

# 终端 3：启动 React 子应用
cd react-sub-app
npm start
# 访问: http://localhost:8082

# 浏览器访问: http://localhost:3000
# 点击导航切换子应用
```

### 2.6 验证清单

```
✅ 主应用访问 http://localhost:3000 正常显示
✅ 点击 "Vue 子应用"，Vue 应用加载到 #subapp-container
✅ Vue 子应用路由正常切换（/、/about）
✅ 点击 "React 子应用"，Vue 应用卸载，React 应用加载
✅ React 子应用路由正常切换
✅ 全局状态在各应用间同步
✅ 样式隔离，不影响其他应用
```

### 2.7 常见错误处理

| 错误现象 | 原因 | 解决方案 |
|---------|------|---------|
| 子应用加载失败 | 跨域问题 | 检查 CORS 头配置 |
| 样式混乱 | CSS 污染 | 启用 `experimentalStyleIsolation: true` |
| 路由跳转 404 | 路由前缀不匹配 | 确保 `activeRule` 与 `basename` 一致 |
| 状态不更新 | 未监听全局状态 | 检查 `onGlobalStateChange` 调用 |

---

## 三、主应用配置

### 2.1 安装与基础配置

```bash
# 主应用安装 qiankun
npm i qiankun
# 或
yarn add qiankun
```

### 2.2 主应用入口文件

```javascript
// 主应用入口 main.js
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// 渲染主应用
ReactDOM.render(<App />, document.getElementById('root'))

// 定义微应用
const microApps = [
  {
    name: 'vue-app',           // 应用名称
    entry: '//localhost:8081', // 应用入口（HTML 地址）
    container: '#subapp',      // 挂载容器
    activeRule: '/vue',        // 激活规则
    props: {
      // 传递给微应用的数据
      routerBase: '/vue',
      data: { from: '主应用' }
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:8082',
    container: '#subapp',
    activeRule: '/react',
    props: {
      routerBase: '/react',
      token: 'mock-token-123'
    }
  },
  {
    name: 'angular-app',
    entry: '//localhost:8083',
    container: '#subapp',
    activeRule: '/angular',
    props: {
      routerBase: '/angular'
    }
  }
]

// 注册微应用
registerMicroApps(microApps, {
  beforeLoad: [
    app => {
      console.log('%c [qiankun] 准备加载', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    app => {
      console.log('%c [qiankun] 准备挂载', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  afterMount: [
    app => {
      console.log('%c [qiankun] 挂载完成', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  beforeUnmount: [
    app => {
      console.log('%c [qiankun] 准备卸载', 'color: green;', app.name)
      return Promise.resolve()
    }
  ],
  afterUnmount: [
    app => {
      console.log('%c [qiankun] 卸载完成', 'color: green;', app.name)
      return Promise.resolve()
    }
  ]
})

// 启动 qiankun
start({
  prefetch: 'all',        // 预加载策略：all | content | true | false
  sandbox: {
    strictStyleIsolation: false,  // 严格样式隔离（Shadow DOM）
    experimentalStyleIsolation: true  // 实验性样式隔离
  },
  singular: false,         // 是否单实例
  fetch: window.fetch      // 自定义 fetch 方法
})
```

### 2.3 主应用容器组件

```jsx
// 主应用 App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()

  return (
    <div className="main-app">
      <header className="main-header">
        <h1>Qiankun 微前端主应用</h1>
        <nav>
          <Link to="/home">主应用首页</Link>
          <Link to="/vue">Vue 子应用</Link>
          <Link to="/react">React 子应用</Link>
          <Link to="/angular">Angular 子应用</Link>
        </nav>
      </header>

      <main>
        {/* 主应用自己的路由 */}
        <Routes>
          <Route path="/home" element={<div>主应用内容</div>} />
        </Routes>

        {/* 微应用挂载容器 */}
        <div id="subapp" style={{ display: location.pathname.startsWith('/vue') ||
                                       location.pathname.startsWith('/react') ||
                                       location.pathname.startsWith('/angular')
                                       ? 'block' : 'none' }}>
        </div>
      </main>
    </div>
  )
}

export default App
```

### 2.4 动态注册微应用

```javascript
// 动态从接口获取微应用配置并注册
async function loadMicroApps() {
  const apps = await fetch('/api/micro-apps').then(res => res.json())

  apps.forEach(app => {
    registerMicroApps([{
      name: app.name,
      entry: app.entry,
      container: '#subapp',
      activeRule: app.activeRule
    }])
  })

  start()
}
```

---

## 三、子应用配置

### 3.1 Vue 子应用配置

```bash
# 创建 Vue 子应用
vue create vue-sub-app
cd vue-sub-app
```

```javascript
// vue.config.js
const { name } = require('./package.json')

module.exports = {
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*'  // 允许跨域
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,  // 库名称
      libraryTarget: 'umd',       // UMD 格式
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
}
```

```javascript
// src/main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'

Vue.use(VueRouter)

let router = null
let instance = null

// 导出生命周期函数
export async function bootstrap() {
  console.log('[Vue] bootstrap')
}

export async function mount(props) {
  console.log('[Vue] mount', props)

  // 获取主应用传递的 props
  const { container, routerBase, data } = props

  // 创建路由
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : '/',
    mode: 'history',
    routes
  })

  // 创建 Vue 实例
  instance = new Vue({
    router,
    store: props.store, // 可选：使用主应用的状态管理
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')

  // 存储主应用传递的数据
  if (data) {
    Vue.prototype.$mainAppData = data
  }
}

export async function unmount() {
  console.log('[Vue] unmount')
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}

// 独立运行时的逻辑
if (!window.__POWERED_BY_QIANKUN__) {
  mount({})
}
```

```html
<!-- public/index.html -->
<div id="app"></div>
```

### 3.2 React 子应用配置

```bash
# 创建 React 子应用
npx create-react-app react-sub-app
cd react-sub-app
npm install react-router-dom
```

```javascript
// config-overrides.js（使用 react-app-rewired）
const { name } = require('./package.json')

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`
    config.output.libraryTarget = 'umd'
    config.output.jsonpFunction = `webpackJsonp_${name}`
    return config
  },
  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost)
      config.headers = {
        'Access-Control-Allow-Origin': '*'
      }
      return config
    }
  }
}
```

```javascript
// src/index.js
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

let root = null

// 生命周期函数
export async function bootstrap() {
  console.log('[React] bootstrap')
}

export async function mount(props) {
  console.log('[React] mount', props)

  const { container } = props

  root = ReactDOM.createRoot(
    container
      ? container.querySelector('#root')
      : document.querySelector('#root')
  )

  root.render(
    <BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? props.routerBase : '/'}>
      <App {...props} />
    </BrowserRouter>
  )
}

export async function unmount() {
  console.log('[React] unmount')
  if (root) {
    root.unmount()
    root = null
  }
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  mount({})
}
```

### 3.3 Vite + Vue3 子应用配置

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const useDevMode = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue-vite-app', {
      useDevMode
    })
  ],
  server: {
    port: 8081,
    cors: true,
    origin: 'http://localhost:8081'
  }
})
```

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'
import qiankun from 'vite-plugin-qiankun'

let app: any
let router: any
let history: any

export async function bootstrap() {
  console.log('[Vue3] bootstrap')
}

export async function mount(props: any) {
  console.log('[Vue3] mount', props)

  const { container, routerBase } = props

  history = createWebHistory(
    window.__POWERED_BY_QIANKUN__ ? routerBase : '/'
  )

  router = createRouter({
    history,
    routes
  })

  app = createApp(App)
  app.use(router)

  const containerElement = container
    ? container.querySelector('#app')
    : document.querySelector('#app')

  app.mount(containerElement)
}

export async function unmount() {
  app?.unmount()
  history = null
  router = null
  app = null
}

qiankunBootstrap(mount)
```

---

## 四、数据通信方案

qiankun 提供了多种数据通信方式，满足不同场景需求。

### 4.1 全局状态管理（initGlobalState）

qiankun 内置的 `initGlobalState` 是**主应用与子应用通信**的推荐方案。

```javascript
// ==================== 主应用 ====================
// main.js
import { initGlobalState } from 'qiankun'

// 1. 初始化全局状态
const initialState = {
  user: null,
  token: '',
  theme: 'light',
  language: 'zh-CN'
}

// 2. 创建全局状态
const actions = initGlobalState(initialState)

// 3. 主应用监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化', state, prev)
})

// 4. 主应用修改状态
actions.setGlobalState({
  user: { name: 'Admin', id: 1 },
  token: 'new-token-123'
})

// 5. 将 actions 传递给微应用
const microApps = [
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/vue',
    props: {
      actions  // 传递 actions
    }
  }
]
```

```javascript
// ==================== Vue 子应用 ====================
// main.js
export async function mount(props) {
  const { actions, container, routerBase } = props

  // 1. 获取 actions
  if (actions) {
    // 2. 监听全局状态变化
    actions.onGlobalStateChange((state, prev) => {
      console.log('[Vue 子应用] 状态变化', state, prev)

      // 同步到本地状态
      Vue.prototype.$globalState = state
    }, true) // 第二个参数 true 表示立即触发一次

    // 3. 修改全局状态
    // actions.setGlobalState({ theme: 'dark' })
  }

  // 创建 Vue 实例...
}
```

```javascript
// ==================== React 子应用 ====================
// src/App.jsx
import { useEffect, useState } from 'react'

function App(props) {
  const [globalState, setGlobalState] = useState({})
  const { actions } = props

  useEffect(() => {
    if (actions) {
      // 监听状态变化
      const unlisten = actions.onGlobalStateChange((state, prev) => {
        console.log('[React 子应用] 状态变化', state, prev)
        setGlobalState(state)
      }, true)

      return () => {
        // 组件卸载时取消监听
        // 注意：qiankun 的 onGlobalStateChange 没有返回 unlisten 函数
        // 需要自己管理
      }
    }
  }, [actions])

  // 修改全局状态
  const updateTheme = () => {
    actions.setGlobalState({ theme: 'dark' })
  }

  return (
    <div>
      <h1>React 子应用</h1>
      <p>用户: {globalState.user?.name}</p>
      <button onClick={updateTheme}>切换主题</button>
    </div>
  )
}

export default App
```

### 4.2 props 传递（主应用 → 子应用）

```javascript
// ==================== 主应用 ====================
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/vue',
    props: {
      // 1. 静态数据
      title: 'Vue 子应用',
      version: '1.0.0',

      // 2. 动态数据
      config: {
        apiUrl: '/api',
        timeout: 5000
      },

      // 3. 函数（回调）
      onEvent: (event, data) => {
        console.log('子应用事件:', event, data)
      },

      // 4. 共享服务
      apiService: {
        request: (url) => fetch(url).then(r => r.json())
      },

      // 5. 全局状态
      actions
    }
  }
])
```

```javascript
// ==================== Vue 子应用 ====================
// main.js
export async function mount(props) {
  const { title, config, onEvent, apiService } = props

  console.log('主应用传递的标题:', title)
  console.log('主应用传递的配置:', config)

  // 调用主应用传递的函数
  onEvent('mounted', { time: Date.now() })

  // 使用共享服务
  apiService.request('/api/user').then(data => {
    console.log('用户数据:', data)
  })
}
```

### 4.3 自定义事件（子应用 ↔ 子应用）

**跨子应用通信**通过自定义事件实现，qiankun 官方推荐这种方式。

```javascript
// ==================== 事件总线工具 ====================
// eventBus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  // 发布事件
  emit(event, data) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(data))
  }
}

// 创建全局事件总线（挂载到 window，确保所有应用可访问）
if (!window.__QIANKUN_EVENT_BUS__) {
  window.__QIANKUN_EVENT_BUS__ = new EventBus()
}

export default window.__QIANKUN_EVENT_BUS__
```

```javascript
// ==================== Vue 子应用 A（发布者）====================
// main.js
import EventBus from '@/utils/eventBus'

export async function mount(props) {
  // ...

  // 在某个操作后发布事件
  const updateUserInfo = () => {
    EventBus.emit('user:updated', {
      user: { name: '张三', id: 1 },
      timestamp: Date.now()
    })
  }

  Vue.prototype.$eventBus = EventBus
}
```

```javascript
// ==================== React 子应用 B（订阅者）====================
// App.jsx
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // 订阅事件
    const handleUserUpdate = (data) => {
      console.log('[React] 收到用户更新:', data)
      // 更新本地状态...
    }

    window.__QIANKUN_EVENT_BUS__?.on('user:updated', handleUserUpdate)

    return () => {
      // 组件卸载时取消订阅
      window.__QIANKUN_EVENT_BUS__?.off('user:updated', handleUserUpdate)
    }
  }, [])

  return <div>React 子应用</div>
}
```

### 4.4 LocalStorage / SessionStorage

```javascript
// ==================== 任何应用都可以读写 ====================

// 写入
localStorage.setItem('micro-fe:user', JSON.stringify({
  name: '张三',
  id: 1
}))

// 读取
const user = JSON.parse(localStorage.getItem('micro-fe:user'))

// 监听变化（同源）
window.addEventListener('storage', (e) => {
  if (e.key === 'micro-fe:user') {
    console.log('用户数据变化:', JSON.parse(e.newValue))
  }
})
```

> ⚠️ 注意：storage 事件只在**其他标签页**触发，同页面的变化不会触发。

### 4.5 父子通信（自定义 Hook）

```javascript
// ==================== 主应用 ====================
// 主应用通过 ref 调用子应用方法

// App.jsx
import { useRef } from 'react'

function App() {
  const microAppRef = useRef(null)

  const callMicroApp = () => {
    // 调用子应用暴露的方法
    microAppRef.current?.getData()
  }

  return (
    <div>
      <button onClick={callMicroApp}>调用子应用方法</button>
      <div ref={microAppRef} id="subapp"></div>
    </div>
  )
}
```

```javascript
// ==================== 子应用 ====================
// 子应用将方法挂载到 window

export async function mount(props) {
  const instance = new Vue({
    // ...
    methods: {
      getData() {
        return { data: 'from child' }
      }
    }
  }).$mount('#app')

  // 暴露方法给主应用
  window.__MICRO_APP_INSTANCE__ = instance
}
```

### 4.6 完整通信示例

```javascript
// ==================== 主应用 ====================
// main.js
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import EventBus from './utils/eventBus'

// 1. 初始化全局状态
const actions = initGlobalState({
  user: { name: 'Admin', role: 'admin' },
  theme: 'light',
  language: 'zh-CN'
})

// 2. 主应用监听并处理状态
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态:', state)
  document.documentElement.setAttribute('data-theme', state.theme)

  // 广播给所有订阅者
  EventBus.emit('global:state:changed', state)
})

// 3. 注册微应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      actions,
      eventBus: EventBus,
      // 共享服务
      api: {
        getUser: () => Promise.resolve({ name: 'Admin', id: 1 })
      }
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:8082',
    container: '#subapp-viewport',
    activeRule: '/react',
    props: {
      actions,
      eventBus: EventBus
    }
  }
])

start()
```

```javascript
// ==================== Vue 子应用 ====================
// main.js
export async function mount(props) {
  const { actions, eventBus, api } = props

  // 1. 监听全局状态
  actions.onGlobalStateChange((state, prev) => {
    console.log('[Vue] 全局状态变化:', state)
    Vue.prototype.$user = state.user
  }, true)

  // 2. 订阅事件总线
  eventBus.on('global:state:changed', (state) => {
    console.log('[Vue] 收到全局状态变更事件:', state)
  })

  // 3. 使用共享服务
  api.getUser().then(user => {
    console.log('[Vue] 获取用户:', user)
  })

  // 4. 在某个操作中修改全局状态
  Vue.prototype.$updateTheme = (theme) => {
    actions.setGlobalState({ theme })

    // 同时发布事件
    eventBus.emit('theme:changed', theme)
  }
}
```

```javascript
// ==================== React 子应用 ====================
// src/App.jsx
import { useEffect, useState } from 'react'

function App(props) {
  const { actions, eventBus } = props
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // 1. 监听全局状态
    actions.onGlobalStateChange((state, prev) => {
      console.log('[React] 全局状态变化:', state)
      setTheme(state.theme)
    }, true)

    // 2. 订阅事件总线
    const handleThemeChange = (newTheme) => {
      console.log('[React] 主题变更事件:', newTheme)
      setTheme(newTheme)
    }

    eventBus.on('theme:changed', handleThemeChange)

    return () => {
      eventBus.off('theme:changed', handleThemeChange)
    }
  }, [actions, eventBus])

  const handleUpdateUser = () => {
    // 修改全局状态，通知所有子应用
    actions.setGlobalState({
      user: { name: '张三', id: 2 }
    })
  }

  return (
    <div className={`theme-${theme}`}>
      <h1>React 子应用</h1>
      <p>当前主题: {theme}</p>
      <button onClick={handleUpdateUser}>更新用户信息</button>
    </div>
  )
}

export default App
```

---

## 五、通信方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **initGlobalState** | 主应用 ↔ 子应用 | 官方推荐，API 简单 | 子应用之间通信需通过主应用转发 |
| **props 传递** | 主应用 → 子应用 | 单向数据流，清晰 | 只能主传子，不能反向 |
| **自定义事件** | 子应用 ↔ 子应用 | 解耦，任意应用间通信 | 需要自己实现事件总线 |
| **LocalStorage** | 持久化数据 | 简单，支持跨标签页 | 同步存储，性能较差 |
| **window 对象** | 快速原型 | 最简单 | 污染全局，不推荐 |

### 推荐方案组合

```
┌─────────────────────────────────────────────────────────┐
│                    通信架构建议                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  主应用 ◄──────────────► initGlobalState ◄──────────► 子应用
│  ↓                           ↑                          │
│  │                     (状态管理)                        │
│  │                           │                          │
│  └─────────── EventBus (事件总线) ◄────────────────────┘
│                  ↓        ↓
│              子应用 A  子应用 B  (子应用间通信)
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 六、常见问题

### 6.1 路由冲突

```javascript
// 解决方案：各应用使用不同的路由前缀

// 主应用：/main/*
// Vue 子应用：/vue/*
// React 子应用：/react/*
```

### 6.2 样式污染

```javascript
// 启用 qiankun 的样式隔离
start({
  sandbox: {
    experimentalStyleIsolation: true  // 自动添加 CSS 选择器前缀
  }
})
```

### 6.3 全局变量冲突

qiankun 的 ProxySandbox 会自动隔离全局变量，但某些特殊情况需要注意：

```javascript
// 子应用中避免直接修改 window
// 错误写法
window.myVar = 123  // 会被隔离

// 正确写法（需要跨应用共享时）
// 通过全局状态或事件总线
```

### 6.4 开发环境跨域

```javascript
// vue.config.js / webpack.config.js
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

---

## 七、参考资源

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [qiankun GitHub](https://github.com/umijs/qiankun)
- [微前端实践](https://micro-frontends.org/)
