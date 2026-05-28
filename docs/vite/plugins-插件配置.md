# plugins 配置

## 定义

`plugins` 配置要使用的 Vite 插件数组，用于扩展 Vite 的功能。

**类型**：

```typescript
(
  | Plugin
  | []
  | [Plugin, ...Plugin[]]
  | [Plugin, { enforce?: 'pre' | 'post'; apply?: 'serve' | 'build' | ((config: UserConfig) => boolean) }]
)[]
```

## 插件格式

完整的 Vite 插件接口：

```typescript
interface Plugin {
  name: string

  // 插件执行顺序
  enforce?: 'pre' | 'post'

  // 应用条件
  apply?: 'serve' | 'build' | ((config: UserConfig) => boolean)

  // 配置相关
  config?: (config: UserConfig, env: { mode: string; command: string }) => UserConfig | null | void
  configResolved?: (resolvedConfig: ResolvedConfig) => void

  // 开发服务器相关
  configureServer?: (server: ViteDevServer) => void | (() => void)
  configurePreviewServer?: (server: PreviewServer) => void | (() => void)
  transformIndexHtml?: (html: string, ctx: TransformIndexHtmlContext) => string | HtmlTagDescriptor[] | null

  // HMR 相关
  handleHotUpdate?: (ctx: HmrContext) => void | Promise<void> | Array<ModuleNode>

  // Rollup 构建钩子
  buildStart?: (options: InputOptions) => void | Promise<void>
  buildEnd?: () => void | Promise<void>
  closeBundle?: () => void | Promise<void>

  // 模块解析
  resolveId?: (source: string, importer: string | undefined, options: { assertions: Record<string, string>; isEntry: boolean }) => string | null | void | Promise<string | null | void>
  load?: (id: string) => string | null | void | Promise<string | null | void>
  transform?: (code: string, id: string) => string | null | void | Promise<string | null | void>

  // 其他
  id?: string
  api?: object
}
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

**默认值**：`undefined`（在 Vite 核心插件之后执行）

控制插件执行顺序。

```javascript
{
  name: 'pre-plugin',
  enforce: 'pre'    // 在 Vite 核心插件之前执行
}

{
  name: 'post-plugin',
  enforce: 'post'   // 在 Vite 核心插件之后执行
}

{
  name: 'normal-plugin'  // 默认，在核心插件之后、post 插件之前
}
```

**执行顺序**：`pre` → Vite 核心 → 默认 → `post`

### apply

**类型**：`'serve' | 'build' | ((config: UserConfig) => boolean)`

**默认值**：`undefined`（始终应用）

控制插件在哪个模式下应用。

```javascript
// 字符串形式
{
  name: 'serve-plugin',
  apply: 'serve'    // 仅在开发环境应用
}

{
  name: 'build-plugin',
  apply: 'build'    // 仅在生产构建时应用
}

// 函数形式
{
  name: 'conditional-plugin',
  apply: (config) => {
    // 自定义条件
    return config.command === 'serve' && config.mode === 'development'
  }
}

