# resolve 配置

## 定义

`resolve` 配置模块解析行为，包括别名、扩展名、入口文件、导出条件等，控制 Vite 如何查找和处理模块。

**类型**：

```typescript
{
  alias?: Record<string, string> | Array<{ find: string | RegExp; replacement: string }>
  extensions?: string[]
  mainFields?: string[]
  conditions?: string[]
  dedupe?: string[]
  preserveSymlinks?: boolean
}
```

**默认值**：

```javascript
{
  alias: {},
  extensions: ['.mjs', '.js', '.mts', '.cjs', '.cts', '.jsx', '.tsx', '.json'],
  mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
  conditions: [],
  dedupe: [],
  preserveSymlinks: false
}
```

## 子属性详解

### alias

**类型**：`Record<string, string> | Array<{ find: string | RegExp; replacement: string }>`

**默认值**：`{}`

定义路径别名，简化模块导入。

#### 对象形式

```javascript
// 简单别名
alias: {
  '@': '/src',
  '@components': '/src/components',
  '@assets': '/src/assets',
  '@utils': '/src/utils',
  '@api': '/src/api'
}

// 覆盖依赖路径
alias: {
  vue: 'vue/dist/vue.esm-bundler.js'  // 使用完整版 Vue
}

// 使用 path 模块
import path from 'path'
alias: {
  '@': path.resolve(__dirname, './src'),
  '@components': path.resolve(__dirname, './src/components')
}
```

#### 数组形式（正则表达式）

```javascript
// 单个正则别名
alias: [
  {
    find: /^@\/(.*)$/,
    replacement: '/src/$1'
  }
]

// 多个正则别名
alias: [
  {
    find: /^@components\/(.*)$/,
    replacement: path.resolve(__dirname, 'src/components/$1')
  },
  {
    find: /^@utils\/(.*)$/,
    replacement: path.resolve(__dirname, 'src/utils/$1')
  }
]

// 处理带扩展名的导入
alias: [
  {
    find: /\.vue$/,
    replacement: '.vue'
  }
]
```

### extensions

**类型**：`string[]`

**默认值**：`['.mjs', '.js', '.mts', '.cjs', '.cts', '.jsx', '.tsx', '.json']`

导入模块时自动尝试的扩展名列表。

```javascript
// 默认配置（通常不需要修改）
extensions: ['.mjs', '.js', '.mts', '.cjs', '.cts', '.jsx', '.tsx', '.json']

// 添加自定义扩展名
extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']

// 常用扩展名放在前面提高解析速度
extensions: ['.vue', '.js', '.ts', '.json']

// 仅包含需要的扩展名（性能优化）
extensions: ['.js', '.ts', '.json']
```

### mainFields

**类型**：`string[]`

**默认值**：`['module', 'jsnext:main', 'jsnext', 'browser', 'main']`

从 package.json 中读取的字段优先级。

```javascript
// 默认配置
mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main']

// 仅使用 ES Module
mainFields: ['module', 'browser']

// 仅使用 CommonJS
mainFields: ['main', 'browser']

// 自定义优先级
mainFields: ['browser', 'module', 'main']

// Node.js 环境
mainFields: ['module', 'main']
```

**package.json 示例**：

```json
{
  "name": "my-package",
  "module": "dist/index.esm.js",
  "main": "dist/index.cjs.js",
  "browser": "dist/index.browser.js"
}
```

### conditions

**类型**：`string[]`

**默认值**：`[]`（由 `build.target` 决定）

导出条件字段，用于 package.json 的 `exports` 字段解析。

```javascript
// 开发环境
conditions: ['development', 'module']

// 生产环境
conditions: ['production', 'module']

// 浏览器环境
conditions: ['browser', 'module']

// Node.js 环境
conditions: ['node', 'module']

// 多个条件
conditions: ['module', 'browser', 'production']
```

**对应的 package.json exports 示例**：

```json
{
  "exports": {
    ".": {
      "development": "./src/index.js",
      "production": "./dist/index.js",
      "browser": "./dist/browser.js",
      "node": "./dist/node.js",
      "default": "./dist/index.js"
    }
  }
}
```

### dedupe

**类型**：`string[]`

**默认值**：`[]`

去重，强制将特定依赖解析为同一副本。

```javascript
// Vue 生态去重
dedupe: ['vue', 'vue-router', 'pinia', '@vue/runtime-core']

// UI 库去重
dedupe: ['element-plus', 'element-plus/es']

// 多个依赖
dedupe: ['vue', 'vue-router', 'axios', 'lodash']
```

### preserveSymlinks

**类型**：`boolean`

**默认值**：`false`

是否保留符号链接。

```javascript
// 默认：解析符号链接的真实路径
preserveSymlinks: false

// 保留符号链接：使用符号链接路径
preserveSymlinks: true
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {},
    extensions: ['.mjs', '.js', '.mts', '.cjs', '.cts', '.jsx', '.tsx', '.json'],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
    conditions: [],
    dedupe: [],
    preserveSymlinks: false
  }
}
```

