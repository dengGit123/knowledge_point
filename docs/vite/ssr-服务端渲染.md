# ssr 配置

> 📖 [官方文档：SSR Options](https://cn.vitejs.dev/config/ssr-options.html)
>
> 📖 [官方文档：SSR 服务端渲染指南](https://cn.vitejs.dev/guide/ssr.html)

## 定义

`ssr` 配置服务端渲染（SSR）相关选项，控制 SSR 构建的行为和依赖处理方式。

**类型**：

```typescript
{
  noExternal?: string | RegExp | (string | RegExp)[] | true
  external?: string[] | true
  target?: string                      // SSR 构建目标，默认 'node'
  optimizeDeps?: OptimizeDepsOptions   // SSR 依赖预构建（实验性），仅部分字段生效
  resolve?: {
    conditions?: string[]              // SSR 解析导入时追加的条件
    externalConditions?: string[]      // 解析外部化依赖时使用的条件
  }
}
```

**默认值**：

```javascript
{
  noExternal: undefined,  // 默认只有 linked 依赖（file: 协议、workspace 符号链接）被打包
  external: undefined,    // 默认 node_modules 中的依赖全部外部化（不打包）
  target: 'node'
}
```

## 子属性详解

### noExternal

**类型**：`string | RegExp | (string | RegExp)[] | true`

**默认值**：`undefined`

在 SSR 构建中阻止依赖被外部化，即强制打包进产物。设为 `true` 表示打包全部依赖（包括 linked 依赖）。

```javascript
// vite.config.js
export default {
  ssr: {
    // 字符串数组：按包名匹配，强制打包
    noExternal: ['vue', 'vue-router'],

    // 也可以用正则，例如打包 @scope 下所有包：
    // noExternal: /^@scope\/.*/

    // 或设为 true，打包全部依赖（包括 linked 依赖）：
    // noExternal: true
  }
}
```

> ⚠️ **注意：** 同一个包同时命中 `noExternal` 与 `external` 时，`noExternal` 优先级更高。

### external

**类型**：`string[] | true`

**默认值**：`undefined`（默认行为：`node_modules` 中的依赖全部外部化，linked 依赖被打包）

强制将依赖外部化（跳过打包），运行时由 Node 从 `node_modules` 原生加载。设为 `true` 表示外部化所有依赖（包括 linked 依赖）。

```javascript
// vite.config.js
export default {
  ssr: {
    // 服务端专用库无需 Vite 转换，保持外部化可加快构建
    external: ['koa', 'express', 'pg']
  }
}
```

> 💡 **提示：** 外部化依赖在开发时通过 Node 原生 `import`/`require` 加载，不经过 Vite 转换管线，因此修改这些包的代码不会触发热更新。需要即时调试时改用 `noExternal` 打包。

### target

**类型**：`string`（常用 `'node'` | `'webworker'`）

**默认值**：`'node'`

SSR 构建目标环境。

```javascript
// vite.config.js
export default {
  ssr: {
    // Node.js 环境（默认）
    target: 'node'
  }
}
```

```javascript
// vite.config.js
export default {
  ssr: {
    // Web Worker 运行时（如 Cloudflare Workers）
    target: 'webworker'
  }
}
```

### resolve.conditions

**类型**：`string[]`

**默认值**：`[]`

在 SSR 解析导入时额外生效的解析条件，只影响 SSR 构建，不影响客户端构建。

```javascript
// vite.config.js
export default {
  ssr: {
    resolve: {
      // 让包优先命中 package.json exports 中带 "production" 条件的导出
      conditions: ['production']
    }
  }
}
```

### resolve.externalConditions

**类型**：`string[]`

**默认值**：`['node']`

加载与解析外部化依赖时使用的条件：开发时 Node 原生导入、构建时解析包导出都会参考它。

### optimizeDeps

**类型**：`OptimizeDepsOptions`（实验性）

为 SSR 场景单独配置依赖预构建（如 `include`、`esbuildOptions`），与顶层的 `optimizeDeps` 相互独立。

### ssrLoadModule（不是 ssr 配置项）

> ⚠️ **注意：** `ssrLoadModule` 不是 `ssr` 配置项，而是开发服务器（`ViteDevServer`）实例上的**方法**，用于在 Node 环境中按需加载并执行 SSR 模块：

```javascript
// server.js（自定义 SSR 服务器）
import { createServer } from 'vite'

// 创建 Vite 开发服务器
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// 用 ssrLoadModule 加载源码模块（享受即时编译，无需预构建）
const { render } = await vite.ssrLoadModule('/src/entry-server.js')

// 生产模式下改用 build 产物
// const { render } = await import('./dist/server/entry-server.js')
```

Vite 内部会缓存已执行的 SSR 模块，并随 HMR 自动失效，无需自己再封装缓存。生产环境则直接 `import` 构建产物。

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  ssr: {
    target: 'node'
  }
}
```

### 强制打包所有依赖

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: true
  }
}
```

### 指定打包的依赖

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: ['vue', 'vue-router', 'pinia']
  }
}
```

### 指定外部依赖

```javascript
// vite.config.js
export default {
  ssr: {
    external: ['express', 'koa', 'pg', 'redis']
  }
}
```

### Web Worker SSR

```javascript
// vite.config.js
export default {
  ssr: {
    target: 'webworker'
  }
}
```

## 生效后的结果示例

### 典型产物布局

```javascript
// vite.config.js
export default {
  ssr: {
    // 框架依赖打包，服务端库外部化
    noExternal: ['vue', 'vue-router'],
    external: ['express', 'mongodb']
  }
}
```

典型手动 SSR 项目的产物布局（具体路径取决于各次构建的 `outDir` 与入口配置）：

```
dist/
├── client/           # 客户端资源
├── server/           # SSR 构建产物
│   └── index.js      # 服务端入口
└── index.html
```

### 正则匹配依赖

```javascript
// vite.config.js
export default {
  ssr: {
    // 打包 @my-scope 下所有包
    noExternal: /^@my-scope\/.*/
  }
}
```

### 框架托管的 SSR

Nuxt、Astro 等框架已内置并自动管理 SSR 相关配置（依赖外部化、入口产物等），一般不需要手动设置 `ssr` 选项。

## 使用场景

### 1. Vue SSR 应用

```javascript
// vite.config.js
export default {
  ssr: {
    // Vue 生态包打包进 SSR 产物：统一模块实例，并让代码走 Vite 转换管线
    noExternal: ['vue', 'vue-router', 'pinia']
  }
}
```

### 2. 自定义 SSR 服务

```javascript
// vite.config.js
export default {
  ssr: {
    // 框架依赖打包，服务端库外部化
    noExternal: ['vue', 'vue-router'],
    external: ['express', 'compression']
  }
}
```

## 注意事项

### 1. noExternal 与 external 的优先级

两者并不互斥，但不要给同一个包同时配置（可读性差）。若同时命中，`noExternal` 优先：

```javascript
// vite.config.js
export default {
  ssr: {
    // express 同时命中两者，noExternal 优先 → express 会被打包
    noExternal: ['express'],
    external: ['express']
  }
}
```

```javascript
// ✅ 推荐：每个包只在一处声明
export default {
  ssr: {
    external: ['express']  // express 保持外部化
  }
}
```

### 2. 外部化依赖不经过 Vite 转换

外部化依赖由 Node 原生加载，ESM-only 包需要运行环境支持原生 ESM；遇到加载报错时改用 `noExternal` 打包：

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: ['some-esm-package']
  }
}
```

