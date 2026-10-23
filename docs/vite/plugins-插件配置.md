# plugins 配置

> 📖 [官方文档：插件 API](https://cn.vitejs.dev/guide/api-plugin.html)
>
> 📖 [官方文档：使用插件](https://cn.vitejs.dev/guide/using-plugins.html)

## 定义

`plugins` 配置 Vite 要使用的插件数组。插件是带钩子的对象，Vite 直接兼容 Rollup 插件接口，并在此基础上提供专属属性与钩子。

**类型**：

```typescript
plugins?: (PluginOption | Promise<PluginOption>)[]
```

数组中的插件支持：

- **嵌套数组**：自动扁平化；
- **falsy 值**：`false`、`null`、`undefined` 会被忽略（方便条件添加插件）；
- **Promise**：异步插件会被等待（官方建议借此延迟加载插件）。

```javascript
// 条件添加插件的惯用写法（Vite 忽略 falsy 值）
export default {
  plugins: [vue(), isDev && debugPlugin()]
}
```

## 插件格式

一个 Vite 插件是一个对象（官方类型为 `Plugin`，以下为简化示意）：

```typescript
import type { Plugin } from 'vite'

const myPlugin = (): Plugin => ({
  // 插件唯一名称（必需）
  name: 'my-plugin',

  // —— Vite 专属属性 ——
  enforce: 'pre',   // 执行顺序：'pre' | 'post'
  apply: 'serve',   // 应用条件：'serve' | 'build' | 函数

  // —— Vite 专属钩子 ——
  config(config, env) {},              // 修改配置
  configResolved(resolvedConfig) {},   // 读取最终配置
  configureServer(server) {},          // 配置开发服务器
  configurePreviewServer(server) {},   // 配置预览服务器
  transformIndexHtml(html, ctx) {},    // 转换 index.html
  handleHotUpdate(ctx) {},             // 自定义 HMR 更新

  // —— Rollup 通用钩子（Vite 直接兼容）——
  buildStart() {},                     // 构建开始
  resolveId(source, importer) {},      // 模块解析
  load(id) {},                         // 模块加载
  transform(code, id) {},              // 代码转换
  buildEnd() {},                       // 构建结束
  closeBundle() {}                     // 产物写入后收尾
})
```

## 子属性详解

### name

**类型**：`string`

**必需**：是

插件的唯一标识名称。

```javascript
{
  name: 'my-plugin'
}
```

### enforce

**类型**：`'pre' | 'post'`

控制插件在 Vite 内部插件流水线中的位置。未设置 `enforce` 的插件属于"普通插件"层，同层按声明顺序执行。

**插件应用顺序**（官方文档给出的完整顺序）：

1. Alias
2. 用户插件中 `enforce: 'pre'` 的插件
3. Vite 核心插件
4. 未设置 `enforce` 的用户插件（按声明顺序）
5. Vite 构建插件
6. 用户插件中 `enforce: 'post'` 的插件
7. Vite 后置构建插件（压缩、报告等）

```javascript
{ name: 'pre-plugin', enforce: 'pre' }   // 早于 Vite 核心插件
{ name: 'normal-plugin' }                // 普通层
{ name: 'post-plugin', enforce: 'post' } // 晚于 Vite 构建插件
```

### apply

**类型**：`'serve' | 'build' | ((config: UserConfig, env: { mode: string; command: string }) => boolean)`

限制插件只在开发（serve）或构建（build）时应用；函数形式可写更细的条件，`command` 与 `mode` 来自第二个参数 `env`（注意不要在第一个参数 `config` 上取）。

```javascript
// 字符串形式
{
  name: 'serve-only-plugin',
  apply: 'serve'      // 仅开发服务器应用
}

// 函数形式（官方示例）
{
  name: 'build-only-no-ssr',
  apply(config, { command }) {
    // 仅在构建且非 SSR 时应用
    return command === 'build' && !config.build?.ssr
  }
}
```

### config

**类型**：`(config: UserConfig, env: { mode: string; command: string }) => UserConfig | null | void`

在配置解析前修改配置，返回值会被 Vite 深合并进最终配置。

```javascript
{
  name: 'config-plugin',
  config(config, { mode, command }) {
    // 方式一：返回要合并的配置
    return {
      resolve: {
        alias: {
          '@custom': '/src/custom'
        }
      }
    }

    // 方式二：直接修改 config 对象（不返回）
    // config.resolve ??= {}
  }
}
```

### configResolved

**类型**：`(config: ResolvedConfig) => void`

在配置解析完成后执行，用于读取最终配置（只读，不应再修改）。

```javascript
{
  name: 'config-resolved-plugin',
  configResolved(config) {
    console.log('Root:', config.root)
    console.log('Base:', config.base)
  }
}
```

### configureServer

**类型**：`(server: ViteDevServer) => void | (() => void)`

配置开发服务器（添加中间件等）。返回的函数会在服务器关闭时作为清理回调执行。

```javascript
{
  name: 'server-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/custom') {
        res.end('Custom response')
      } else {
        next()
      }
    })

    // 返回清理函数
    return () => {
      console.log('Server closed')
    }
  }
}
```

### configurePreviewServer

**类型**：`(server: PreviewServer) => void | (() => void)`

配置预览服务器（`vite preview`），用法与 `configureServer` 一致。

```javascript
{
  name: 'preview-plugin',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      console.log('Preview request:', req.url)
      next()
    })
  }
}
```

### transformIndexHtml

**类型**：`(html: string, ctx: TransformIndexHtmlContext) => string | HtmlTagDescriptor[] | null | void`

转换 HTML 入口文件（如注入脚本、meta 标签）。上下文 `ctx` 包含 `path`、`filename`，开发时还有 `serverUrl`。

```javascript
{
  name: 'html-plugin',
  transformIndexHtml(html, { filename }) {
    // 推荐：返回标签描述符，由 Vite 决定注入位置
    return [
      {
        tag: 'meta',
        attrs: { name: 'custom', content: 'value' },
        injectTo: 'head' // 可选：head | body | head-prepend | body-prepend
      }
    ]
  }
}
```

Vite 4 起支持对象形式，用 `order` 控制与 Vite 内置 HTML 处理的先后：

```javascript
{
  name: 'html-plugin',
  transformIndexHtml: {
    order: 'pre', // 'pre' 在 Vite 核心插件之前，'post' 在其后
    handler(html, ctx) {
      return html.replace('<head>', '<head><meta name="custom" content="value">')
    }
  }
}
```

### handleHotUpdate

**类型**：`(ctx: HmrContext) => void | Array<ModuleNode> | Promise<void | Array<ModuleNode>>`

自定义 HMR 更新处理。`ctx`（`HmrContext`）包含 `file`、`timestamp`、`modules`、`read`、`server`；返回模块数组可覆盖受影响的模块列表。

```javascript
{
  name: 'hmr-plugin',
  handleHotUpdate(ctx) {
    const { file, server, modules, read } = ctx

    if (file.endsWith('.custom')) {
      console.log('Custom file updated')
    }

    // 返回过滤后的模块列表，控制本次 HMR 的更新范围
    // return modules.filter(m => !m.id.includes('exclude'))
  }
}
```

### resolveId（Rollup 通用钩子）

**类型**：`(source: string, importer: string | undefined, options: { isEntry: boolean }) => string | false | null | void | Promise<string | false | null | void>`

自定义模块解析。返回解析后的 ID；返回 `null` 交给后续插件继续解析；返回 `false` 表示外部依赖。

```javascript
{
  name: 'resolve-plugin',
  resolveId(source, importer) {
    if (source === 'virtual:module') {
      return '\0virtual:module' // \0 前缀是虚拟模块的约定标记
    }
    return null // 继续正常解析
  }
}
```

### load（Rollup 通用钩子）

**类型**：`(id: string) => string | { code: string; map?: unknown } | null | void | Promise<string | { code: string; map?: unknown } | null | void>`

自定义模块加载，返回代码字符串或 `{ code, map }` 对象。

```javascript
{
  name: 'load-plugin',
  load(id) {
    if (id === '\0virtual:module') {
      return 'export const msg = "Hello from virtual module"'
    }
    return null // 交给其他加载器
  }
}
```

### transform（Rollup 通用钩子）

**类型**：`(code: string, id: string) => string | { code: string; map?: unknown } | null | void | Promise<string | { code: string; map?: unknown } | null | void>`

转换模块代码。

```javascript
{
  name: 'transform-plugin',
  transform(code, id) {
    if (id.endsWith('.custom')) {
      return {
        code: `export default ${JSON.stringify(code)}`,
        map: null
      }
    }
    return null // 不转换
  }
}
```

## 可选值与使用方式

### 基本用法

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default {
  plugins: [
    vue(),
    Components()
  ]
}
```

### 带配置的插件

```javascript
export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 把 x- 开头的标签视为自定义元素
          isCustomElement: (tag) => tag.startsWith('x-')
        }
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
}
```

### 条件插件

```javascript
// 方式一：配置期判断，用 falsy 值过滤
const plugins = [vue()]

