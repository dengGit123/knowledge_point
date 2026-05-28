# optimizeDeps 配置

## 定义

`optimizeDeps` 配置依赖预构建行为，控制 Vite 如何转换和缓存依赖。

**类型**：

```typescript
{
  include?: string[]
  exclude?: string[]
  needsInterop?: string[]
  esbuildOptions?: EsbuildOptions
  force?: boolean
  disabled?: boolean | 'build'
  noDiscovery?: boolean
  entries?: string[]
}
```

**默认值**：

```javascript
{
  include: [],
  exclude: [],
  needsInterop: [],
  esbuildOptions: {},
  force: false,
  disabled: false,
  noDiscovery: false,
  entries: []
}
```

## 子属性详解

### include

**类型**：`string[]`

**默认值**：`[]`

强制预构建的依赖，即使不在自动扫描中发现。

```javascript
// 指定需要预构建的依赖
include: ['vue', 'vue-router', 'axios']

// Monorepo 中的本地包
include: ['@my-app/shared', '@my-app/utils']

// 使用 glob 模式
include: ['@my-app/*']

// ESM 格式的依赖
include: ['some-esm-library']
```

### exclude

**类型**：`string[]`

**默认值**：`[]`

排除预构建的依赖，这些依赖将按原样处理。

```javascript
// 排除本地包
exclude: ['your-local-package']

// 排除不需要预构建的依赖
exclude: ['big-library']

// 排除调试包
exclude: ['debug-package']
```

### needsInterop

**类型**：`string[]`

**默认值**：`[]`

标记需要转换为 CommonJS 兼容格式的 ESM 依赖。

```javascript
// 需要互操作的 ESM 包
needsInterop: ['some-esm-package']

// 常见需要互操作的包
needsInterop: ['lodash-es', 'classnames']
```

### esbuildOptions

**类型**：`EsbuildOptions`

**默认值**：`{}`

传递给 esbuild 的选项，用于预构建过程。

```javascript
esbuildOptions: {
  // 目标环境
  target: 'es2015',
  target: 'es2020',
  target: ['chrome58', 'edge16'],

  // 全局定义
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"development"'
  },

  // JSX 配置
  jsx: 'automatic',    // 自动 JSX
  jsx: 'preserve',     // 保留 JSX
  jsxFactory: 'h',     // JSX 工厂函数
  jsxFrag: 'Fragment', // JSX 片段

  // Loader 配置
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
    '.md': 'text'
  },

  // 插件
  plugins: [customEsbuildPlugin()],

  // 其他选项
  keepNames: false,
  minify: false,
  minifyIdentifiers: false,
  minifyWhitespace: false,
  minifySyntax: false
}
```

### force

**类型**：`boolean`

**默认值**：`false`

强制重新预构建所有依赖，忽略缓存。

```javascript
force: false  // 使用缓存（默认）
force: true   // 强制重新构建
```

### disabled

**类型**：`boolean | 'build'`

**默认值**：`false`

禁用依赖预构建。

```javascript
// 完全禁用
disabled: true

// 仅在构建时禁用（用于 SSR）
disabled: 'build'

// 根据环境
disabled: process.env.NODE_ENV === 'production'
```

### noDiscovery

**类型**：`boolean`

**默认值**：`false`

禁用自动依赖发现，仅预构建 `include` 中的依赖。

```javascript
noDiscovery: false  // 自动扫描（默认）
noDiscovery: true   // 仅预构建 include 中的依赖
```

### entries

**类型**：`string[]`

**默认值**：`[]`（自动检测入口文件）

指定用于依赖扫描的入口文件。

```javascript
// 单入口
entries: ['src/main.js']

// 多入口（多页面应用）
entries: ['src/main.js', 'src/renderer.js']

// TypeScript 入口
entries: ['src/main.ts']
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: [],
    exclude: [],
    needsInterop: [],
    esbuildOptions: {},
    force: false,
    disabled: false,
    noDiscovery: false,
    entries: []
  }
}
```

### 基础预构建配置

```javascript
export default {
  optimizeDeps: {
    // 强制预构建
    include: ['vue', 'element-plus'],
    // 排除某些依赖
    exclude: ['@monorepo/local-pkg']
  }
}
```

