# resolve 配置

## 定义

`resolve` 配置模块解析行为，包括别名、扩展名、入口文件等。

## 属性层级结构

```
resolve
├── alias
│   └── {pattern} → string / { find, replacement }
├── extensions
├── mainFields
├── conditions
├── dedupe
└── preserveSymlinks
```

## 用法

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      'components': '/src/components'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    conditions: ['module', 'browser'],
    dedupe: ['vue', 'vue-router'],
    preserveSymlinks: false
  }
}
```

## 子属性详解

### alias

**类型**：`Record<string, string> | Array<{ find: string | RegExp; replacement: string }>`

定义路径别名，简化模块导入。

```javascript
// 对象形式 - 简单别名
alias: {
  '@': '/src',
  '@components': '/src/components',
  '@assets': '/src/assets',
  '@utils': '/src/utils'
}

// 对象形式 - 覆盖依赖
alias: {
  vue: 'vue/dist/vue.esm-bundler.js'  // 使用完整版 Vue
}

// 数组形式 - 正则表达式别名
alias: [
  {
    find: /^@(.*)$/,
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

// 使用 path 模块处理路径
import path from 'path'
alias: {
  '@': path.resolve(__dirname, './src'),
  '@components': path.resolve(__dirname, './src/components')
}

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

// 注意：常用扩展名放在前面可以提高解析速度
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

// 自定义条件
conditions: ['my-condition', 'module']
```

对应的 package.json exports 示例：
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

去重，强制将特定依赖解析为同一副本。

```javascript
// Vue 生态去重
dedupe: ['vue', 'vue-router', 'pinia', '@vue/runtime-core']

// UI 库去重
dedupe: ['element-plus', 'element-plus/es']

// 多个依赖
dedupe: [
  'vue',
  'vue-router',
  'axios',
  'lodash'
]

// 使用函数动态判断（不直接支持，可通过插件实现）
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

// 使用场景：Monorepo 中需要保留链接结构
```

## 作用

- 控制模块路径解析规则
- 简化导入路径
- 优化依赖解析性能
- 解决某些依赖的路径问题

## 使用场景

1. **路径别名**：使用 `@/components` 代替 `../../components`
2. **Monorepo**：配置工作空间依赖的解析
3. **依赖去重**：解决多重依赖导致的问题
4. **自定义模块解析**：特殊包的解析需求

## 注意事项

- 使用正则表达式定义别名时需要先引入 `path` 模块
- 别名路径应以 `/` 开头（绝对路径）或相对路径
- `extensions` 顺序影响解析性能，常用扩展名放前面
- `dedupe` 会影响构建性能，仅在必要时使用
- `preserveSymlinks: true` 可能导致某些依赖无法正常工作

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `server.fs.strict` | 严格文件系统检查时，别名需要指向允许的目录 |
| `optimizeDeps` | `resolve.alias` 影响依赖预构建 |
| `build.rollupOptions.external` | 与 `resolve.dedupe` 配合处理外部依赖 |

## 示例

```javascript
import { defineConfig } from 'vite'
import path from 'path'

// 基础配置
export default defineConfig({
  resolve: {
    // 路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api')
    },

    // 扩展名
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],

    // 导出条件
    conditions: ['production', 'module']
  }
})

// 正则别名配置
export default defineConfig({
  resolve: {
    alias: [
      // 匹配 @/ 开头的路径
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, './src/$1')
      },
      // 匹配 @assets/ 开头的路径
      {
        find: /^@assets\/(.*)$/,
        replacement: path.resolve(__dirname, './src/assets/$1')
      }
    ]
  }
})

// 完整配置
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.vue', '.js', '.ts', '.json'],
    mainFields: ['module', 'browser', 'main'],
    conditions: ['browser', 'module', 'production'],
    dedupe: ['vue', '@vue/runtime-core'],
    preserveSymlinks: false
  }
})

// Monorepo 配置
export default defineConfig({
  resolve: {
    // 解析 workspace 包
    alias: {
      '@workspace/package': path.resolve(__dirname, '../../packages/package/src')
    },
    // 去重共享依赖
    dedupe: [
      'vue',
      'vue-router',
      'pinia'
    ]
  }
})

// 不同环境不同配置
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    resolve: {
      conditions: isDev
        ? ['development', 'module']
        : ['production', 'module']
    }
  }
})
```
