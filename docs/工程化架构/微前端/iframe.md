# iframe 微前端方案

## 一、iframe 与微前端的关系

### 1.1 核心关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        微前端架构方案对比                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  运行时集成                    编译时集成              路由分发       │
│  ┌──────────────────┐        ┌──────────────────┐    ┌──────────┐  │
│  │ • qiankun        │        │ • 模块联邦        │    │ • iframe ⭐│  │
│  │ • single-spa     │        │ • Monorepo       │    │          │  │
│  └──────────────────┘        └──────────────────┘    └──────────┘  │
│                                      ▲                   ▲          │
│                                      │                   │          │
│                         复杂度 ◄────────────────────► 简单度       │
│                         控制力 ◄────────────────────► 隔离性       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 iframe 在微前端中的定位

**iframe** 是浏览器原生提供的嵌入方案，是最简单、最古老但也最可靠的微前端实现方式。

| 特性 | iframe | qiankun | 模块联邦 |
|------|--------|---------|----------|
| **实现复杂度** | ⭐️ 极简 | ⭐️⭐️⭐️ 中等 | ⭐️⭐️ 较低 |
| **隔离性** | ⭐️⭐️⭐️⭐️⭐️ 完全隔离 | ⭐️⭐️⭐️ 沙箱隔离 | ⭐️⭐️ 作用域隔离 |
| **通信方式** | postMessage | props/全局变量 | 直接调用 |
| **技术栈限制** | 无 | 需协议统一 | 无 |
| **SEO 友好** | ❌ 差 | ✅ 好 | ✅ 好 |
| **加载性能** | ❌ 较慢 | ✅ 好 | ✅ 好 |
| **适用场景** | 跨域集成、旧系统 | 现代微前端 | 模块共享 |

### 1.3 iframe 的优缺点

```
┌─────────────────────────────────────────────────────────────────────┐
│                          iframe 方案                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ 优点                          ❌ 缺点                           │
│  ─────────────────────────────────────────────────────────────────  │
│  • 天然的 JS/CSS 隔离               • 页面加载性能差               │
│  • 完全的样式隔离（无冲突）         • 重复加载公共依赖             │
│  • 技术栈完全无关                  • 弹窗/遮罩层处理复杂           │
│  • 浏览器原生支持，无需框架        • 跨域通信受限                 │
│  • 安全沙箱保护                    • URL 不同步，刷新问题          │
│  • 适合跨系统整合                  • 无法共享状态/路由             │
│  • 旧系统改造成本低                • 移动端体验差                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、iframe 工作原理

### 2.1 基本概念

```html
<!-- iframe 基本语法 -->
<iframe
  src="https://subapp.example.com"
  id="micro-app-iframe"
  name="microApp"
  width="100%"
  height="100%"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>
```

**关键属性说明：**

| 属性 | 说明 | 推荐值 |
|------|------|--------|
| `src` | 子应用 URL | 绝对路径 |
| `sandbox` | 安全沙箱限制 | 按需配置 |
| `allow` | 权限策略（新标准） | 按需配置 |
| `loading` | 加载方式 | `lazy` 延迟加载 |
| `referrerpolicy` | 引用策略 | `strict-origin-when-cross-origin` |

### 2.2 通信机制

```javascript
// 父页面 → iframe
iframe.contentWindow.postMessage(data, origin)

// iframe → 父页面
window.parent.postMessage(data, origin)

// iframe → 同级 iframe
window.parent.frames['other-iframe'].postMessage(data, origin)
```

**通信流程图：**

```
┌─────────────────────────────────────────────────────────────────────┐
│                      iframe 通信流程                                 │
└─────────────────────────────────────────────────────────────────────┘

  父页面 (Main App)                    iframe (Sub App)
  ┌─────────────────────┐              ┌─────────────────────┐
  │                     │              │                     │
  │  const iframe =     │              │  window.parent.     │
  │    document.        │ ──────►     │    postMessage()    │
  │    getElementById() │              │                     │
  │                     │              │                     │
  │  iframe.            │              │  window.addEventListener│
  │    contentWindow.   │ ◄─────     │    ('message')      │
  │    postMessage()    │              │                     │
  │                     │              │                     │
  │  window.addEventListener│              │                     │
  │    ('message')      │              │                     │
  │                     │              │                     │
  └─────────────────────┘              └─────────────────────┘
         │                                     │
         │                                     │
         └──────────────┬──────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   Message Event     │
              │                     │
              │  {                  │
              │    data: {},        │
              │    origin: "https://",│
              │    source: window   │
              │  }                  │
              └─────────────────────┘
```

---

## 三、基础实现方案

### 3.1 项目结构

```
iframe-micro-frontend/
├── main-app/              # 主应用（基座）
│   ├── src/
│   │   ├── App.vue
│   │   ├── components/
│   │   │   ├── IframeWrapper.vue    # iframe 封装组件
│   │   │   └── MicroAppLoader.vue   # 微应用加载器
│   │   ├── utils/
│   │   │   └── messageBus.ts        # 消息总线
│   │   └── main.ts
│   └── package.json
│
├── sub-app-vue/           # Vue 子应用
│   ├── src/
│   │   ├── App.vue
│   │   ├── utils/
│   │   │   └── messageClient.ts     # 消息客户端
│   │   └── main.ts
│   └── package.json
│
└── sub-app-react/         # React 子应用
    ├── src/
    │   ├── App.tsx
    │   ├── utils/
    │   │   └── messageClient.ts
    │   └── main.tsx
    └── package.json