### esbuild 选项配置

```javascript
export default {
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      jsx: 'automatic',
      loader: {
        '.js': 'jsx'
      }
    }
  }
}
```

### SSR 应用配置

```javascript
export default {
  optimizeDeps: {
    // SSR 构建时禁用预构建
    disabled: 'build'
  }
}
```

### 强制重新构建

```javascript
export default {
  optimizeDeps: {
    // 强制重新预构建
    force: true
  }
}
```

### 仅预构建指定依赖

```javascript
export default {
  optimizeDeps: {
    // 禁用自动发现
    noDiscovery: true,
    // 仅预构建这些依赖
    include: ['vue', 'vue-router']
  }
}
```

## 生效后的结果示例

### 预构建前

```javascript
// node_modules/vue/dist/vue.runtime.esm.js
// 多个文件需要单独请求
import { createApp } from 'vue'
// → 需要请求 vue.runtime.esm.js
// → 及其依赖的多个文件
```

### 预构建后

```javascript
// node_modules/.vite/deps/vue.js
// 所有依赖打包到一个文件
import { createApp } from 'vue'
// → 单次请求 vite/deps/vue.js
```

### needsInterop 生效

```javascript
// 配置前：某些 ESM 包导入失败
import pkg from 'some-esm-package'
// Error: Default export is not available

// 配置后
optimizeDeps: {
  needsInterop: ['some-esm-package']
}
import pkg from 'some-esm-package'
// 正常工作
```

### esbuildOptions.define 生效

```javascript
// vite.config.js
optimizeDeps: {
  esbuildOptions: {
    define: {
      global: 'globalThis'
    }
  }
}

// 预构建时
// global → globalThis
```

## 使用场景

### 1. Monorepo 本地包

**场景**：Monorepo 中的本地包需要预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建本地包
    include: [
      '@my-app/shared',
      '@my-app/ui-components',
      '@my-app/utils'
    ]
  }
}
```

### 2. ESM 包互操作

**场景**：某些 ESM 包需要 default 导出支持

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 标记需要互操作的包
    needsInterop: ['lodash-es', 'classnames', 'some-esm-lib']
  }
}
```

### 3. SSR 应用

**场景**：SSR 构建时禁用预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 仅开发环境预构建
    disabled: 'build'
  }
}
```

### 4. 调试预构建

**场景**：强制重新预构建排查问题

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制重新构建
    force: true
  }
}
```

### 5. 自定义 JSX 处理

**场景**：预构建时需要 JSX 转换

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'vue'
    }
  }
}
```

### 6. 性能优化

**场景**：仅预构建必要依赖，加快启动

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 禁用自动发现
    noDiscovery: true,
    // 仅预构建核心依赖
    include: ['vue', 'vue-router', 'pinia']
  }
}
```

## 注意事项

### 1. 配置修改需要重启

```javascript
// ⚠️ 修改 optimizeDeps 配置后
// 需要重启开发服务器才能生效

// 可以使用 --force 参数
// vite dev --force
```

### 2. 缓存位置

```javascript
// 预构建缓存存储在 cacheDir 中
// 默认：node_modules/.vite/deps

// 可以通过 cacheDir 修改
export default {
  cacheDir: 'vite-cache'
}
```

### 3. include 与 exclude

```javascript
// ⚠️ 同一个依赖不能同时配置
// ❌ 错误
optimizeDeps: {
  include: ['vue'],
  exclude: ['vue']
}

// ✅ 正确：二选一
optimizeDeps: {
  include: ['vue']
}
```

### 4. needsInterop 谨慎使用

```javascript
// ⚠️ needsInterop 会影响打包结果
// 仅在确实需要时使用

// ✅ 建议：优先尝试不加
// 遇到 "Default export is not available" 时再加
optimizeDeps: {
  needsInterop: ['problematic-package']
}
```

### 5. disabled: 'build' 场景