### 基础别名配置

```javascript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@views': path.resolve(__dirname, './src/views'),
      '@api': path.resolve(__dirname, './src/api')
    }
  }
})
```

### 正则别名配置

```javascript
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, './src/$1')
      }
    ]
  }
})
```

### Vue 完整版配置

```javascript
export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
})
```

### Monorepo 配置

```javascript
export default defineConfig({
  resolve: {
    // 解析 workspace 包
    alias: {
      '@workspace/package': path.resolve(__dirname, '../../packages/package/src')
    },
    // 去重共享依赖
    dedupe: ['vue', 'vue-router', 'pinia']
  }
})
```

## 生效后的结果示例

### 别名生效前

```javascript
// src/components/Header.vue 导入组件
import Button from '../../../components/Button.vue'
import { formatDate } from '../../../utils/date.js'
import logoUrl from '../../../assets/logo.png'
```

### 别名生效后

```javascript
// src/components/Header.vue 使用别名
import Button from '@components/Button.vue'
import { formatDate } from '@utils/date.js'
import logoUrl from '@assets/logo.png'

// 或者使用更简洁的路径
import Button from '@/components/Button.vue'
import { formatDate } from '@/utils/date.js'
```

### 扩展名解析

```javascript
// 配置前需要写扩展名
import { utils } from './utils/index.js'

// 配置 extensions 后可省略
import { utils } from './utils/index'
```

### dedupe 生效

```javascript
// 配置前：可能存在多个 Vue 副本
// node_modules/vue
// node_modules/dependency-a/node_modules/vue
// node_modules/dependency-b/node_modules/vue

// 配置后
dedupe: ['vue']
// 所有引用都指向同一个 Vue 副本
```

### conditions 生效

```javascript
// package.json
{
  "exports": {
    ".": {
      "development": "./dev.js",
      "production": "./prod.js"
    }
  }
}

// vite.config.js
resolve: {
  conditions: ['production']  // 使用 ./prod.js
}
```

## 使用场景

### 1. 简化导入路径

**场景**：深层级目录的模块导入路径冗长

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@api': '/src/api',
      '@hooks': '/src/hooks',
      '@store': '/src/store'
    }
  }
}
```

```javascript
// 使用前
import Button from '../../../../components/Button.vue'
import { fetchData } from '../../../../api/user.js'

// 使用后
import Button from '@components/Button.vue'
import { fetchData } from '@api/user.js'
```

### 2. Monorepo 项目

**场景**：Monorepo 中需要引用其他 workspace 包

```javascript
// vite.config.js
import path from 'path'

export default {
  resolve: {
    alias: {
      // UI 包
      '@my-app/ui': path.resolve(__dirname, '../../packages/ui/src'),
      // 工具包
      '@my-app/utils': path.resolve(__dirname, '../../packages/utils/src'),
      // 组件库
      '@my-app/components': path.resolve(__dirname, '../../packages/components/src')
    },
    dedupe: ['vue', 'vue-router', '@my-app/shared']
  }
}
```

### 3. Vue 完整版

**场景**：需要使用 Vue 模板编译器

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
}
```

### 4. TypeScript 项目

**场景**：TypeScript 项目配置类型支持

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue']
  }
})
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 5. 库开发

**场景**：开发 npm 库时配置模块解析

```javascript
// vite.config.js
export default {
  resolve: {
    // 优先使用 ES Module
    mainFields: ['module', 'browser', 'main'],
    // 支持多种扩展名
    extensions: ['.mjs', '.js', '.json', '.wasm'],
    // 导出条件
    conditions: ['module', 'browser']
  }
}
```

### 6. 条件导出

**场景**：根据环境使用不同代码

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      conditions: mode === 'development'
        ? ['development', 'module']
        : ['production', 'module']
    }
  }
})
```

```json
// package.json
{
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "production": "./dist/index.js",
      "module": "./dist/index.esm.js",
      "default": "./dist/index.js"
    }
  }
}
```

### 7. 符号链接处理

**场景**：使用 pnpm workspace 或 npm link

```javascript
// vite.config.js
export default {
  resolve: {
    // 保留符号链接路径
    preserveSymlinks: true
  }
}
```

## 注意事项

### 1. 别名路径格式

```javascript
// ✅ 正确：使用绝对路径
alias: {
  '@': path.resolve(__dirname, './src')
}

// ✅ 正确：以 / 开头表示项目根目录
alias: {
  '@': '/src'
}

// ❌ 错误：相对路径可能失效
alias: {
  '@': './src'
}
```

### 2. TypeScript 配置同步

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components'
    }
  }
}
```

```json
// tsconfig.json - 必须同步配置
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### 3. 扩展名顺序

```javascript
// ✅ 正确：常用扩展名放前面
extensions: ['.vue', '.js', '.ts', '.json']

