# createApp

## 作用
`createApp()` 函数创建一个应用实例，这是使用 Vue 3 构建应用的第一步。每个 Vue 应用都通过创建一个应用实例开始。

## 用法

### 基本用法

```javascript
import { createApp } from 'vue'
import App from './App.vue'

// 创建应用实例
const app = createApp(App)

// 挂载应用
app.mount('#app')
```

### 完整示例

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 创建应用
const app = createApp(App)

// 注册插件
app.use(router)
app.use(store)

// 注册全局组件
app.component('MyComponent', MyComponent)

// 注册全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 提供全局属性
app.config.globalProperties.$http = axios

// 挂载应用
app.mount('#app')
```

### 根组件

```javascript
// App.vue
<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
</script>

<template>
  <div id="app">
    <h1>{{ message }}</h1>
  </div>
</template>
```

### 使用渲染函数

```javascript
import { createApp, h } from 'vue'

const app = createApp({
  render() {
    return h('div', 'Hello Vue 3!')
  }
})

app.mount('#app')
```

### 配置应用实例

```javascript
const app = createApp(App)

// 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 全局属性
app.config.globalProperties.$VERSION = '1.0.0'

// 挂载
app.mount('#app')
```

### 多个应用实例

```javascript
import { createApp } from 'vue'
import App1 from './App1.vue'
import App2 from './App2.vue'

// 创建第一个应用
const app1 = createApp(App1)
app1.mount('#app1')

// 创建第二个应用（独立实例）
const app2 = createApp(App2)
app2.mount('#app2')
```

## 应用实例 API

### app.component()

注册全局组件。

```javascript
import { createApp } from 'vue'
import MyButton from './MyButton.vue'
import MyInput from './MyInput.vue'

const app = createApp(App)

// 注册单个组件
app.component('MyButton', MyButton)

// 注册多个组件
app
  .component('MyButton', MyButton)
  .component('MyInput', MyInput)

// 链式调用
app.component('MyButton', MyButton)
   .component('MyInput', MyInput)
   .mount('#app')
```

### app.directive()

注册全局指令。

```javascript
const app = createApp(App)

// 注册指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 带参数的指令
app.directive('color', {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
})

// 使用
// <input v-focus />
// <div v-color="'red'">Text</div>
```

### app.use()

安装插件。

```javascript
const app = createApp(App)

// 安装 Vue Router
import { createRouter } from 'vue-router'
const router = createRouter({ /* ... */ })
app.use(router)

// 安装 Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

// 安装自定义插件
const myPlugin = {
  install(app, options) {
    // 提供全局属性
    app.config.globalProperties.$myMethod = () => {
      console.log('My method called')
    }

    // 注册全局组件
    app.component('MyComponent', MyComponent)

    // 提供 provide
    app.provide('pluginOptions', options)
  }
}

app.use(myPlugin, { someOption: true })
```

### app.mount()

挂载应用。

```javascript
const app = createApp(App)

// 挂载到 DOM 元素
app.mount('#app')

// 返回根组件实例
const rootComponent = app.mount('#app')

// 挂载后不能再使用应用实例 API
app.component('NewComponent', NewComponent) // 警告
```

### app.unmount()

卸载应用。

```javascript
const app = createApp(App)
const vm = app.mount('#app')

// 卸载应用
app.unmount()

// 清理所有事件监听器和组件
```

### app.provide()

提供全局可注入的值。

```javascript
const app = createApp(App)

// 提供 value
app.provide('theme', 'dark')
app.provide('config', {
  apiUrl: 'https://api.example.com'
})

// 在任何组件中注入
// const theme = inject('theme')
```

### app.config.globalProperties

添加全局属性。

```javascript
const app = createApp(App)

// 添加全局属性
app.config.globalProperties.$http = axios
app.config.globalProperties.$VERSION = '1.0.0'
app.config.globalProperties.$utils = {
  formatCurrency(value) {
    return '$' + value.toFixed(2)
  }
}