```

### 3.2 主应用实现

#### 3.2.1 iframe 封装组件

```vue
<!-- main-app/src/components/IframeWrapper.vue -->
<template>
  <div class="iframe-wrapper" :class="{ 'iframe-wrapper--full': fullscreen }">
    <div v-if="showLoading" class="iframe-wrapper__loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-if="showError" class="iframe-wrapper__error">
      <h4>应用加载失败</h4>
      <p>{{ errorMessage }}</p>
      <button @click="retry">重试</button>
    </div>

    <iframe
      v-show="!showLoading && !showError"
      ref="iframeRef"
      :src="iframeSrc"
      :title="title"
      :name="name"
      :sandbox="sandbox"
      :allow="allow"
      @load="handleLoad"
      @error="handleError"
    ></iframe>

    <div v-if="!fullscreen" class="iframe-wrapper__actions">
      <button @click="toggleFullscreen" :disabled="!loaded">
        {{ fullscreen ? '退出全屏' : '全屏' }}
      </button>
      <button @click="refresh" :disabled="!loaded">刷新</button>
      <button @click="reload" :disabled="!loaded">重新加载</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  src: string
  title?: string
  name?: string
  sandbox?: string
  allow?: string
  timeout?: number
  autoResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Micro App',
  name: 'micro-app',
  sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups',
  timeout: 30000,
  autoResize: false
})

const emit = defineEmits<{
  load: []
  error: [error: Error]
  message: [data: any]
  ready: []
}>()

const iframeRef = ref<HTMLIFrameElement>()
const showLoading = ref(true)
const showError = ref(false)
const errorMessage = ref('')
const loaded = ref(false)
const fullscreen = ref(false)

// 动态 src，支持添加时间戳避免缓存
const iframeSrc = computed(() => {
  const url = new URL(props.src)
  url.searchParams.set('_t', Date.now().toString())
  return url.toString()
})

// 加载超时处理
let timer: NodeJS.Timeout | null = null

const startTimer = () => {
  timer = setTimeout(() => {
    if (!loaded.value) {
      showError.value = true
      errorMessage.value = '加载超时，请检查网络连接'
      showLoading.value = false
      emit('error', new Error('Load timeout'))
    }
  }, props.timeout)
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// iframe 加载完成
const handleLoad = () => {
  clearTimer()
  loaded.value = true
  showLoading.value = false
  showError.value = false

  // 等待 iframe 内部初始化
  setTimeout(() => {
    emit('load')
    emit('ready')
  }, 100)
}

// 加载错误
const handleError = (e: Event) => {
  clearTimer()
  showError.value = true
  errorMessage.value = '应用加载失败'
  showLoading.value = false
  emit('error', new Error('Failed to load iframe'))
}

// 重试
const retry = () => {
  showError.value = false
  showLoading.value = true
  loaded.value = false
  refresh()
}

// 刷新（重新加载当前 URL）
const refresh = () => {
  if (iframeRef.value) {
    iframeRef.value.src = iframeRef.value.src
  }
}

// 重新加载（清除缓存）
const reload = () => {
  loaded.value = false
  showLoading.value = true
  refresh()
}

// 全屏切换
const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
}

// 发送消息到 iframe
const postMessage = (data: any, origin?: string) => {
  if (iframeRef.value?.contentWindow) {
    iframeRef.value.contentWindow.postMessage(data, origin || '*')
  }
}

// 监听来自 iframe 的消息
const handleMessage = (event: MessageEvent) => {
  // 验证来源
  const allowedOrigins = [
    new URL(props.src).origin,
    'http://localhost:5173',
    'http://localhost:5174'
  ]

  if (!allowedOrigins.includes(event.origin)) {
    return
  }

  emit('message', event.data)
}

// 自动调整高度
const adjustHeight = () => {
  if (!props.autoResize || !iframeRef.value) return

  postMessage({ type: 'REQUEST_HEIGHT' })
  const handleHeightMessage = (event: MessageEvent) => {
    if (event.data.type === 'RESPONSE_HEIGHT') {
      iframeRef.value!.style.height = `${event.data.height}px`
    }
  }

  window.addEventListener('message', handleHeightMessage)

  onUnmounted(() => {
    window.removeEventListener('message', handleHeightMessage)
  })
}

onMounted(() => {
  startTimer()
  window.addEventListener('message', handleMessage)
  if (props.autoResize) {
    adjustHeight()
  }
})

onUnmounted(() => {
  clearTimer()
  window.removeEventListener('message', handleMessage)
})

// 暴露方法给父组件
defineExpose({
  postMessage,
  refresh,
  reload,
  iframeRef
})

// 监听 src 变化
watch(() => props.src, () => {
  loaded.value = false
  showLoading.value = true
  showError.value = false
  startTimer()
})
</script>

<style scoped>
.iframe-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.iframe-wrapper--full {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.iframe-wrapper__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.iframe-wrapper__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  color: #c53030;
  gap: 12px;
}

.iframe-wrapper__error button {
  padding: 8px 16px;
  background: #c53030;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.iframe-wrapper__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.iframe-wrapper__actions button {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.iframe-wrapper__actions button:hover {
  background: rgba(0, 0, 0, 0.9);
}

.iframe-wrapper__actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

#### 3.2.2 消息总线