### 3. 目标环境差异

```javascript
// vite.config.js
export default {
  ssr: {
    // Node.js（默认）：依赖默认外部化，Node 内置模块（fs、path 等）始终外部化，无需手动配置
    target: 'node'
  }
}
```

```javascript
// vite.config.js
export default {
  ssr: {
    // Web Worker 运行时（如 Cloudflare Workers）：没有 Node 运行时与内置模块，
    // 通常配合 noExternal: true 将依赖全部打进产物
    target: 'webworker',
    noExternal: true
  }
}
```

### 4. CSS 处理

SSR 构建会跳过 CSS（及其它资源）的处理，样式需要在框架/服务端层面组织：

```javascript
// vite.config.js
export default {
  build: {
    // 生成 SSR 清单：记录客户端产物中样式、预加载与资源链接的映射，
    // 供服务端在 hydration 前注入对应标签
    ssrManifest: true
  }
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.ssr` | 指定 SSR 构建入口（也可用 CLI `--ssr` 指定） |
| `build.ssrManifest` | 生成收集样式、预加载与资源链接的 SSR 清单 |
| `optimizeDeps` | 顶层预构建配置；SSR 场景由 `ssr.optimizeDeps` 单独控制（实验性） |
| `resolve.conditions` | 客户端与公共解析条件；SSR 专用条件用 `ssr.resolve.conditions` |

## 完整示例

### Vue SSR 应用

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  ssr: {
    // 打包 Vue 生态
    noExternal: ['vue', 'vue-router', 'pinia']
  },

  build: {
    // 生成 SSR 清单，供服务端注入客户端样式与资源链接
    ssrManifest: true
  }
})
```

```bash
# 构建客户端产物
vite build

# 构建 SSR 产物（--ssr 指定服务端入口）
vite build --ssr src/entry-server.js
```

### 开发/生产不同配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    ssr: {
      // 开发时打包更多依赖：获得 Vite 转换与热更新，便于调试
      noExternal: isDev ? ['vue', 'vue-router', 'pinia'] : [],

      // 生产时外部化服务端库：产物更小、构建更快
      external: isDev ? [] : ['express', 'compression']
    }
  }
})
```

### Monorepo SSR

```javascript
// packages/app/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    // workspace 内部包是 linked 依赖，默认就会被打包，这里显式声明更清晰
    noExternal: /^@my-monorepo\//,

    // 外部化第三方服务包
    external: ['express']
  }
})
```

## 常见问题

### 问题 1：SSR 构建后模块找不到

**原因**：依赖被外部化，但运行环境中不存在该包（例如 linked 的内部包被手动 external）。

```javascript
// ❌ 错误：包不在 node_modules 中，原生加载时找不到
ssr: {
  external: ['some-custom-lib']
}
```

```javascript
// ✅ 正确：打包进产物
ssr: {
  noExternal: ['some-custom-lib']
}
```

### 问题 2：ESM 依赖加载报错

**原因**：外部化依赖由 Node 原生加载，ESM-only 包在 CJS 环境下无法被 `require`。

```javascript
// ✅ 解决：打包该依赖，由 Rollup 完成 ESM/CJS 互操作
ssr: {
  noExternal: ['some-esm-package']
}
```

### 问题 3：样式未加载

**原因**：SSR 构建跳过 CSS 处理，服务端不知道客户端产物里有哪些样式文件。

**解决**：开启 `build.ssrManifest` 生成清单，由服务端在 HTML 中注入样式链接（见上文「CSS 处理」）。