if (process.env.NODE_ENV === 'development') {
  plugins.push(debugPlugin())
}

export default { plugins }

// 方式二：声明式 apply，由 Vite 按 command/mode 过滤
export default {
  plugins: [
    vue(),
    {
      name: 'dev-plugin',
      apply: 'serve',
      configureServer(server) {
        console.log('Dev server')
      }
    }
  ]
}
```

### 插件顺序控制

```javascript
export default {
  plugins: [
    // 早于 Vite 核心插件
    {
      name: 'pre-plugin',
      enforce: 'pre',
      resolveId(source) {
        console.log('Pre resolve:', source)
      }
    },

    // 普通层（按声明顺序）
    vue(),

    // 晚于 Vite 构建插件
    {
      name: 'post-plugin',
      enforce: 'post',
      transform(code, id) {
        console.log('Post transform:', id)
      }
    }
  ]
}
```

## 插件钩子执行顺序

```
启动阶段（启动时依次执行）：
1. config（修改配置）
2. configResolved（读取最终配置）
3. 开发时：configureServer（配置开发服务器）
   构建时：进入 Rollup 构建流程

构建阶段（构建时执行，开发时按需触发）：
1. buildStart
2. 每个模块：resolveId → load → transform
3. buildEnd
4. closeBundle（产物写入后收尾）