// 在组件中使用
// export default {
//   mounted() {
//     this.$http.get('/api/data')
//     console.log(this.$VERSION)
//     this.$utils.formatCurrency(99.9)
//   }
// }
```

### app.config.errorHandler

全局错误处理器。

```javascript
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  // err: 错误对象
  // instance: 发生错误的组件实例
  // info: Vue 特定的错误信息

  console.error('Global error:', err)
  console.error('Component:', instance?.$options?.name)
  console.error('Error info:', info)

  // 可以发送到错误追踪服务
  if (typeof window !== 'undefined') {
    window.Sentry?.captureException(err)
  }
}
```

### app.config.warnHandler

全局警告处理器。

```javascript
const app = createApp(App)

app.config.warnHandler = (msg, instance, trace) => {
  // msg: 警告信息
  // instance: 组件实例
  // trace: 组件层次结构追踪

  console.warn('Warning:', msg)
  console.trace(trace)
}
```

### app.config.optionMergeStrategies

自定义选项合并策略。

```javascript
const app = createApp(App)

// 自定义合并策略
app.config.optionMergeStrategies.customStrategy = (toVal, fromVal) => {
  // toVal: 父组件的选项值
  // fromVal: 子组件的选项值

  if (!toVal) return fromVal
  if (!fromVal) return toVal

  // 合并逻辑
  return { ...toVal, ...fromVal }
}

// 使用
export default {
  customStrategy: {
    option1: 'value1'
  }
}
```

### app.config.performance

启用性能追踪。

```javascript
const app = createApp(App)

// 开发模式中启用性能追踪
app.config.performance = true

// 在浏览器 DevTools 中可以看到组件性能
```

### app.config.compilerOptions

配置编译器选项。

```javascript
const app = createApp(App)

app.config.compilerOptions = {
  // 是否区分大小写
  isCustomElement: (tag) => tag.startsWith('x-'),

  // 分隔符
  delimiters: ['${', '}'],

  // 是否在浏览器中编译模板
  // (默认 false，生产环境中不需要模板编译器)
  comments: true
}
```

## 注意事项

### 1. 只在挂载前配置

```javascript
const app = createApp(App)

// ✅ 正确：挂载前配置
app.component('MyComponent', MyComponent)
app.use(router)
app.mount('#app')

// ❌ 错误：挂载后配置无效
app.mount('#app')
app.component('NewComponent', NewComponent) // 警告
```

### 2. 每个 mount 创建新实例

```javascript
const app = createApp(App)

// ✅ 可以多次挂载
app.mount('#app1')
app.mount('#app2')

// 但它们是不同的实例
```

### 3. TypeScript 类型支持

```typescript
import { createApp } from 'vue'
import App from './App.vue'

interface GlobalProperties {
  $http: typeof axios
  $VERSION: string
}

// 创建类型安全的应用实例
const app = createApp(App)

// 扩展全局属性类型
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $http: typeof axios
    $VERSION: string
  }
}

app.config.globalProperties.$http = axios
app.config.globalProperties.$VERSION = '1.0.0'