```typescript
// main-app/src/utils/messageBus.ts
type MessageHandler = (data: any) => void

type MessageConfig = {
  handler: MessageHandler
  once?: boolean
}

class MessageBus {
  private handlers = new Map<string, MessageConfig[]>()

  /**
   * 监听消息
   */
  on(event: string, handler: MessageHandler) {
    const configs = this.handlers.get(event) || []
    configs.push({ handler })
    this.handlers.set(event, configs)
  }

  /**
   * 监听一次消息
   */
  once(event: string, handler: MessageHandler) {
    const configs = this.handlers.get(event) || []
    configs.push({ handler, once: true })
    this.handlers.set(event, configs)
  }

  /**
   * 取消监听
   */
  off(event: string, handler?: MessageHandler) {
    if (!handler) {
      this.handlers.delete(event)
      return
    }

    const configs = this.handlers.get(event) || []
    const filtered = configs.filter(c => c.handler !== handler)
    this.handlers.set(event, filtered)
  }

  /**
   * 发送消息到所有监听者
   */
  emit(event: string, data?: any) {
    const configs = this.handlers.get(event) || []

    configs.forEach((config, index) => {
      config.handler(data)

      if (config.once) {
        configs.splice(index, 1)
      }
    })
  }

  /**
   * 清除所有监听
   */
  clear() {
    this.handlers.clear()
  }
}

// 全局消息总线实例
export const messageBus = new MessageBus()

/**
 * iframe 通信辅助类
 */
export class IframeMessenger {
  private target: Window
  private targetOrigin: string
  private listeners = new Map<string, MessageHandler>()

  constructor(private iframe: HTMLIFrameElement) {
    this.target = iframe.contentWindow!
    this.targetOrigin = new URL(iframe.src).origin
    this.initMessageListener()
  }

  /**
   * 发送消息到 iframe
   */
  send(type: string, data?: any) {
    this.target.postMessage({ type, data }, this.targetOrigin)
  }

  /**
   * 监听来自 iframe 的消息
   */
  on(type: string, handler: MessageHandler) {
    this.listeners.set(type, handler)
  }

  /**
   * 取消监听
   */
  off(type: string) {
    this.listeners.delete(type)
  }

  private initMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.origin !== this.targetOrigin) return
      if (event.source !== this.target) return

      const { type, data } = event.data
      const handler = this.listeners.get(type)
      if (handler) {
        handler(data)
      }
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.listeners.clear()
  }
}
```

#### 3.2.3 微应用加载器

```vue
<!-- main-app/src/components/MicroAppLoader.vue -->
<template>
  <div class="micro-app-loader">
    <div class="micro-app-loader__tabs">
      <button
        v-for="app in apps"
        :key="app.name"
        :class="[
          'micro-app-loader__tab',
          { 'micro-app-loader__tab--active': currentApp === app.name }
        ]"
        @click="switchApp(app)"
      >
        {{ app.title }}
        <span v-if="app.loading" class="loading-dot"></span>
      </button>
    </div>

    <div class="micro-app-loader__content">
      <IframeWrapper
        v-if="currentAppConfig"
        :key="currentApp"
        :src="currentAppConfig.src"
        :title="currentAppConfig.title"
        :name="currentApp"
        :auto-resize="currentAppConfig.autoResize"
        @ready="handleAppReady"
        @message="handleAppMessage"
        ref="iframeWrapperRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IframeWrapper from './IframeWrapper.vue'

interface MicroAppConfig {
  name: string
  title: string
  src: string
  autoResize?: boolean
  loading?: boolean
}

const props = defineProps<{
  apps: MicroAppConfig[]
}>()

const emit = defineEmits<{
  switch: [app: MicroAppConfig]
  message: [from: string, data: any]
}>()

const currentApp = ref<string>(props.apps[0]?.name || '')
const iframeWrapperRef = ref<InstanceType<typeof IframeWrapper>>()

const currentAppConfig = computed(() => {
  return props.apps.find(app => app.name === currentApp.value)
})

const switchApp = (app: MicroAppConfig) => {
  currentApp.value = app.name
  emit('switch', app)
}

const handleAppReady = () => {
  console.log(`App ${currentApp.value} is ready`)

  // 发送初始化数据
  iframeWrapperRef.value?.postMessage({
    type: 'INIT',
    data: {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      theme: 'light'
    }
  })
}

const handleAppMessage = (data: any) => {
  console.log(`Message from ${currentApp.value}:`, data)
  emit('message', currentApp.value, data)

  // 处理特定消息类型
  switch (data.type) {
    case 'NAVIGATE':
      // 处理路由跳转
      console.log('Navigate to:', data.path)
      break
    case 'LOGOUT':
      // 处理登出
      console.log('Logout')
      break
    case 'UPDATE_TITLE':
      document.title = data.title
      break
  }
}

// 暴露方法供外部调用
defineExpose({
  switchApp,
  sendMessage: (type: string, data?: any) => {
    iframeWrapperRef.value?.postMessage({ type, data })
  }
})
</script>

<style scoped>
.micro-app-loader {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.micro-app-loader__tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.micro-app-loader__tab {
  position: relative;
  padding: 8px 16px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.micro-app-loader__tab--active {
  background: #42b883;
  color: white;
}

.micro-app-loader__tab:hover {
  background: #e0e0e0;
}

.micro-app-loader__tab--active:hover {
  background: #36a870;
}

.loading-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.micro-app-loader__content {
  flex: 1;
  overflow: hidden;
}
</style>
```

#### 3.2.4 主应用入口