```javascript
// disabled: 'build' 主要用于 SSR 应用
// 开发环境仍会预构建，构建时跳过

optimizeDeps: {
  disabled: 'build'
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `cacheDir` | 预构建缓存存储位置 |
| `resolve.alias` | 别名影响依赖解析和预构建 |
| `build.commonjsOptions` | 生产构建的 CJS 处理配置 |
| `server.fs.allow` | 文件系统访问权限影响依赖扫描 |

## 工作原理

```
┌──────────────────────────────────────────┐
│  1. 扫描项目中的依赖                     │
│     → 读取 entries 文件                   │
│     → 分析 import 语句                     │
│     → 发现所有使用的依赖                   │
├──────────────────────────────────────────┤
│  2. 将 CJS 转换为 ESM                    │
│     → 使用 esbuild 转换                   │
│     → 处理 needsInterop 标记              │
├──────────────────────────────────────────┤
│  3. 使用 esbuild 打包                     │
│     → 合并多个文件                         │
│     → 应用 esbuildOptions                 │
├──────────────────────────────────────────┤
│  4. 缓存到 node_modules/.vite/deps      │
│     → 生成 _metadata.json                 │
│     → 记录依赖关系                         │
├──────────────────────────────────────────┤
│  5. 后续直接使用缓存                     │
│     → 跳过扫描和转换                       │
│     → 快速启动开发服务器                   │
└──────────────────────────────────────────┘
```

## 完整示例

### Vue 应用完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  optimizeDeps: {
    // 强制预构建 Vue 生态
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core'
    ],

    // 排除本地包
    exclude: [
      '@my-app/local-utils'
    ],

    // esbuild 配置
    esbuildOptions: {
      target: 'es2020',
      define: {
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
      }
    }
  }
})
```

### Monorepo 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    // 预构建 workspace 包
    include: [
      '@workspace/shared',
      '@workspace/ui',
      '@workspace/utils'
    ],

    // 禁用自动发现（加快启动）
    noDiscovery: true,

    // esbuild 配置
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
```

### React 应用配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    // React 相关依赖
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],

    // JSX 处理
    esbuildOptions: {
      jsx: 'automatic',
      loader: {
        '.js': 'jsx'
      }
    }
  }
})
```

### SSR 应用配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    // SSR 构建时禁用预构建
    disabled: 'build',

    // 开发环境强制预构建某些依赖
    include: ['@ssr/async-component']
  }
})
```

### 多入口配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 指定多入口用于依赖扫描
    entries: [
      'src/main.js',
      'src/renderer.js',
      'src/preload.js'
    ]
  }
})
```

### 开发调试配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制重新构建
    force: true,

    // 启用详细日志
    esbuildOptions: {
      logLevel: 'verbose'
    }
  }
}
```

## 常见问题

### 问题 1：本地包没有正确预构建

**原因**：Vite 自动扫描无法发现本地包

**解决**：

```javascript
// ✅ 使用 include
optimizeDeps: {
  include: ['@monorepo/shared']
}
```

### 问题 2：ESM 包需要 default 导出

**原因**：某些 ESM 包使用了 `module.exports`

**解决**：

```javascript
// ✅ 使用 needsInterop
optimizeDeps: {
  needsInterop: ['some-esm-package']
}
```

### 问题 3：预构建缓存导致问题

**原因**：缓存过期或损坏

**解决**：

```bash
# 方法一：删除缓存
rm -rf node_modules/.vite

# 方法二：使用 --force
vite dev --force

# 方法三：配置 force
optimizeDeps: {
  force: true
}
```

### 问题 4：某些库不支持预构建

**原因**：库使用了 Node.js 特性

**解决**：

```javascript
// ✅ 使用 exclude
optimizeDeps: {
  exclude: ['node-only-library']
}
```

### 问题 5：JSX 组件预构建失败

**原因**：esbuild 需要 JSX 配置

**解决**：

```javascript
// ✅ 配置 loader
optimizeDeps: {
  esbuildOptions: {
    loader: {
      '.js': 'jsx'
    }
  }
}
```

## 命令行用法

```bash
# 强制重新预构建
vite dev --force

# 清除缓存后启动
vite dev --force

# 预览预构建缓存
ls node_modules/.vite/deps
```

## 官方文档

[Dep Optimization: optimizeDeps - Vite 官方文档](https://cn.vitejs.dev/config/dep-optimization-options.html)

[Dependency Pre-Bundling - Vite 官方文档](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