// 多条件
{
  name: 'multi-env-plugin',
  apply: (config) => {
    return config.mode === 'development' || process.env.ENABLE_PLUGIN === 'true'
  }
}
```

### config

**类型**：`(config: UserConfig, env: { mode: string; command: string }) => UserConfig | null | void`

在配置解析前修改配置。

```javascript
{
  name: 'config-plugin',
  config(config, { mode, command }) {
    // 返回要合并的配置
    return {
      resolve: {
        alias: {
          '@custom': '/src/custom'
        }
      }
    }

    // 或返回 null 表示不修改
    // return null

    // 或直接修改（不返回）
    // config.resolve ??= {}
    // config.resolve.alias ??= {}
  }
}
```

### configResolved

**类型**：`(resolvedConfig: ResolvedConfig) => void`

在配置解析后执行。

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

配置开发服务器。

```javascript
{
  name: 'server-plugin',
  configureServer(server) {
    // 返回清理函数
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/custom') {
        res.end('Custom response')
      } else {
        next()
      }
    })

    return () => {
      console.log('Server closed')
    }
  }
}
```

### configurePreviewServer

**类型**：`(server: PreviewServer) => void | (() => void)`

配置预览服务器。

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

**类型**：`(html: string, ctx: TransformIndexHtmlContext) => string | HtmlTagDescriptor[] | null`

转换 HTML 内容。

```javascript
{
  name: 'html-plugin',
  transformIndexHtml(html, { path, filename, serverId }) {
    // 返回修改后的 HTML
    return html.replace('<head>', '<head><meta name="custom" content="value">')

    // 或返回要注入的标签
    // return [
    //   {
    //     tag: 'meta',
    //     attrs: { name: 'custom', content: 'value' }
    //   }
    // ]
  }
}
```

### handleHotUpdate

**类型**：`(ctx: HmrContext) => void | Promise<void> | Array<ModuleNode>`

控制 HMR 行为。

```javascript
{
  name: 'hmr-plugin',
  handleHotUpdate(ctx) {
    const { file, server, modules, read } = ctx

    // 过滤受影响的模块
    if (file.endsWith('.custom')) {
      console.log('Custom file updated')
    }

    // 返回过滤后的模块列表
    // return modules.filter(m => !m.id.includes('exclude'))
  }
}
```

### resolveId

**类型**：`(source: string, importer: string | undefined, options: { assertions: Record<string, string>; isEntry: boolean }) => string | null | void | Promise<string | null | void>`

自定义模块解析。

```javascript
{
  name: 'resolve-plugin',
  resolveId(source, importer) {
    if (source === 'virtual:module') {
      return '\0virtual:module'  // \0 前缀表示虚拟模块
    }
    return null  // 继续正常解析
  }
}
```

### load

**类型**：`(id: string) => string | null | void | Promise<string | null | void>`

自定义模块加载。

```javascript
{
  name: 'load-plugin',
  load(id) {
    if (id === '\0virtual:module') {
      return 'export const msg = "Hello from virtual module"'
    }
    return null  // 继续正常加载
  }
}
```

### transform

**类型**：`(code: string, id: string) => string | null | void | Promise<string | null | void>`

转换模块代码。

```javascript
{
  name: 'transform-plugin',
  transform(code, id) {
    if (id.endsWith('.custom')) {
      // 转换代码
      return {
        code: `export default ${JSON.stringify(code)}`,
        map: null
      }
    }
    return null  // 不转换
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
          isCustomElement: (tag) => tag.includes('-')
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
// 方式一：函数形式
const plugins = [vue()]

if (process.env.NODE_ENV === 'development') {
  plugins.push(debugPlugin())
}

export default { plugins }

// 方式二：使用 apply
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
    // 第一个执行
    {
      name: 'pre-plugin',
      enforce: 'pre',
      resolveId(source) {
        console.log('Pre resolve:', source)
      }
    },

    // 默认顺序
    vue(),

    // 最后执行
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
构建时：
1. buildStart
2. configResolved
3. resolveId (每个模块)
4. load (每个模块)
5. transform (每个模块)
6. buildEnd
7. closeBundle

开发时：
1. configResolved
2. configureServer
3. resolveId (按需)
4. load (按需)
5. transform (按需)
6. handleHotUpdate (HMR 时)
```

## 使用场景

### 1. 框架支持

**场景**：使用 Vue、React 等框架

```javascript
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default {
  plugins: [vue()]  // 或 [react()]
}
```

### 2. 组件自动导入

**场景**：自动导入 Vue 组件

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

**场景**：自动导入 Composition API

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

**场景**：处理特殊文件格式

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

**场景**：注入 meta 标签或脚本

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

### 6. 虚拟模块

**场景**：提供不存在的模块

```javascript
export default {
  plugins: [
    {
      name: 'virtual-module',
      resolveId(id) {
        if (id === 'virtual:my-module') {
          return '\0virtual:my-module'
        }
      },
      load(id) {
        if (id === '\0virtual:my-module') {
          return 'export const value = "from virtual module"'
        }
      }
    }
  ]
}
```

## 常用插件

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-vue` | Vue 3 支持 |
| `@vitejs/plugin-react` | React 支持 |
| `@vitejs/plugin-react-swc` | React 支持（SWC，更快） |
| `@vitejs/plugin-legacy` | 浏览器兼容性支持 |
| `@vitejs/plugin-vue-jsx` | Vue JSX 支持 |
| `unplugin-vue-components` | Vue 组件自动导入 |
| `unplugin-auto-import` | API 自动导入 |
| `unplugin-icons` | 图标自动导入 |
| `unplugin-fonts` | 字体自动导入 |
| `vite-plugin-windicss` | Windi CSS 支持 |
| `vite-plugin-svg-icons` | SVG 图标注册 |
| `vite-plugin-compression` | 生成压缩文件 |
| `vite-plugin-imp` | Ant Design 按需加载 |
| `vite-plugin-cesium` | Cesium 集成 |
| `rollup-plugin-visualizer` | 打包分析 |

## 注意事项

### 1. 插件顺序

```javascript
// ✅ 正确：按顺序执行
plugins: [
  prePlugin(),
  corePlugin(),
  postPlugin()
]

// enforce 控制更精确
plugins: [
  { name: 'pre', enforce: 'pre' },
  { name: 'post', enforce: 'post' }
]
```

### 2. 插件应用条件

```javascript
// ❌ 错误：在插件内部使用环境变量
export default {
  plugins: [
    process.env.NODE_ENV === 'development' ? devPlugin() : null
  ].filter(Boolean)
}

// ✅ 正确：使用 apply
export default {
  plugins: [
    {
      name: 'dev-plugin',
      apply: 'serve',
      ...devPlugin()
    }
  ]
}
```

### 3. 虚拟模块前缀

```javascript
// ✅ 使用 \0 前缀标记虚拟模块
resolveId(id) {
  if (id === 'virtual:module') {
    return '\0virtual:module'
  }
}
```

### 4. 异步钩子

```javascript
// ✅ 可以使用 async/await
transform(code, id) {
  if (id.endsWith('.async')) {
    return processAsync(code)
  }
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions.plugins` | 仅构建时的 Rollup 插件 |
| `resolve.alias` | 插件中可能需要配置别名 |
| `server` | configureServer 钩子依赖服务器配置 |

## 完整示例

### Vue 3 完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

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
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json'
      }
    })
  ]
})
```

### React 完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  plugins: [
    react({
      // 使用 SWC（更快）
      jsxImportSource: undefined,
      babel: {
        plugins: ['babel-plugin-styled-components']
      }
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
        console.log('\n🚀 Server ready!\n')
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
        if (id.includes('console.log')) {
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
// vite-env.d.ts
import 'vite'

declare module 'vite/config' {
  interface Plugin {
    // 自定义插件类型扩展
    customOption?: string
  }
}
```

