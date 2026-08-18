# ssr 配置

## 定义

`ssr` 配置服务端渲染（SSR）相关选项，控制 SSR 构建的行为和依赖处理方式。

**类型**：

```typescript
{
  noExternal?: string | RegExp | (string | RegExp)[] | true
  external?: string[] | true
  target?: 'node' | 'webworker'
  optimizeDeps?: {}   // SSR 场景的依赖优化配置（实验性）
  resolve?: {
    conditions?: string[]
    externalConditions?: string[]
  }
}
```

**默认值**：

```javascript
{
  noExternal: undefined,
  external: undefined,
  target: 'node'
}
```

## 子属性详解

### noExternal

**类型**：`string | RegExp | (string | RegExp)[] | true`

**默认值**：`undefined`

强制将依赖进行 SSR 打包（即不外部化，打进产物）。

```javascript
// 字符串数组
noExternal: ['vue', 'vue-router'],

// 全部打包
noExternal: true,

// 正则匹配
noExternal: /^@scope\/.*/
```

### external

**类型**：`string[] | true`

**默认值**：`undefined`（自动外部化——linked 依赖/Node 内置模块默认外部化）

强制将依赖标记为外部依赖（不打包）。

```javascript
external: ['koa', 'express', 'pg']
```

### target

**类型**：`'node' | 'webworker'`

**默认值**：`'node'`

SSR 构建目标环境。

```javascript
// Node.js 环境（默认）
target: 'node',

// Web Worker 环境
target: 'webworker'
```

### 关于 ssrLoadModule

> ⚠️ **注意**：`ssrLoadModule` **不是** `ssr` 配置项，而是开发服务器（`ViteDevServer`）实例上的**方法**，用于在 Node 环境中按需加载 SSR 模块：

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
export default {
  ssr: {
    noExternal: true  // 打包所有依赖
  }
}
```

### 指定打包的依赖

```javascript
export default {
  ssr: {
    noExternal: ['vue', 'vue-router', 'pinia']
  }
}
```

### 指定外部依赖

```javascript
export default {
  ssr: {
    external: ['express', 'koa', 'pg', 'redis']
  }
}
```

### Web Worker SSR

```javascript
export default {
  ssr: {
    target: 'webworker'
  }
}
```

### 自定义模块加载

如需自定义 SSR 模块加载，请在服务器侧直接调用 `vite.ssrLoadModule()` 方法（见上文说明），或使用 `createViteRuntime` 等高级 API，而不是通过 `ssr` 配置项。

## 生效后的结果示例

### Nuxt/Astro 应用

```javascript
// vite.config.js
export default {
  ssr: {
    // Vue 生态系统通常需要打包
    noExternal: ['vue', '@vue/', 'vue-router']
  }
}
```

```bash
# SSR 构建命令
vite build --ssr src/entry-server.js
```

### Node.js 服务

```javascript
// vite.config.js
export default {
  ssr: {
    // 框架依赖打包，服务端库外置
    noExternal: ['vue', 'vue-router'],
    external: ['express', 'mongodb']
  }
}
```

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
    // 匹配 @my-scope 下所有包（支持正则）
    noExternal: /^@my-scope\/.*/
  }
}
```

## 使用场景

### 1. Vue SSR 应用

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: ['vue', '@vue/', 'vue-router', 'pinia']
  }
}
```

### 2. 自定义 SSR 服务

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: ['react', 'react-dom'],
    external: ['express', 'compression']
  }
}
```

### 3. Monorepo SSR

```javascript
// vite.config.js
export default {
  ssr: {
    // 打包内部包，外部化 npm 包
    noExternal: /^@my-app\//,
    external: ['express', 'lodash']
  }
}
```

### 4. 开发时快速重新加载

```javascript
// vite.config.js
export default {
  ssr: {
    // 开发时打包，生产时外部化
    noExternal: process.env.NODE_ENV === 'development' ? ['vue'] : []
  }
}
```

## 注意事项

### 1. noExternal 与 external 互斥