其他钩子：
- transformIndexHtml：处理 index.html 时
- handleHotUpdate：文件变化触发 HMR 时（仅开发服务器）
```

## 使用场景

### 1. 框架支持

**场景**：为 Vue 项目启用 SFC 与 JSX 支持。

```javascript
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default {
  plugins: [vue(), vueJsx()]
}
```

### 2. 组件自动导入

**场景**：模板中的组件按需自动导入。

```javascript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
}
```

### 3. API 自动导入

**场景**：自动导入 Composition API。

```javascript
import AutoImport from 'unplugin-auto-import/vite'

export default {
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    })
  ]
}
```

### 4. 自定义文件处理

**场景**：处理特殊文件格式。

```javascript
export default {
  plugins: [
    {
      name: 'custom-file-handler',
      transform(code, id) {
        if (id.endsWith('.my')) {
          return {
            code: `export default ${JSON.stringify(code)}`,
            map: null
          }
        }
      }
    }
  ]
}
```

### 5. HTML 修改

**场景**：注入 meta 标签或脚本。

```javascript
export default {
  plugins: [
    {
      name: 'html-injector',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          '<meta name="custom" content="value"></head>'
        )
      }
    }
  ]
}
```

## 常用插件

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-vue` | Vue 3 SFC 支持 |
| `@vitejs/plugin-vue-jsx` | Vue JSX 支持 |
| `@vitejs/plugin-legacy` | 浏览器兼容性支持 |
| `unplugin-vue-components` | Vue 组件自动导入 |
| `unplugin-auto-import` | API 自动导入 |
| `unplugin-icons` | 图标自动导入 |
| `unplugin-fonts` | 字体自动导入 |
| `vite-plugin-windicss` | Windi CSS 支持 |
| `vite-plugin-svg-icons` | SVG 图标注册 |
| `vite-plugin-compression` | 生成压缩文件 |
| `rollup-plugin-visualizer` | 打包分析 |

## 注意事项

### 1. 插件顺序

数组中的声明顺序只决定同一层内的先后；跨层顺序由 `enforce` 控制（见上文"插件应用顺序"）。

```javascript
// enforce 控制跨层顺序
plugins: [
  { name: 'pre', enforce: 'pre' },
  { name: 'post', enforce: 'post' }
]
```

### 2. 条件应用插件

```javascript
// 方式一：apply（声明式，Vite 按 command/mode 过滤）
{
  name: 'dev-plugin',
  apply: 'serve'
}

// 方式二：配置期用 falsy 值过滤（Vite 会忽略 false/null/undefined）
plugins: [vue(), isProd && analyzerPlugin()]
```

### 3. 虚拟模块前缀

```javascript
// ✅ 用 \0 前缀标记虚拟模块，避免与真实文件 ID 冲突
resolveId(id) {
  if (id === 'virtual:module') {
    return '\0virtual:module'
  }
}
```

### 4. 异步钩子

```javascript
// ✅ 钩子可以直接声明为 async，或返回 Promise
async transform(code, id) {
  if (id.endsWith('.async')) {
    return await processAsync(code) // 返回转换结果
  }
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions.plugins` | 仅构建时注入的 Rollup 插件（不参与开发服务器） |
| `resolve.alias` | 插件中可能需要依赖别名解析 |
| `server` | `configureServer` 钩子扩展的就是该服务器实例 |

## 完整示例