// ❌ 错误：不常用的扩展名放前面会影响性能
extensions: ['.json', '.wasm', '.vue', '.js', '.ts']
```

### 4. 正则别名的特殊字符

```javascript
// ✅ 正确：转义特殊字符
alias: [
  {
    find: /^@components\/(.*)$/,
    replacement: '/src/components/$1'
  }
]

// ❌ 错误：未转义会导致匹配失败
alias: [
  {
    find: /^@components/(.*)$/,
    replacement: '/src/components/$1'
  }
]
```

### 5. dedupe 的性能影响

```javascript
// ⚠️ 谨慎使用：dedupe 会增加构建时的解析成本
dedupe: ['vue', 'vue-router', 'pinia']

// ✅ 建议：仅对确实需要去重的依赖使用
dedupe: ['vue']  // 只在出现多重副本问题时使用
```

### 6. 循环别名

```javascript
// ❌ 错误：可能导致循环引用
alias: {
  '@foo': '/src/foo',
  '@foo/bar': '/src/foo/bar'  // 重复定义
}

// ✅ 正确：使用更具体的模式
alias: {
  '@': '/src'
}
```

### 7. Vue 别名覆盖

```javascript
// ✅ 正确：明确指定 Vue 路径
alias: {
  vue: 'vue/dist/vue.esm-bundler.js'
}

// ⚠️ 注意：这会覆盖默认的 Vue 解析
// 仅在需要完整版 Vue 时使用
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `server.fs.strict` | 严格文件系统检查时，别名需要指向允许的目录 |
| `optimizeDeps` | `resolve.alias` 影响依赖预构建 |
| `build.rollupOptions.external` | 与 `resolve.dedupe` 配合处理外部依赖 |
| `css.preprocessorOptions` | CSS 预处理器的路径解析受 `resolve` 影响 |

## 完整示例

### 标准应用配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    // 路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store')
    },

    // 扩展名
    extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx', '.json'],

    // package.json 字段优先级
    mainFields: ['module', 'browser', 'main'],

    // 导出条件
    conditions: ['module', 'browser'],

    // Vue 生态去重
    dedupe: ['vue', '@vue/runtime-core']
  }
})
```

### TypeScript + Vue 配置

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types')
    },
    extensions: ['.ts', '.tsx', '.vue', '.js', '.jsx', '.json']
  }
})
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@types/*": ["src/types/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### Monorepo 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    // 内部包别名
    alias: {
      '@my-app/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@my-app/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@my-app/shared': path.resolve(__dirname, '../../packages/shared/src')
    },

    // 去重共享依赖
    dedupe: [
      'vue',
      'vue-router',
      'pinia',
      '@my-app/shared'
    ],

    // 扩展名
    extensions: ['.js', '.ts', '.json', '.vue'],

    // 优先 ES Module
    mainFields: ['module', 'browser', 'main']
  }
})
```

### 环境相关配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },

      // 开发环境优先 development 条件
      conditions: isDev
        ? ['development', 'module', 'browser']
        : ['production', 'module', 'browser'],

      // 开发环境保留符号链接便于调试
      preserveSymlinks: isDev
    }
  }
})
```

### 完整正则别名配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: [
      // 基础别名
      {
        find: /^@$/,
        replacement: path.resolve(__dirname, './src')
      },
      // 匹配 @/xxx/* 路径
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, './src/$1')
      },
      // 匹配 @components/xxx/*
      {
        find: /^@components\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/$1')
      },
      // 匹配 @utils/xxx/*
      {
        find: /^@utils\/(.*)$/,
        replacement: path.resolve(__dirname, './src/utils/$1')
      }
    ],

    extensions: ['.js', '.ts', '.vue', '.json'],
    mainFields: ['module', 'browser', 'main']
  }
})
```

## 常见问题

### 问题 1：别名不生效

**原因**：TypeScript 配置未同步

**解决**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]  // 必须与 Vite 配置一致
    }
  }
}
```

### 问题 2：Vue 模板编译报错

**原因**：使用的是运行时版本 Vue

**解决**：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'  // 使用完整版
    }
  }
}
```

### 问题 3：Monorepo 包找不到

**原因**：别名路径配置错误

**解决**：

```javascript
// ✅ 正确配置
alias: {
  '@my-package': path.resolve(__dirname, '../../packages/my-package/src')
}

// 检查路径是否正确
console.log(path.resolve(__dirname, '../../packages/my-package/src'))
```

### 问题 4：扩展名解析失败

**原因**：扩展名未添加到 `extensions` 列表

**解决**：

```javascript
export default {
  resolve: {
    extensions: ['.js', '.ts', '.vue', '.json', '.wasm']  // 添加所需扩展名
  }
}
```

## 官方文档

[Resolve Options: resolve - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#resolve-options)

[Module Resolution - Vite 官方文档](https://cn.vitejs.dev/guide/features.html#module-resolution)