```vue
<!-- main-app/src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <h1>微前端基座应用</h1>
      <div class="user-info">
        <span>{{ user?.name }}</span>
        <button @click="logout">退出</button>
      </div>
    </header>

    <MicroAppLoader
      ref="microAppLoaderRef"
      :apps="microApps"
      @switch="handleAppSwitch"
      @message="handleMicroAppMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MicroAppLoader from './components/MicroAppLoader.vue'

interface MicroApp {
  name: string
  title: string
  src: string
  autoResize?: boolean
  loading?: boolean
}

const user = ref({ name: '张三', role: 'admin' })

const microApps = ref<MicroApp[]>([
  {
    name: 'vue-app',
    title: 'Vue 子应用',
    src: 'http://localhost:5173',
    autoResize: true
  },
  {
    name: 'react-app',
    title: 'React 子应用',
    src: 'http://localhost:5174',
    autoResize: true
  }
])

const microAppLoaderRef = ref<InstanceType<typeof MicroAppLoader>>()

const handleAppSwitch = (app: MicroApp) => {
  console.log('Switched to:', app.name)
}

const handleMicroAppMessage = (from: string, data: any) => {
  console.log(`Received from ${from}:`, data)

  // 响应子应用请求
  if (data.type === 'GET_USER_INFO') {
    microAppLoaderRef.value?.sendMessage('USER_INFO_RESPONSE', user.value)
  }
}

const logout = () => {
  // 通知所有子应用登出
  microApps.value.forEach(app => {
    microAppLoaderRef.value?.sendMessage('LOGOUT')
  })
  // 清除登录状态
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #42b883;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info button {
  padding: 6px 12px;
  border: 1px solid white;
  background: transparent;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.user-info button:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
```

### 3.3 子应用实现

#### 3.3.1 Vue 子应用消息客户端

```typescript
// sub-app-vue/src/utils/messageClient.ts
type MessageHandler = (data: any) => void
type MessageHandlerMap = Map<string, MessageHandler>

export class MessageClient {
  private handlers: MessageHandlerMap = new Map()
  private parentOrigin: string

  constructor() {
    // 从 URL 获取父应用来源
    this.parentOrigin = new URL(document.referrer).origin || '*'
    this.init()
  }

  private init() {
    window.addEventListener('message', this.handleMessage)
  }

  private handleMessage = (event: MessageEvent) => {
    // 验证来源
    if (this.parentOrigin !== '*' && event.origin !== this.parentOrigin) {
      return
    }

    const { type, data } = event.data

    // 调用对应的处理器
    const handler = this.handlers.get(type)
    if (handler) {
      handler(data)
    }
  }

  /**
   * 发送消息到父应用
   */
  send(type: string, data?: any) {
    window.parent.postMessage({ type, data }, this.parentOrigin)
  }

  /**
   * 监听来自父应用的消息
   */
  on(type: string, handler: MessageHandler) {
    this.handlers.set(type, handler)
    return () => this.off(type)
  }

  /**
   * 取消监听
   */
  off(type: string) {
    this.handlers.delete(type)
  }

  /**
   * 监听一次
   */
  once(type: string, handler: MessageHandler) {
    const onceHandler = (data: any) => {
      handler(data)
      this.off(type)
    }
    this.on(type, onceHandler)
  }

  /**
   * 销毁
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage)
    this.handlers.clear()
  }
}

// 创建全局实例
export const messageClient = new MessageClient()

// Vue 插件形式
import type { App } from 'vue'

export const MessageClientPlugin = {
  install(app: App) {
    app.config.globalProperties.$messageClient = messageClient
    app.provide('messageClient', messageClient)
  }
}
```

#### 3.3.2 Vue 子应用入口

```vue
<!-- sub-app-vue/src/App.vue -->
<template>
  <div class="sub-app">
    <div class="sub-app__header">
      <h2>Vue 子应用</h2>
      <div class="status-indicator" :class="{ connected }">
        {{ connected ? '已连接' : '未连接' }}
      </div>
    </div>

    <div class="sub-app__content">
      <button @click="sendTestMessage">发送测试消息</button>
      <button @click="requestUserInfo">获取用户信息</button>
      <button @click="updateParentTitle">更新父应用标题</button>
    </div>

    <div class="sub-app__messages">
      <h3>收到的消息：</h3>
      <ul>
        <li v-for="(msg, index) in messages" :key="index">
          <strong>{{ msg.type }}</strong>: {{ JSON.stringify(msg.data) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { messageClient } from './utils/messageClient'

const connected = ref(false)
const messages = ref<Array<{ type: string; data: any }>>([])

const addMessage = (type: string, data: any) => {
  messages.value.unshift({ type, data })
  // 限制消息数量
  if (messages.value.length > 50) {
    messages.value = messages.value.slice(0, 50)
  }
}

// 发送测试消息
const sendTestMessage = () => {
  messageClient.send('TEST', {
    text: 'Hello from Vue sub app!',
    timestamp: Date.now()
  })
  addMessage('TEST', { direction: 'sent', text: 'Hello from Vue sub app!' })
}

// 请求用户信息
const requestUserInfo = () => {
  messageClient.send('GET_USER_INFO')
  addMessage('GET_USER_INFO', { direction: 'sent' })
}

// 更新父应用标题
const updateParentTitle = () => {
  messageClient.send('UPDATE_TITLE', {
    title: 'Vue 子应用 - ' + new Date().toLocaleTimeString()
  })
  addMessage('UPDATE_TITLE', { direction: 'sent' })
}

// 监听来自父应用的消息
const unregisterHandlers: Array<() => void> = []

onMounted(() => {
  // 监听初始化消息
  unregisterHandlers.push(
    messageClient.on('INIT', (data) => {
      console.log('Received init data:', data)
      connected.value = true
      addMessage('INIT', data)

      // 通知父应用准备就绪
      messageClient.send('READY', {
        app: 'vue-app',
        timestamp: Date.now()
      })

      // 响应高度请求（用于自动调整 iframe 高度）
      messageClient.on('REQUEST_HEIGHT', () => {
        const height = document.documentElement.scrollHeight
        messageClient.send('RESPONSE_HEIGHT', { height })
      })
    })
  )

  // 监听登出
  unregisterHandlers.push(
    messageClient.on('LOGOUT', () => {
      console.log('Logout received')
      addMessage('LOGOUT', {})
      // 执行登出逻辑
      localStorage.clear()
    })
  )

  // 通知父应用已加载
  messageClient.send('MOUNTED', {
    app: 'vue-app',
    url: window.location.href
  })
})

onUnmounted(() => {
  // 清理所有监听器
  unregisterHandlers.forEach(unregister => unregister())
  messageClient.destroy()
})
</script>

<style scoped>
.sub-app {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.sub-app__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #42b883;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #e0e0e0;
  color: #666;
}

.status-indicator.connected {
  background: #42b883;
  color: white;
}

.sub-app__content {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.sub-app__content button {
  padding: 8px 16px;
  border: 1px solid #42b883;
  background: white;
  color: #42b883;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-app__content button:hover {
  background: #42b883;
  color: white;
}

.sub-app__messages {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.sub-app__messages h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.sub-app__messages ul {
  list-style: none;
}

.sub-app__messages li {
  padding: 8px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
}
</style>
```