## 自定义插件示例

### 修改 HTML

```javascript
function myHtmlPlugin() {
  return {
    name: 'html-injector',
    transformIndexHtml(html, { path }) {
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
function svgComponentPlugin() {
  return {
    name: 'svg-component',
    transform(code, id) {
      if (!id.endsWith('.svg')) return null

      const content = readFileSync(id, 'utf-8')

      return {
        code: `
        export default {
          name: '${path.basename(id, '.svg')}',
          content: \`${content}\`
        }
        `,
        map: null
      }
    }
  }
}
```

## 常见问题

### 问题 1：插件不生效

**原因**：插件顺序或应用条件错误

```javascript
// ✅ 检查插件应用条件
plugins: [
  {
    name: 'test',
    apply: 'serve',  // 确认是否正确
    configureServer(server) {
      console.log('Plugin applied!')
    }
  }
]
```

### 问题 2：虚拟模块找不到

**原因**：resolveId 未返回正确的 ID

```javascript
// ✅ 使用 \0 前缀
resolveId(id) {
  if (id === 'virtual:module') {
    return '\0virtual:module'  // 必须 \0 前缀
  }
}
```

## 官方文档

[Plugins: plugins - Vite 官方文档](https://cn.vitejs.dev/guide/using-plugins.html)

[Plugin API - Vite 官方文档](https://cn.vitejs.dev/guide/api-plugin.html)
