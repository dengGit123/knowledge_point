# ssr 配置

## 定义

`ssr` 配置服务端渲染（SSR）相关选项，控制 SSR 构建的行为和依赖处理方式。

**类型**：

```typescript
{
  noExternal?: string[] | true | RegExp | ((id: string) => boolean)
  external?: string[]
  target?: 'node' | 'webworker'
  ssrLoadModule?: (url: string) => Promise<any>
}
```

**默认值**：

```javascript
{
  noExternal: [],
  external: [],
  target: 'node',
  ssrLoadModule: undefined
}
```

## 子属性详解

### noExternal

**类型**：`string[] | true | RegExp | ((id: string) => boolean)`

**默认值**：`[]`

强制将依赖进行 SSR 打包（即使它们是 ESM 格式）。

```javascript
// 字符串数组
noExternal: ['vue', 'vue-router'],

// 全部打包
noExternal: true,

// 正则匹配
noExternal: /^@scope\/.*/,

// 函数判断
noExternal: (id) => id.includes('custom')
```

### external

**类型**：`string[]`

**默认值**：`[]`

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

### ssrLoadModule

**类型**：`(url: string) => Promise<any>`

**默认值**：`undefined`

自定义 SSR 模块加载函数。

```javascript
ssrLoadModule: (url) => {
  // 自定义加载逻辑
  return import(url)
}
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: [],
    external: [],
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

```javascript
export default {
  ssr: {
    ssrLoadModule: (url) => {
      console.log('Loading module:', url)
      return import(url)
    }
  }
}
```

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
    // 匹配 @my-scope 下所有包
    noExternal: /^@my-scope\/.*/,

    // 或使用函数
    noExternal: (id) => {
      return id.startsWith('@my-org/') || id.includes('custom')
    }
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
// Node.js 环境
ssr: {
  target: 'node',
  external: ['fs', 'path', 'url']  // Node.js 内置模块
}

// Web Worker 环境
ssr: {
  target: 'webworker'  // 不能外部化 Node 模块
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
    // 生成 SSR 构建产物
    ssr: true,
    // 生成 CSS 清单
    ssrManifest: true
  }
})
```

```bash
# 构建命令
vite build

# SSR 入口
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

### 自定义 SSR 加载器

```javascript
// vite.config.js
export default defineConfig({
  ssr: {
    ssrLoadModule: async (url) => {
      // 添加缓存
      const cache = new Map()

      if (cache.has(url)) {
        return cache.get(url)
      }

      const module = await import(url)
      cache.set(url, module)

      return module
    }
  }
})
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
    ssrManifest: true  // 生成 CSS 清单
  }
}
```

## 官方文档

[SSR Config: ssr - Vite 官方文档](https://cn.vitejs.dev/config/ssr-options.html)

[SSR: Source Maps - Vite 官方文档](https://cn.vitejs.dev/guide/ssr.html)
