# plugins 配置

## 定义

`plugins` 配置要使用的 Vite 插件数组。

## 属性层级结构

```
plugins (数组)
└── Plugin
    ├── name
    ├── enforce ('pre' | 'post')
    ├── apply ('serve' | 'build' | function)
    ├── config
    ├── configResolved
    ├── configureServer
    ├── configurePreviewServer
    ├── transformIndexHtml
    ├── handleHotUpdate
    ├── resolveId
    ├── load
    ├── transform
    ├── buildStart
    ├── buildEnd
    └── closeBundle
```

## 用法

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default {
  plugins: [
    vue(),
    Components(),
    // 自定义插件
    {
      name: 'my-plugin',
      configResolved(config) {
        console.log(config)
      }
    }
  ]
}
```

## 插件格式

```javascript
// 简单插件
{
  name: 'plugin-name',
  enforce: 'pre' | 'post' | undefined,
  apply: 'serve' | 'build' | ((config) => boolean),
  config(config, { command }) {},
  configResolved(resolvedConfig) {},
  configureServer(server) {},
  configurePreviewServer(server) {},
  transformIndexHtml(html, ctx) {},
  handleHotUpdate(ctx) {},
  resolveId(source, importer, options) {},
  load(id) {},
  transform(code, id) {},
  buildStart() {},
  buildEnd() {},
  closeBundle() {}
}
```

## 插件顺序

```javascript
plugins: [
  // 第一个执行
  plugin1(),
  // 使用 enforce 控制顺序
  { name: 'pre-plugin', enforce: 'pre' },  // 最先执行
  plugin2(),
  { name: 'post-plugin', enforce: 'post' }, // 最后执行
  plugin3()
]

// 执行顺序: pre-plugin → plugin1 → plugin2 → plugin3 → post-plugin
```

## 作用

- 扩展 Vite 功能
- 处理特定文件类型
- 修改构建行为
- 自定义开发服务器
- 集成第三方工具

## 使用场景

1. **框架支持**：Vue、React、Svelte 等
2. **组件自动导入**：unplugin-vue-components
3. **UI 库**：Element Plus、Ant Design Vue
4. **自定义处理**：特殊文件格式转换

## 常用插件

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-vue` | Vue 3 支持 |
| `@vitejs/plugin-react` | React 支持 |
| `@vitejs/plugin-legacy` | 浏览器兼容 |
| `unplugin-vue-components` | 组件自动导入 |
| `unplugin-auto-import` | API 自动导入 |
| `vite-plugin-windicss` | Windi CSS 支持 |
| `vite-plugin-svg-icons` | SVG 图标 |
| `rollup-plugin-visualizer` | 打包分析 |

## 注意事项

- `enforce: 'pre'` 的插件在 Vite 核心插件之前执行
- `enforce: 'post'` 的插件在 Vite 核心插件之后执行
- `apply` 可以限制插件仅在特定模式运行
- 插件可以同时是 Vite 插件和 Rollup 插件

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions.plugins` | 仅构建时的 Rollup 插件 |
| `resolve.alias` | 插件中可能需要配置别名 |

## 示例

```javascript
// Vue 3 完整配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),

    // 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    }),

    // API 自动导入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),

    // 仅开发环境使用
    {
      name: 'dev-tools',
      apply: 'serve',
      configureServer(server) {
        console.log('Dev server configured')
      }
    },

    // 自定义转换插件
    {
      name: 'my-transform',
      transform(code, id) {
        if (id.endsWith('.my')) {
          return `export default ${JSON.stringify(code)}`
        }
      }
    }
  ]
})

// 插件条件加载
const plugins = [vue()]

if (process.env.NODE_ENV === 'development') {
  plugins.push(debugPlugin())
}

export default { plugins }
```

## 自定义插件示例

```javascript
// 修改 HTML
function myHtmlPlugin() {
  return {
    name: 'html-injector',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        '<head><meta name="custom" content="value">'
      )
    }
  }
}

// HMR 处理
function myHmrPlugin() {
  return {
    name: 'custom-hmr',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.custom')) {
        ctx.server.ws.send({
          type: 'custom',
          event: 'custom-update',
          data: { file: ctx.file }
        })
      }
    }
  }
}

// 虚拟模块
function virtualModulePlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'virtual-module',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "Hello from virtual module"`
      }
    }
  }
}
```