### Vue 3 完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  plugins: [
    // Vue 支持
    vue({
      template: {
        compilerOptions: {
          // 自定义元素处理
          isCustomElement: (tag) => tag.startsWith('x-')
        }
      }
    }),

    // 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
      include: [/\.vue$/, /\.vue\?vue/]
    }),

    // API 自动导入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json'
      }
    })
  ]
})
```

### 浏览器兼容配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    // 仅在构建时生效（内部通过 apply 区分），为旧浏览器注入 polyfill 与双份产物
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

### 自定义插件集合

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 自定义 HTML 修改插件
function htmlInjectPlugin() {
  return {
    name: 'html-injector',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `
        <head>
        <meta name="application-name" content="My App">
        <meta name="theme-color" content="#ffffff">
        `
      )
    }
  }
}

// 自定义虚拟模块插件
function virtualModulePlugin() {
  const virtualId = 'virtual:config'
  const resolvedVirtualId = '\0' + virtualId

  return {
    name: 'virtual-config',
    resolveId(id) {
      if (id === virtualId) {
        return resolvedVirtualId
      }
    },
    load(id) {
      if (id === resolvedVirtualId) {
        return `export const config = ${JSON.stringify({
          api: process.env.VITE_API_URL,
          version: '1.0.0'
        })}`
      }
    }
  }
}

// 开发工具插件
function devToolsPlugin() {
  return {
    name: 'dev-tools',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        console.log('Server ready')
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    htmlInjectPlugin(),
    virtualModulePlugin(),
    devToolsPlugin()
  ]
})
```

### 条件插件配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 开发环境插件
function createDevPlugins() {
  const plugins = []

  if (process.env.VITE_DEBUG) {
    plugins.push({
      name: 'debug-logger',
      transform(code, id) {
        console.log('Transforming:', id)
        return null
      }
    })
  }

  return plugins
}

// 生产环境插件
function createProdPlugins() {
  const plugins = []

  if (process.env.NODE_ENV === 'production') {
    plugins.push({
      name: 'prod-optimizer',
      transform(code, id) {
        if (id.endsWith('.js') && code.includes('console.log')) {
          // 移除 console.log
          return code.replace(/console\.log\([^)]*\);?/g, '')
        }
      }
    })
  }

  return plugins
}

export default defineConfig(({ mode }) => {
  const plugins = [vue()]

  if (mode === 'development') {
    plugins.push(...createDevPlugins())
  }

  if (mode === 'production') {
    plugins.push(...createProdPlugins())
  }

  return { plugins }
})
```

### TypeScript 类型支持

```typescript
// vite.config.ts
import { defineConfig, type Plugin } from 'vite'

// 返回值标注为 Plugin 后，钩子名写错会在编译期报错
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    apply: 'build',
    transform(code, id) {
      return null
    }
  }
}

export default defineConfig({
  plugins: [myPlugin()]
})
```

## 自定义插件示例

### 修改 HTML

```javascript
function myHtmlPlugin() {
  return {
    name: 'html-injector',
    transformIndexHtml(html, { filename }) {
      return html.replace(
        '</head>',
        '<script src="/custom-script.js"></script></head>'
      )
    }
  }
}
```

### HMR 处理

```javascript
function myHmrPlugin() {
  return {
    name: 'custom-hmr',
    handleHotUpdate(ctx) {
      const { file, server, modules } = ctx

      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'custom-update',
          data: { file }
        })
      }

      return modules
    }
  }
}
```

### 虚拟模块

```javascript
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

### SVG 组件转换

```javascript
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

function svgComponentPlugin() {
  return {
    name: 'svg-component',
    transform(code, id) {
      if (!id.endsWith('.svg')) return null

      const content = readFileSync(id, 'utf-8')

      return {
        code: `export default ${JSON.stringify({
          name: basename(id, '.svg'),
          content
        })}`,
        map: null
      }
    }
  }
}
```

## 常见问题

### 问题 1：插件不生效

**原因**：应用条件与当前阶段不匹配（如 `apply: 'serve'` 的插件在构建中不会运行）。

```javascript
// ✅ 检查插件应用条件
plugins: [
  {
    name: 'test',
    apply: 'serve', // 确认与运行阶段匹配
    configureServer(server) {
      console.log('Plugin applied!')
    }
  }
]
```

### 问题 2：虚拟模块找不到

**原因**：`resolveId` 未返回正确的 ID。

```javascript
// ✅ 用 \0 前缀返回虚拟模块 ID，并在 load 中按同一 ID 匹配
resolveId(id) {
  if (id === 'virtual:module') {
    return '\0virtual:module'
  }
}
```