#### 3.3.3 React 子应用消息客户端

```typescript
// sub-app-react/src/utils/messageClient.ts
type MessageHandler = (data: any) => void
type MessageListener = {
  handler: MessageHandler
  once: boolean
}

class MessageClient {
  private listeners = new Map<string, MessageListener[]>()
  private parentOrigin: string

  constructor() {
    this.parentOrigin = new URL(document.referrer).origin || '*'
    this.init()
  }

  private init() {
    window.addEventListener('message', this.handleMessage)
  }

  private handleMessage = (event: MessageEvent) => {
    if (this.parentOrigin !== '*' && event.origin !== this.parentOrigin) {
      return
    }

    const { type, data } = event.data
    const listeners = this.listeners.get(type) || []

    // 过滤掉 once 为 true 的监听器
    this.listeners.set(
      type,
      listeners.filter((l) => {
        if (l.once) {
          l.handler(data)
          return false
        }
        l.handler(data)
        return true
      })
    )
  }

  send(type: string, data?: any) {
    window.parent.postMessage({ type, data }, this.parentOrigin)
  }

  on(type: string, handler: MessageHandler): () => void {
    const listeners = this.listeners.get(type) || []
    listeners.push({ handler, once: false })
    this.listeners.set(type, listeners)

    return () => this.off(type, handler)
  }

  off(type: string, handler?: MessageHandler) {
    if (!handler) {
      this.listeners.delete(type)
      return
    }

    const listeners = (this.listeners.get(type) || []).filter(
      (l) => l.handler !== handler
    )
    this.listeners.set(type, listeners)
  }

  once(type: string, handler: MessageHandler) {
    const listeners = this.listeners.get(type) || []
    listeners.push({ handler, once: true })
    this.listeners.set(type, listeners)
  }

  destroy() {
    window.removeEventListener('message', this.handleMessage)
    this.listeners.clear()
  }
}

export const messageClient = new MessageClient()

// React Hook
export const useMessageClient = () => {
  return {
    send: messageClient.send.bind(messageClient),
    on: messageClient.on.bind(messageClient),
    off: messageClient.off.bind(messageClient),
    once: messageClient.once.bind(messageClient)
  }
}
```

#### 3.3.4 React 子应用入口

```tsx
// sub-app-react/src/App.tsx
import { useState, useEffect, useCallback } from 'react'
import { useMessageClient } from './utils/messageClient'

interface Message {
  type: string
  data: any
}

function App() {
  const { send, on } = useMessageClient()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = useCallback((type: string, data: any) => {
    setMessages(prev => [{ type, data }, ...prev].slice(0, 50))
  }, [])

  // 发送测试消息
  const sendTestMessage = () => {
    send('TEST', {
      text: 'Hello from React sub app!',
      timestamp: Date.now()
    })
    addMessage('TEST', { direction: 'sent', text: 'Hello from React sub app!' })
  }

  // 请求用户信息
  const requestUserInfo = () => {
    send('GET_USER_INFO')
    addMessage('GET_USER_INFO', { direction: 'sent' })
  }

  // 更新父应用标题
  const updateParentTitle = () => {
    send('UPDATE_TITLE', {
      title: 'React 子应用 - ' + new Date().toLocaleTimeString()
    })
    addMessage('UPDATE_TITLE', { direction: 'sent' })
  }

  useEffect(() => {
    // 监听初始化消息
    const unregisterInit = on('INIT', (data) => {
      console.log('Received init data:', data)
      setConnected(true)
      addMessage('INIT', data)

      // 通知父应用准备就绪
      send('READY', {
        app: 'react-app',
        timestamp: Date.now()
      })
    })

    // 监听登出
    const unregisterLogout = on('LOGOUT', () => {
      console.log('Logout received')
      addMessage('LOGOUT', {})
      localStorage.clear()
    })

    // 通知父应用已加载
    send('MOUNTED', {
      app: 'react-app',
      url: window.location.href
    })

    return () => {
      unregisterInit()
      unregisterLogout()
    }
  }, [on, send, addMessage])

  return (
    <div className="sub-app">
      <div className="sub-app__header">
        <h2>React 子应用</h2>
        <div className={`status-indicator ${connected ? 'connected' : ''}`}>
          {connected ? '已连接' : '未连接'}
        </div>
      </div>

      <div className="sub-app__content">
        <button onClick={sendTestMessage}>发送测试消息</button>
        <button onClick={requestUserInfo}>获取用户信息</button>
        <button onClick={updateParentTitle}>更新父应用标题</button>
      </div>

      <div className="sub-app__messages">
        <h3>收到的消息：</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.type}</strong>: {JSON.stringify(msg.data)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
```