```javascript
// 同一个依赖不能同时配置
// ❌ 错误
ssr: {
  noExternal: ['express'],
  external: ['express']
}

// ✅ 正确：二选一
ssr: {
  external: ['express']  // 不打包 express
}
```

### 2. ESM 与 CJS 依赖

```javascript
// ESM 依赖默认会外部化
// 需要打包时使用 noExternal
ssr: {
  noExternal: ['some-esm-package']
}
```

### 3. 目标环境差异

```javascript
// Node.js 环境（默认）——Node 内置模块（fs、path 等）自动被外部化，无需手动配置
ssr: {
  target: 'node'
}

// Web Worker 环境（如 Cloudflare Workers）——依赖会被打包进产物而非外部化
ssr: {
  target: 'webworker'
}
```

### 4. CSS 处理

SSR 构建不处理 CSS（由框架处理）：

```javascript
// Vite SSR 构建会忽略 CSS
// CSS 需要在框架层面处理
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `optimizeDeps.disabled` | SSR 构建时通常禁用依赖预构建 |
| `build.ssr` | 是否生成 SSR 构建产物 |
| `build.ssrManifest` | 生成 CSS 资源清单 |

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
    noExternal: ['vue', '@vue/', 'vue-router', 'pinia']
  },

  build: {
    // 生成 CSS 资源清单（供 hydration 时加载客户端资源）
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

### 全栈应用

```javascript
// vite.config.js
export default defineConfig({
  ssr: {
    // 框架打包
    noExternal: ['react', 'react-dom', 'react-router-dom'],

    // 服务端库外部化
    external: [
      'express',
      'compression',
      'mongoose',
      'jsonwebtoken',
      'nodemailer'
    ],

    target: 'node'
  }
})
```

### Monorepo SSR

```javascript
// packages/app/vite.config.js
export default defineConfig({
  ssr: {
    // 打包内部包
    noExternal: /^@my-monorepo\//,

    // 外部化第三方服务包
    external: ['express', 'microservice-client']
  }
})
```

### 开发/生产不同配置

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    ssr: {
      // 开发时打包更多依赖便于调试
      noExternal: isDev
        ? ['vue', '@vue/', 'vue-router', 'pinia']
        : ['vue', '@vue/'],

      // 生产时外部化更多依赖
      external: isDev
        ? []
        : ['express', 'compression']
    }
  }
})
```

### 自定义 SSR 加载器（带缓存）

在服务器代码中使用 `vite.ssrLoadModule()` 并自行封装缓存：

```javascript
// server.js
import { createServer as createViteServer } from 'vite'

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// 带缓存的模块加载
const cache = new Map()

async function loadSsrModule(url) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  const module = await vite.ssrLoadModule(url)
  cache.set(url, module)
  return module
}

const { render } = await loadSsrModule('/src/entry-server.js')
```

## 常见问题

### 问题 1：SSR 构建后模块找不到

**原因**：依赖被外部化但运行时不可用

```javascript
// ❌ 错误配置
ssr: {
  external: ['some-custom-lib']  // 该库不在 node_modules 中
}

// ✅ 正确配置
ssr: {
  noExternal: ['some-custom-lib']  // 打包进去
}
```

### 问题 2：ESM 依赖报错

**原因**：ESM 依赖默认被外部化

```javascript
// ❌ 报错：Cannot find module
// ✅ 解决：打包 ESM 依赖
ssr: {
  noExternal: ['some-esm-package']
}
```

### 问题 3：CSS 未加载

**原因**：SSR 构建不处理 CSS

**解决**：使用框架的 SSR 处理或构建清单

```javascript
export default {
  build: {
    // 生成资源清单（记录客户端构建的 JS/CSS 产物映射，供 SSR 框架注入 <link>/<script>）
    ssrManifest: true
  }
}
```

## 官方文档

[SSR Config: ssr - Vite 官方文档](https://cn.vitejs.dev/config/ssr-options.html)

[SSR: Source Maps - Vite 官方文档](https://cn.vitejs.dev/guide/ssr.html)