app.mount('#app')
```

### 4. SSR 注意事项

```javascript
// 服务端渲染
import { createApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

const app = createApp(App)

// 渲染为字符串
const html = await renderToString(app)

// 每个请求创建新实例
function createSSRApp() {
  const app = createApp(App)
  // 配置应用
  return app
}
```

### 5. 插件开发

```javascript
// my-plugin.js
export default {
  install(app, options) {
    // 1. 注入全局属性
    app.config.globalProperties.$myPlugin = () => {
      console.log('My plugin!')
    }

    // 2. 注册全局组件
    app.component('MyPluginComponent', MyComponent)

    // 3. 注册全局指令
    app.directive('my-directive', {
      mounted(el, binding) {
        // 指令逻辑
      }
    })

    // 4. 提供 provide
    app.provide('pluginOptions', options)

    // 5. 混入全局
    app.mixin({
      mounted() {
        console.log('Component mounted from plugin')
      }
    })
  }
}

// 使用
import MyPlugin from './my-plugin'
app.use(MyPlugin, { option: 'value' })
```

## 使用场景

### 1. 基础应用设置

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
```

### 2. 全局错误处理

```javascript
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  // 开发环境
  if (import.meta.env.DEV) {
    console.error('Error:', err)
  }

  // 生产环境
  if (import.meta.env.PROD) {
    // 发送到错误追踪服务
    Sentry.captureException(err)

    // 显示用户友好的错误页面
    router.push('/error')
  }
}

app.mount('#app')
```

### 3. 全局组件库

```javascript
// components/index.js
import Button from './Button.vue'
import Input from './Input.vue'
import Modal from './Modal.vue'

export function registerComponents(app) {
  app.component('VButton', Button)
  app.component('VInput', Input)
  app.component('VModal', Modal)
}

// main.js
import { createApp } from 'vue'
import { registerComponents } from './components'

const app = createApp(App)
registerComponents(app)
app.mount('#app')
```

### 4. 插件开发模式

```javascript
// plugins/api.js
import axios from 'axios'

export default {
  install(app, options) {
    const api = axios.create({
      baseURL: options.baseURL || '/api'
    })

    // 添加请求拦截器
    api.interceptors.request.use(config => {
      const token = app.config.globalProperties.$store?.state?.auth?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // 添加响应拦截器
    api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // 处理未授权
          app.config.globalProperties.$router?.push('/login')
        }
        return Promise.reject(error)
      }
    )

    // 提供全局 API 实例
    app.config.globalProperties.$api = api

    // 提供 API 实例
    app.provide('api', api)
  }
}

// 使用
import apiPlugin from './plugins/api'

app.use(apiPlugin, {
  baseURL: import.meta.env.VITE_API_URL
})
```

### 5. 自定义指令库

```javascript
// directives/index.js
export function registerDirectives(app) {
  app.directive('click-outside', {
    mounted(el, binding) {
      el._clickOutside = (event) => {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event)
        }
      }
      document.addEventListener('click', el._clickOutside)
    },
    unmounted(el) {
      document.removeEventListener('click', el._clickOutside)
    }
  })

  app.directive('lazy', {
    mounted(el, binding) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = binding.value
            observer.unobserve(el)
          }
        })
      })
      observer.observe(el)
    }
  })
}
```

### 6. 主题插件

```javascript
// plugins/theme.js
export default {
  install(app) {
    const theme = ref(localStorage.getItem('theme') || 'light')

    const updateTheme = (newTheme) => {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
    }

    // 初始化主题
    updateTheme(theme.value)

    // 提供全局方法
    app.config.globalProperties.$setTheme = updateTheme

    // 提供 inject
    app.provide('theme', readonly(theme))
    app.provide('setTheme', updateTheme)
  }
}
```

### 7. i18n 插件

```javascript
// plugins/i18n.js
export default {
  install(app, options) {
    const locale = ref(options.defaultLocale || 'zh-CN')
    const messages = ref(options.messages || {})

    const t = (key, params = {}) => {
      let message = messages.value[locale.value]?.[key] || key

      // 替换参数
      Object.keys(params).forEach(param => {
        message = message.replace(`{${param}}`, params[param])
      })

      return message
    }

    const setLocale = (newLocale) => {
      locale.value = newLocale
    }

    app.config.globalProperties.$t = t
    app.config.globalProperties.$setLocale = setLocale

    app.provide('i18n', {
      locale,
      t,
      setLocale
    })
  }
}
```

## 最佳实践

1. **单一应用实例**：大多数应用只需要一个应用实例
2. **先配置后挂载**：在 mount() 之前完成所有配置
3. **使用插件**：通过插件组织全局功能
4. **类型安全**：TypeScript 中正确声明全局属性类型
5. **错误处理**：设置全局错误处理器