```css
/* sub-app-react/src/App.css */
.sub-app {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.sub-app__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #61dafb;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #e0e0e0;
  color: #666;
}

.status-indicator.connected {
  background: #61dafb;
  color: white;
}

.sub-app__content {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.sub-app__content button {
  padding: 8px 16px;
  border: 1px solid #61dafb;
  background: white;
  color: #61dafb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-app__content button:hover {
  background: #61dafb;
  color: white;
}

.sub-app__messages {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.sub-app__messages h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.sub-app__messages ul {
  list-style: none;
}

.sub-app__messages li {
  padding: 8px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
}
```

---

## 四、进阶功能

### 4.1 URL 同步方案

```typescript
// main-app/src/utils/urlSync.ts
/**
 * iframe URL 同步工具
 * 解决 iframe 内部路由变化导致刷新后页面丢失的问题
 */

export class IframeUrlSync {
  private iframe: HTMLIFrameElement
  private currentUrl: string = ''

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe
    this.init()
  }

  private init() {
    // 监听 iframe 内部路由变化
    window.addEventListener('message', (event) => {
      if (event.source !== this.iframe.contentWindow) return

      const { type, data } = event.data

      if (type === 'ROUTE_CHANGE') {
        this.handleRouteChange(data.path)
      }
    })
  }

  private handleRouteChange(path: string) {
    this.currentUrl = path

    // 更新主应用 URL（使用 hash 模式）
    const url = new URL(window.location.href)
    url.hash = `/iframe${path}`
    window.history.replaceState({}, '', url.toString())
  }

  /**
   * 恢复 URL
   */
  restore() {
    const hash = window.location.hash
    if (hash.startsWith('#/iframe')) {
      const path = hash.slice(8) // 移除 #/iframe
      this.iframe.contentWindow?.postMessage(
        { type: 'RESTORE_ROUTE', data: { path } },
        '*'
      )
    }
  }
}
```

### 4.2 共享存储方案

```typescript
// main-app/src/utils/sharedStorage.ts
/**
 * 跨 iframe 共享存储
 * 通过 localStorage 和 storage 事件实现
 */

interface StorageItem {
  value: any
  timestamp: number
  app: string
}

class SharedStorage {
  private readonly prefix = 'micro_shared_'
  private readonly channel: BroadcastChannel

  constructor() {
    // 使用 BroadcastChannel 实现实时通信
    this.channel = new BroadcastChannel('micro_storage')

    // 监听其他标签页的 storage 变化
    window.addEventListener('storage', this.handleStorageChange)
    this.channel.addEventListener('message', this.handleBroadcast)
  }

  /**
   * 设置共享数据
   */
  set(key: string, value: any, appName: string = 'main') {
    const item: StorageItem = {
      value,
      timestamp: Date.now(),
      app: appName
    }

    const fullKey = this.prefix + key
    localStorage.setItem(fullKey, JSON.stringify(item))

    // 通知其他应用
    this.channel.postMessage({ type: 'set', key, value, app: appName })
  }

  /**
   * 获取共享数据
   */
  get(key: string): any {
    const fullKey = this.prefix + key
    const item = localStorage.getItem(fullKey)

    if (!item) return null

    try {
      const parsed: StorageItem = JSON.parse(item)
      return parsed.value
    } catch {
      return null
    }
  }

  /**
   * 删除共享数据
   */
  remove(key: string) {
    const fullKey = this.prefix + key
    localStorage.removeItem(fullKey)

    this.channel.postMessage({ type: 'remove', key })
  }

  /**
   * 监听数据变化
   */
  onChange(callback: (key: string, value: any, app: string) => void) {
    this.channel.addEventListener('message', (event) => {
      const { type, key, value, app } = event.data

      if (type === 'set') {
        callback(key, value, app)
      } else if (type === 'remove') {
        callback(key, null, app)
      }
    })
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (!event.key?.startsWith(this.prefix)) return

    const key = event.key.slice(this.prefix.length)
    const value = event.newValue ? JSON.parse(event.newValue).value : null

    // 触发回调
    // (需要实现回调机制)
  }

  private handleBroadcast = (event: MessageEvent) => {
    // 处理 BroadcastChannel 消息
    // (在 onChange 中处理)
  }

  destroy() {
    window.removeEventListener('storage', this.handleStorageChange)
    this.channel.close()
  }
}

export const sharedStorage = new SharedStorage()
```

### 4.3 弹窗遮罩层处理

```typescript
// main-app/src/utils/modalHandler.ts
/**
 * 处理 iframe 内部的弹窗和遮罩层
 * 通过消息通信让主应用知道何时显示遮罩
 */

export class IframeModalHandler {
  private modalOverlay: HTMLElement

  constructor() {
    // 创建全局遮罩层
    this.modalOverlay = document.createElement('div')
    this.modalOverlay.className = 'iframe-modal-overlay'
    this.modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      z-index: 9998;
      pointer-events: none;
      display: none;
    `
    document.body.appendChild(this.modalOverlay)

    this.init()
  }

  private init() {
    window.addEventListener('message', (event) => {
      const { type, data } = event.data

      if (type === 'MODAL_OPEN') {
        this.showModal(data)
      } else if (type === 'MODAL_CLOSE') {
        this.hideModal()
      }
    })
  }

  private showModal(data: { zIndex?: number; background?: string }) {
    this.modalOverlay.style.display = 'block'
    this.modalOverlay.style.pointerEvents = 'auto'

    if (data.zIndex) {
      this.modalOverlay.style.zIndex = String(data.zIndex - 1)
    }

    if (data.background) {
      this.modalOverlay.style.background = data.background
    }

    // 点击遮罩关闭（可选）
    this.modalOverlay.onclick = () => {
      window.postMessage({ type: 'CLOSE_MODAL' }, '*')
    }
  }

  private hideModal() {
    this.modalOverlay.style.display = 'none'
    this.modalOverlay.style.pointerEvents = 'none'
    this.modalOverlay.onclick = null
  }

  destroy() {
    this.modalOverlay.remove()
  }
}
```

```typescript
// sub-app-vue/src/utils/modalHelper.ts
/**
 * 子应用弹窗辅助工具
 */
export class ModalHelper {
  private modalCount = 0

  open(options: { zIndex?: number; background?: string } = {}) {
    this.modalCount++

    if (this.modalCount === 1) {
      // 通知主应用显示遮罩
      window.parent.postMessage({
        type: 'MODAL_OPEN',
        data: {
          zIndex: options.zIndex || 10000,
          background: options.background
        }
      }, '*')
    }
  }

  close() {
    this.modalCount = Math.max(0, this.modalCount - 1)

    if (this.modalCount === 0) {
      // 通知主应用隐藏遮罩
      window.parent.postMessage({
        type: 'MODAL_CLOSE'
      }, '*')
    }
  }

  // 封装常见弹窗库
  wrapElementPlus(confirm: any, alert: any) {
    const originalConfirm = confirm
    const originalAlert = alert

    return {
      confirm: (...args: any[]) => {
        this.open({ zIndex: 9999 })
        return originalConfirm(...args).finally(() => {
          this.close()
        })
      },
      alert: (...args: any[]) => {
        this.open({ zIndex: 9999 })
        return originalAlert(...args).finally(() => {
          this.close()
        })
      }
    }
  }
}

export const modalHelper = new ModalHelper()
```

### 4.4 安全策略配置

```typescript
// main-app/src/utils/security.ts
/**
 * iframe 安全策略配置
 */

export interface IframeSecurityConfig {
  allow?: string[]
  sandbox?: string[]
  csp?: string
}

export const defaultSecurityConfig: IframeSecurityConfig = {
  allow: [
    'clipboard-read',    // 允许读取剪贴板
    'clipboard-write',   // 允许写入剪贴板
  ],
  sandbox: [
    'allow-scripts',           // 允许执行脚本
    'allow-same-origin',       // 允许同源请求
    'allow-forms',            // 允许提交表单
    'allow-popups',           // 允许弹出窗口
    'allow-modals',           // 允许模态框
    // 不允许 'allow-top-navigation' - 防止导航主应用
  ],
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}

/**
 * 生成 sandbox 属性值
 */
export function generateSandboxAttr(options?: string[]): string {
  const sandbox = options || defaultSecurityConfig.sandbox || []
  return sandbox.join(' ')
}

/**
 * 生成 allow 属性值
 */
export function generateAllowAttr(options?: string[]): string {
  const allow = options || defaultSecurityConfig.allow || []
  return allow.join(' ')
}

/**
 * 验证消息来源
 */
export function validateMessageOrigin(
  event: MessageEvent,
  allowedOrigins: string[]
): boolean {
  return allowedOrigins.some(origin => {
    if (origin === '*') return true
    try {
      const allowed = new URL(origin)
      const received = new URL(event.origin)
      return allowed.origin === received.origin
    } catch {
      return false
    }
  })
}
```

---

## 五、生产环境部署

### 5.1 部署架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                       生产环境部署架构                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      CDN / 负载均衡                          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│         ┌─────────────────┼─────────────────┐                      │
│         ▼                 ▼                 ▼                      │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐                  │
│   │ 主应用     │    │ 子应用 A   │    │ 子应用 B   │                  │
│   │           │    │           │    │           │                  │
│   │ main.com  │    │ app-a.com │    │ app-b.com │                  │
│   │           │    │           │    │           │                  │
│   └───────────┘    └───────────┘    └───────────┘                  │
│         │                 │                 │                      │
│         │                 │                 │                      │
│         └─────────────────┴─────────────────┘                      │
│                           │                                         │
│                           ▼                                         │
│              用户浏览器（iframe 嵌入）                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Nginx 配置

```nginx
# 主应用配置
server {
    listen 80;
    server_name main.example.com;

    root /var/www/main-app;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # CORS 支持（如果子应用跨域）
    add_header Access-Control-Allow-Origin $http_origin;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'Content-Type';
    add_header Access-Control-Allow-Credentials true;

    # 安全头
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 子应用 A 配置
server {
    listen 80;
    server_name app-a.example.com;

    root /var/www/app-a;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 允许被 iframe 嵌入
    add_header X-Frame-Options ALLOW-FROM https://main.example.com;
    # 或使用 Content-Security-Policy
    add_header Content-Security-Policy "frame-ancestors https://main.example.com";

    # CORS
    add_header Access-Control-Allow-Origin https://main.example.com;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'Content-Type';
    add_header Access-Control-Allow-Credentials true;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 环境配置

```typescript
// main-app/src/config/apps.ts
interface MicroAppConfig {
  name: string
  title: string
  src: string // 根据 ENV 动态生成
  autoResize?: boolean
}

const appDomains = {
  development: {
    main: 'http://localhost:5170',
    vueApp: 'http://localhost:5173',
    reactApp: 'http://localhost:5174'
  },
  staging: {
    main: 'https://staging-main.example.com',
    vueApp: 'https://staging-vue.example.com',
    reactApp: 'https://staging-react.example.com'
  },
  production: {
    main: 'https://main.example.com',
    vueApp: 'https://vue.example.com',
    reactApp: 'https://react.example.com'
  }
}

export const getMicroApps = (): MicroAppConfig[] => {
  const env = import.meta.env.MODE || 'development'
  const domains = appDomains[env as keyof typeof appDomains] || appDomains.development

  return [
    {
      name: 'vue-app',
      title: 'Vue 子应用',
      src: domains.vueApp,
      autoResize: true
    },
    {
      name: 'react-app',
      title: 'React 子应用',
      src: domains.reactApp,
      autoResize: true
    }
  ]
}
```

---

## 六、常见问题与解决方案

### 6.1 跨域问题

**问题：** iframe 和父应用跨域时，postMessage 虽然可用，但无法访问 iframe 内部内容

**解决方案：**

```typescript
// 主应用配置 CORS
export default defineConfig({
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})

// 生产环境使用 Nginx 配置（见上文）
```

### 6.2 登录态同步

**问题：** iframe 内部的登录状态与主应用不同步

**解决方案：**

```typescript
// 方案一：通过 postMessage 传递 token
// 主应用登录成功后
messageClient.send('LOGIN_SUCCESS', {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || '{}')
})

// 子应用接收并保存
messageClient.on('LOGIN_SUCCESS', (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
})

// 方案二：使用共享存储（见上文 SharedStorage）
```

### 6.3 弹窗被遮挡

**问题：** iframe 内部的弹窗、下拉菜单被 iframe 边界裁剪

**解决方案：**

```typescript
// 方案一：使用全局遮罩（见上文 ModalHandler）

// 方案二：将弹窗渲染到主应用
// 1. 子应用通知主应用显示弹窗
messageClient.send('SHOW_MODAL', {
  component: 'ConfirmDialog',
  props: { title: '确认删除？' }
})

// 2. 主应用渲染弹窗组件
// 3. 用户操作后，主应用将结果通知子应用
messageClient.send('MODAL_RESULT', { confirmed: true })

// 方案三：使用 Portal 到 document.body
// 但这只能在 iframe 内部使用，仍可能被边界裁剪
```

### 6.4 性能优化

```typescript
// 1. 延迟加载 iframe
const lazyLoadIframe = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target as HTMLIFrameElement
        iframe.src = iframe.dataset.src!
        observer.unobserve(iframe)
      }
    })
  })

  document.querySelectorAll('iframe[data-src]').forEach(iframe => {
    observer.observe(iframe)
  })
}

// 2. 空闲时预加载
const prefetchIframes = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = 'https://app-a.example.com'
      document.head.appendChild(link)
    })
  }
}

// 3. 共享依赖缓存
// 将公共依赖（如 React、Vue）部署到 CDN，所有应用共用
```

### 6.5 错误监控

```typescript
// main-app/src/utils/errorHandler.ts
/**
 * iframe 错误监控
 */

interface IframeError {
  app: string
  type: 'LOAD_ERROR' | 'RUNTIME_ERROR' | 'NETWORK_ERROR'
  message: string
  stack?: string
  userAgent: string
  timestamp: number
}

class IframeErrorHandler {
  private errors: IframeError[] = []

  init() {
    // 监听 iframe 加载错误
    window.addEventListener('error', (event) => {
      const iframe = event.target as HTMLIFrameElement
      if (iframe.tagName === 'IFRAME') {
        this.reportError({
          app: iframe.name || 'unknown',
          type: 'LOAD_ERROR',
          message: event.message,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }
    }, true)

    // 监听来自 iframe 的错误消息
    window.addEventListener('message', (event) => {
      const { type, data } = event.data

      if (type === 'IFRAME_ERROR') {
        this.reportError({
          app: data.app,
          type: data.errorType,
          message: data.message,
          stack: data.stack,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }
    })
  }

  private reportError(error: IframeError) {
    this.errors.push(error)

    // 上报到监控平台
    console.error('[Iframe Error]', error)

    // 示例：发送到 Sentry
    // Sentry.captureException(new Error(error.message), {
    //   tags: { app: error.app, type: error.type }
    // })
  }

  getErrors(): IframeError[] {
    return this.errors
  }

  clearErrors() {
    this.errors = []
  }
}

export const iframeErrorHandler = new IframeErrorHandler()
```

---

## 七、iframe vs 其他方案总结

### 7.1 选择决策树

```
                    是否需要整合
                    第三方/外部系统？
                         │
            ┌────────────┴────────────┐
            │ Yes                    │ No
            ▼                         ▼
        使用 iframe              是否需要完全
                                 隔离样式？
                                    │
                        ┌───────────┴───────────┐
                        │ Yes                   │ No
                        ▼                       ▼
                    考虑 qiankun            模块联邦
                    或 iframe              (效率更高)

        ┌───────────────────────────────────────┐
        │                                       │
    单体仓库                             多团队协作
    技术栈统一                            技术栈可能不同
        │                                       │
        ▼                                       ▼
   模块联邦                              qiankun / iframe
```

### 7.2 方案对比表

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 整合第三方系统 | iframe | 完全隔离，无需改造 |
| 旧系统渐进式迁移 | iframe | 改造成本最低 |
| 新项目微前端化 | qiankun / 模块联邦 | 体验更好 |
| 组件级复用 | 模块联邦 | 细粒度共享 |
| 跨团队独立部署 | qiankun | 运行时集成 |
| 共享依赖优化 | 模块联邦 | 自动去重 |

---

## 八、参考资源

- [MDN - iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [MDN - postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [微前端实践](https://micro-frontends.org/)
